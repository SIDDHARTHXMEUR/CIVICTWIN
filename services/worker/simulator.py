import logging
import math
import os
from datetime import datetime

import models
from sqlalchemy.orm import Session

logger = logging.getLogger("civictwin.simulator")

def run_civic_impact_simulation(db: Session, incident_id: str, horizon_hours: int) -> models.Simulation:
    """Step 9: Civic Impact Simulator execution."""
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise ValueError(f"Incident {incident_id} not found")

    # 1. Project forward report count using growth velocity (linear/extrapolation, capped)
    current_velocity = max(0.5, incident.growth_velocity or 1.0)
    projected_additional_reports = int(current_velocity * horizon_hours)
    projected_report_count = incident.report_count + projected_additional_reports

    # 2. Recompute estimated affected population for projected footprint
    # Base radius expands with square root of report count ratio
    growth_ratio = math.sqrt(projected_report_count / max(1, incident.report_count))
    base_population = incident.estimated_affected_population or 200
    projected_affected_pop = int(base_population * growth_ratio)

    # 3. Check road/transit infrastructure proximity for traffic disruption
    impacted_infra = db.query(models.IncidentInfrastructureImpact).join(
        models.InfrastructurePoint
    ).filter(models.IncidentInfrastructureImpact.incident_id == incident_id).all()

    has_major_road_or_transit = False
    for imp in impacted_infra:
        cat = imp.infrastructure_point.category
        if cat in ["major_road", "transit"] and imp.distance_meters <= 500:
            has_major_road_or_transit = True
            break

    if has_major_road_or_transit and horizon_hours >= 12:
        traffic_disruption = "severe"
    elif has_major_road_or_transit or horizon_hours >= 6:
        traffic_disruption = "moderate"
    else:
        traffic_disruption = "none"

    # 4. Projected escalation probability
    base_prob = min(0.95, (incident.severity_score / 100.0) + (horizon_hours * 0.02))
    escalation_prob = round(base_prob, 3)

    # 5. Reasoning sentence (LLM or deterministic fallback)
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    reasoning = None

    if anthropic_key and len(anthropic_key.strip()) > 10:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=anthropic_key)
            prompt = f"Write one concise technical reasoning sentence for a civic simulation: Incident {incident.issue_type}, horizon {horizon_hours}h, projected affected pop {projected_affected_pop}, traffic disruption '{traffic_disruption}', escalation prob {escalation_prob}."
            resp = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=100,
                messages=[{"role": "user", "content": prompt}]
            )
            reasoning = resp.content[0].text.strip()
        except Exception as e:
            logger.warning(f"LLM reasoning failed: {e}")

    if not reasoning:
        reasoning = f"Over a {horizon_hours}-hour horizon, unresolved {incident.issue_type.replace('_', ' ')} will compound report volume to ~{projected_report_count}, potentially impacting {projected_affected_pop:,} residents with {traffic_disruption} traffic disruption risk."

    simulation = models.Simulation(
        incident_id=incident_id,
        horizon_hours=horizon_hours,
        projected_affected_population=projected_affected_pop,
        projected_traffic_disruption=traffic_disruption,
        projected_escalation_probability=escalation_prob,
        reasoning=reasoning,
        created_at=datetime.utcnow()
    )

    db.add(simulation)
    db.commit()
    db.refresh(simulation)

    return simulation
