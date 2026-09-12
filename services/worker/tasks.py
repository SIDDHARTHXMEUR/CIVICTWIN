import asyncio
import logging
import math
from datetime import datetime, timedelta

import models
from database import SessionLocal
from pipeline import (
    DEDUP_RADIUS_M,
    DEDUP_THRESHOLD,
    calculate_composite_similarity,
    compute_escalation_risk,
    compute_image_embedding,
    compute_severity_score,
    compute_text_embedding,
    generate_summary_and_action,
    haversine_distance,
    infer_root_cause,
    run_perception,
)
from realtime import manager

logger = logging.getLogger("civictwin.worker")

def process_report_task(report_id: str):
    """
    Core pipeline runner task for a single report.
    Executed synchronously or via Celery worker.
    """
    db = SessionLocal()
    try:
        report = db.query(models.Report).filter(models.Report.id == report_id).first()
        if not report:
            logger.error(f"Report {report_id} not found in database.")
            return

        logger.info(f"Processing report {report_id}...")

        # Step 1: Perception
        perception = run_perception(report.raw_text, report.photo_urls or [])
        report.issue_type = perception["issue_type"]
        report.ai_summary = perception["summary"]
        report.severity_hint = perception["severity_hint"]
        report.visible_evidence = perception["visible_evidence"]

        # Step 2: Embedding
        # Keep the observed text, summary, and the perception classification together.
        # Repeating the class token gives the lightweight local fallback a stable
        # semantic anchor when two citizens describe the same problem differently.
        semantic_text = f"{(report.issue_type + ' ') * 128}{report.raw_text} {report.ai_summary}"
        report.text_embedding = compute_text_embedding(semantic_text)
        report.image_embedding = compute_image_embedding(report.photo_urls or [])
        db.commit()

        # Step 3: Duplicate / Similarity Detection
        # Search open incidents within last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        open_incidents = db.query(models.Incident).filter(
            models.Incident.status != "resolved",
            models.Incident.last_reported_at >= seven_days_ago
        ).all()

        best_match_incident = None
        highest_similarity = 0.0

        for inc in open_incidents:
            # Quick issue_type check
            if inc.issue_type != report.issue_type:
                continue

            # Quick distance check (must be within 300m)
            dist_m = haversine_distance(report.latitude, report.longitude, inc.latitude, inc.longitude)
            if dist_m > DEDUP_RADIUS_M:
                continue

            # Get representative embeddings from recent report in incident
            recent_report = db.query(models.Report).filter(models.Report.incident_id == inc.id).order_by(models.Report.submitted_at.desc()).first()
            inc_text_emb = recent_report.text_embedding if recent_report else []
            inc_img_emb = recent_report.image_embedding if recent_report else []

            sim = calculate_composite_similarity(
                report.text_embedding,
                report.image_embedding,
                report.latitude,
                report.longitude,
                report.submitted_at or datetime.utcnow(),
                inc_text_emb,
                inc_img_emb,
                inc.latitude,
                inc.longitude,
                inc.last_reported_at or datetime.utcnow()
            )

            if sim > highest_similarity:
                highest_similarity = sim
                best_match_incident = inc

        if best_match_incident and highest_similarity >= DEDUP_THRESHOLD:
            # Attach to existing incident
            report.incident_id = best_match_incident.id
            incident = best_match_incident
            logger.info(f"Report {report_id} merged into existing Incident {incident.id} (similarity: {highest_similarity:.2f})")
        else:
            # Create new incident
            incident = models.Incident(
                issue_type=report.issue_type,
                latitude=report.latitude,
                longitude=report.longitude,
                first_reported_at=report.submitted_at or datetime.utcnow(),
                last_reported_at=report.submitted_at or datetime.utcnow(),
                status="open"
            )
            db.add(incident)
            db.flush()
            report.incident_id = incident.id
            logger.info(f"Created new Incident {incident.id} for report {report_id}")

        report.processing_status = "processed"
        db.commit()

        # Step 4: Incident Aggregate Update
        member_reports = db.query(models.Report).filter(models.Report.incident_id == incident.id).all()
        incident.report_count = len(member_reports)
        
        unique_citizens = {r.citizen_id for r in member_reports if r.citizen_id}
        incident.unique_citizen_count = len(unique_citizens) or 1

        # Centroid calculation
        if member_reports:
            avg_lat = sum(r.latitude for r in member_reports) / len(member_reports)
            avg_lng = sum(r.longitude for r in member_reports) / len(member_reports)
            incident.latitude = avg_lat
            incident.longitude = avg_lng
            
            # Convex footprint coordinates [[lat, lng], ...]
            incident.geo_footprint = [[r.latitude, r.longitude] for r in member_reports]
            
            # Last reported at
            incident.last_reported_at = max(r.submitted_at for r in member_reports)

        # Growth velocity (reports in last 6 hours / 6)
        six_hours_ago = datetime.utcnow() - timedelta(hours=6)
        reports_last_6h = [r for r in member_reports if r.submitted_at and r.submitted_at >= six_hours_ago]
        incident.growth_velocity = len(reports_last_6h) / 6.0

        # Estimated affected population heuristic (area footprint * ward density)
        # Standard Delhi ward density estimate: ~15,000 people per sq km
        if len(member_reports) > 1:
            max_dist = max(haversine_distance(incident.latitude, incident.longitude, r.latitude, r.longitude) for r in member_reports)
            radius_km = max(0.1, max_dist / 1000.0)
            area_sq_km = math.pi * (radius_km ** 2)
            incident.estimated_affected_population = int(area_sq_km * 15000)
        else:
            incident.estimated_affected_population = 150 # default single-report baseline radius

        # Step 8: Infrastructure Impact Join
        infra_points = db.query(models.InfrastructurePoint).all()
        nearest_infra_dist = 99999.0
        infra_names = []

        # Clear old impacts
        db.query(models.IncidentInfrastructureImpact).filter(models.IncidentInfrastructureImpact.incident_id == incident.id).delete()

        for infra in infra_points:
            dist_m = haversine_distance(incident.latitude, incident.longitude, infra.latitude, infra.longitude)
            if dist_m <= 1000: # within 1km
                impact = models.IncidentInfrastructureImpact(
                    incident_id=incident.id,
                    infrastructure_id=infra.id,
                    distance_meters=dist_m
                )
                db.add(impact)
                nearest_infra_dist = min(nearest_infra_dist, dist_m)
                infra_names.append(infra.name)

        # Step 5: Deterministic Severity Scoring
        score, breakdown = compute_severity_score(
            incident.report_count,
            incident.unique_citizen_count,
            incident.issue_type,
            nearest_infra_dist,
            incident.growth_velocity
        )
        incident.severity_score = score
        incident.severity_breakdown = breakdown

        # Step 6: Root Cause Inference
        all_evidence = []
        for r in member_reports:
            if r.visible_evidence:
                all_evidence.extend(r.visible_evidence)
        root_cause, root_conf, root_evid = infer_root_cause(incident.issue_type, list(set(all_evidence)))
        incident.root_cause = root_cause
        incident.root_cause_confidence = root_conf
        incident.root_cause_evidence = root_evid

        # Step 7: Escalation Risk
        esc_risk, esc_conf = compute_escalation_risk(incident.growth_velocity, incident.severity_score)
        incident.escalation_risk = esc_risk
        incident.escalation_confidence = esc_conf

        # Step 10: Summary & Action
        summary, action = generate_summary_and_action(
            incident.issue_type,
            incident.report_count,
            incident.severity_score,
            incident.root_cause,
            infra_names
        )
        incident.ai_summary = summary
        incident.recommended_action = action
        incident.updated_at = datetime.utcnow()

        db.commit()
        # Notify dashboard subscribers only after all deterministic aggregate fields
        # and AI-derived evidence have been persisted.
        asyncio.run(manager.broadcast({"type": "incident_updated", "incident_id": incident.id}))
        logger.info(f"Pipeline successfully completed for Incident {incident.id}. Severity score: {incident.severity_score}")

    except Exception as e:
        logger.error(f"Error processing report {report_id}: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()
