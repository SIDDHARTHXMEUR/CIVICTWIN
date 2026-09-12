from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter(prefix="/api/v1/simulation", tags=["simulation"])

class ScenarioRequest(BaseModel):
    scenario_type: str  # 'monsoon_flood' | 'power_cascade' | 'traffic_gridlock'
    intensity: Optional[float] = 1.0

class AffectedZone(BaseModel):
    zone_id: str
    zone_name: str
    risk_level: str
    predicted_impact: str
    suggested_action: str

class ScenarioResponse(BaseModel):
    scenario_type: str
    status: str
    severity_multiplier: float
    affected_zones: List[AffectedZone]
    cascading_risk_score: int
    recommended_mitigation: str

@router.post("/scenario", response_model=ScenarioResponse)
def run_simulation_scenario(req: ScenarioRequest):
    stype = req.scenario_type.lower()
    
    if stype == "monsoon_flood":
        return ScenarioResponse(
            scenario_type="monsoon_flood",
            status="active_simulation",
            severity_multiplier=1.85,
            affected_zones=[
                AffectedZone(
                    zone_id="ZONE-NORTH",
                    zone_name="Jaipur North Drainage Basin",
                    risk_level="CRITICAL",
                    predicted_impact="Flash waterlogging in 12 low-lying intersections within 18 minutes",
                    suggested_action="Activate emergency stormwater pumps & reroute traffic"
                ),
                AffectedZone(
                    zone_id="ZONE-CENTRAL",
                    zone_name="Old City Aqueduct Node",
                    risk_level="WARNING",
                    predicted_impact="Pressure surge exceeding 8.2 bar in legacy underground pipes",
                    suggested_action="Open relief pressure valves at Station 04"
                )
            ],
            cascading_risk_score=88,
            recommended_mitigation="PREEMPTIVE PUMP ACTIVATION & FLUID DIVERSION VIA GATEWAY PUMP #2"
        )
    elif stype == "power_cascade":
        return ScenarioResponse(
            scenario_type="power_cascade",
            status="active_simulation",
            severity_multiplier=2.10,
            affected_zones=[
                AffectedZone(
                    zone_id="SUBSTATION-09",
                    zone_name="Malviya Nagar High-Voltage Node",
                    risk_level="CRITICAL",
                    predicted_impact="Transformer thermal overload trip imminent (94°C)",
                    suggested_action="Shed 15MW non-essential industrial load"
                ),
                AffectedZone(
                    zone_id="GRID-FEED-03",
                    zone_name="Hospital Feeder Line B",
                    risk_level="HIGH_ALERT",
                    predicted_impact="Automatic failover to backup diesel generators within 45s",
                    suggested_action="Isolate feeder segment and activate microgrid solar battery storage"
                )
            ],
            cascading_risk_score=92,
            recommended_mitigation="LOAD SHEDDING AT INDUSTRIAL FEEDER + MICROGRID SWITCHING"
        )
    elif stype == "traffic_gridlock":
        return ScenarioResponse(
            scenario_type="traffic_gridlock",
            status="active_simulation",
            severity_multiplier=1.45,
            affected_zones=[
                AffectedZone(
                    zone_id="CORRIDOR-MI-ROAD",
                    zone_name="M.I. Road Arterial Transit",
                    risk_level="HIGH_ALERT",
                    predicted_impact="Average speed dropping below 6 km/h. Emergency dispatch delay +14 mins",
                    suggested_action="Override traffic signal phase timing to 90s priority green waves"
                )
            ],
            cascading_risk_score=74,
            recommended_mitigation="ACTIVATE GREEN WAVE TRAFFIC OVERRIDE FOR EMERGENCY CORRIDOR"
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario type: {req.scenario_type}")
