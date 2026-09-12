import os
import sys
from datetime import datetime

import models
import schemas
from auth import require_authority
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

# Add worker directory to sys.path
worker_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "worker"))
if worker_dir not in sys.path:
    sys.path.append(worker_dir)

from simulator import run_civic_impact_simulation

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=list[schemas.IncidentResponse])
def list_incidents(
    bbox: str | None = None,
    category: str | None = None,
    min_severity: float | None = None,
    escalation_risk: str | None = None,
    status: str | None = None,
    include_resolved: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(models.Incident)

    if category:
        query = query.filter(models.Incident.issue_type == category)
    if min_severity is not None:
        query = query.filter(models.Incident.severity_score >= min_severity)
    if escalation_risk:
        query = query.filter(models.Incident.escalation_risk == escalation_risk)
    if status:
        query = query.filter(models.Incident.status == status)
    elif not include_resolved:
        query = query.filter(models.Incident.status != "resolved")
    if bbox:
        try:
            west, south, east, north = (float(value) for value in bbox.split(","))
        except ValueError:
            raise HTTPException(status_code=400, detail="bbox must be west,south,east,north")
        query = query.filter(
            models.Incident.longitude >= west,
            models.Incident.longitude <= east,
            models.Incident.latitude >= south,
            models.Incident.latitude <= north,
        )

    incidents = query.order_by(desc(models.Incident.severity_score), desc(models.Incident.updated_at)).all()
    return incidents

@router.get("/{incident_id}", response_model=schemas.IncidentDetail)
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    reports = db.query(models.Report).filter(models.Report.incident_id == incident_id).order_by(desc(models.Report.submitted_at)).all()
    
    # Query infrastructure impact join
    impact_rows = db.query(
        models.IncidentInfrastructureImpact, models.InfrastructurePoint
    ).join(
        models.InfrastructurePoint, models.IncidentInfrastructureImpact.infrastructure_id == models.InfrastructurePoint.id
    ).filter(
        models.IncidentInfrastructureImpact.incident_id == incident_id
    ).order_by(models.IncidentInfrastructureImpact.distance_meters.asc()).all()

    infra_impacts = [
        schemas.InfrastructureImpactResponse(
            infrastructure_id=infra.id,
            name=infra.name,
            category=infra.category,
            distance_meters=round(impact.distance_meters, 1),
            latitude=infra.latitude,
            longitude=infra.longitude
        )
        for impact, infra in impact_rows
    ]

    detail = schemas.IncidentDetail.from_orm(incident)
    detail.reports = [schemas.ReportResponse.from_orm(r) for r in reports]
    detail.infrastructure_impacts = infra_impacts

    return detail

@router.get("/{incident_id}/simulate", response_model=schemas.SimulationResponse)
def simulate_incident(
    incident_id: str,
    hours: int = Query(6, ge=1, le=72),
    db: Session = Depends(get_db)
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    try:
        simulation = run_civic_impact_simulation(db, incident_id, hours)
        return simulation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e!s}")

@router.patch("/{incident_id}/status", response_model=schemas.IncidentResponse)
def update_incident_status(
    incident_id: str,
    body: schemas.IncidentStatusUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_authority)
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if body.status not in ["open", "in_progress", "resolved"]:
        raise HTTPException(status_code=400, detail="Status must be 'open', 'in_progress', or 'resolved'")

    incident.status = body.status
    if body.status == "resolved" and incident.resolved_at is None:
        incident.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(incident)
    return incident
