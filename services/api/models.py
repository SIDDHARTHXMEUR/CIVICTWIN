import uuid
from datetime import datetime

from database import Base
from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.orm import relationship


def generate_uuid():
    return str(uuid.uuid4())

class Citizen(Base):
    __tablename__ = "citizens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    device_hash = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="citizen")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    citizen_id = Column(String(36), ForeignKey("citizens.id"), nullable=True)
    raw_text = Column(Text, nullable=True)
    photo_urls = Column(JSON, default=list) # Array of photo URLs or base64 strings
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # AI perception output
    issue_type = Column(String(100), nullable=True)
    ai_summary = Column(Text, nullable=True)
    severity_hint = Column(SmallInteger, nullable=True) # 1-5
    visible_evidence = Column(JSON, default=list)

    # Vector representations (JSON stored lists for SQLite fallback compatibility)
    text_embedding = Column(JSON, nullable=True)
    image_embedding = Column(JSON, nullable=True)

    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=True)
    processing_status = Column(String(50), default="pending") # pending | processed | failed

    citizen = relationship("Citizen", back_populates="reports")
    incident = relationship("Incident", back_populates="reports")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    issue_type = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geo_footprint = Column(JSON, nullable=True) # List of [lat, lng] coordinates forming bounding footprint/polygon
    
    first_reported_at = Column(DateTime, default=datetime.utcnow)
    last_reported_at = Column(DateTime, default=datetime.utcnow)

    report_count = Column(Integer, default=0)
    unique_citizen_count = Column(Integer, default=0)
    estimated_affected_population = Column(Integer, default=0)

    severity_score = Column(Float, default=0.0) # 0.0 - 100.0
    severity_breakdown = Column(JSON, default=dict) # {reports: x, infra: y, growth: z, ...}

    root_cause = Column(Text, nullable=True)
    root_cause_confidence = Column(Float, default=0.0)
    root_cause_evidence = Column(JSON, default=list)

    growth_velocity = Column(Float, default=0.0) # reports per hour
    escalation_risk = Column(String(50), default="low") # low | medium | high | critical
    escalation_confidence = Column(Float, default=0.0)

    ai_summary = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)

    status = Column(String(50), default="open") # open | in_progress | resolved
    # Server-stamped when an authority first marks the incident resolved.
    resolved_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reports = relationship("Report", back_populates="incident")
    infrastructure_impacts = relationship("IncidentInfrastructureImpact", back_populates="incident", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="incident", cascade="all, delete-orphan")

class InfrastructurePoint(Base):
    __tablename__ = "infrastructure_points"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # school | hospital | transit | major_road | power | water
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    impacts = relationship("IncidentInfrastructureImpact", back_populates="infrastructure_point")

class IncidentInfrastructureImpact(Base):
    __tablename__ = "incident_infrastructure_impact"

    incident_id = Column(String(36), ForeignKey("incidents.id"), primary_key=True)
    infrastructure_id = Column(String(36), ForeignKey("infrastructure_points.id"), primary_key=True)
    distance_meters = Column(Float, nullable=False)

    incident = relationship("Incident", back_populates="infrastructure_impacts")
    infrastructure_point = relationship("InfrastructurePoint", back_populates="impacts")

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=False)
    horizon_hours = Column(Integer, nullable=False) # 6, 12, 24
    projected_affected_population = Column(Integer, nullable=False)
    projected_traffic_disruption = Column(String(50), nullable=False) # none | moderate | severe
    projected_escalation_probability = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="simulations")
