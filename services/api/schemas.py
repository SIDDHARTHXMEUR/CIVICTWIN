from datetime import datetime
from typing import Any

from pydantic import BaseModel


# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str

class CitizenAuthRequest(BaseModel):
    device_hash: str

class AuthorityLoginRequest(BaseModel):
    username: str
    password: str

# --- Infrastructure Schemas ---
class InfrastructurePointResponse(BaseModel):
    id: str
    name: str
    category: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True

class InfrastructureImpactResponse(BaseModel):
    infrastructure_id: str
    name: str
    category: str
    distance_meters: float
    latitude: float
    longitude: float

# --- Report Schemas ---
class ReportCreate(BaseModel):
    device_hash: str
    raw_text: str
    photo_urls: list[str] | None = []
    latitude: float
    longitude: float

class ReportResponse(BaseModel):
    id: str
    citizen_id: str | None = None
    raw_text: str | None = None
    photo_urls: list[str] = []
    latitude: float
    longitude: float
    submitted_at: datetime
    issue_type: str | None = None
    ai_summary: str | None = None
    severity_hint: int | None = None
    incident_id: str | None = None
    processing_status: str

    class Config:
        from_attributes = True

# --- Simulation Schemas ---
class SimulationResponse(BaseModel):
    id: str
    incident_id: str
    horizon_hours: int
    projected_affected_population: int
    projected_traffic_disruption: str
    projected_escalation_probability: float
    reasoning: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Incident Schemas ---
class IncidentResponse(BaseModel):
    id: str
    issue_type: str
    latitude: float
    longitude: float
    geo_footprint: list[list[float]] | None = None
    first_reported_at: datetime
    last_reported_at: datetime
    report_count: int
    unique_citizen_count: int
    estimated_affected_population: int
    severity_score: float
    severity_breakdown: dict[str, Any] = {}
    root_cause: str | None = None
    root_cause_confidence: float | None = None
    root_cause_evidence: list[str] = []
    growth_velocity: float
    escalation_risk: str
    escalation_confidence: float | None = None
    ai_summary: str | None = None
    recommended_action: str | None = None
    status: str
    resolved_at: datetime | None = None
    updated_at: datetime

    class Config:
        from_attributes = True

class IncidentDetail(IncidentResponse):
    reports: list[ReportResponse] = []
    infrastructure_impacts: list[InfrastructureImpactResponse] = []

class IncidentStatusUpdate(BaseModel):
    status: str # open | in_progress | resolved
