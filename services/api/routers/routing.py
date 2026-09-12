from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import math

router = APIRouter(prefix="/api/v1/routing", tags=["routing"])

class DispatchRequest(BaseModel):
    incident_id: str
    lat: float
    lng: float
    incident_type: str
    severity: str

class RouteWaypoint(BaseModel):
    step: int
    instruction: str
    lat: float
    lng: float

class DispatchResponse(BaseModel):
    incident_id: str
    assigned_crew_unit: str
    unit_id: str
    estimated_arrival_minutes: int
    optimal_route_waypoints: List[RouteWaypoint]
    required_equipment: List[str]
    traffic_delay_factor: str

@router.post("/optimal-crew-dispatch", response_model=DispatchResponse)
def calculate_optimal_crew_dispatch(req: DispatchRequest):
    # Simulated VRPTW algorithm logic based on location & type
    if "water" in req.incident_type.lower() or "pipe" in req.incident_type.lower() or "flood" in req.incident_type.lower():
        unit_name = "Rapid Hydro Repair Squad #4"
        unit_id = "HYDRO-SQUAD-04"
        eta = 8
        equipment = ["High-Capacity De-watering Pump", "Sub-surface Pipe Acoustic Detector", "Hydraulic Pipe Clamp"]
    elif "power" in req.incident_type.lower() or "electric" in req.incident_type.lower() or "transformer" in req.incident_type.lower():
        unit_name = "High-Voltage Emergency Response Unit #2"
        unit_id = "POWER-ERU-02"
        eta = 6
        equipment = ["Dielectric Insulation Gear", "Thermal Infrared Camera", "SF6 Breaker Kit"]
    else:
        unit_name = "Municipal Emergency Taskforce #1"
        unit_id = "CIVIC-TASKFORCE-01"
        eta = 11
        equipment = ["Hazardous Debris Remover", "Mobile Traffic Control Barrier", "Emergency Comms Array"]

    # Generate 4 waypoints ending at incident coords
    start_lat = req.lat + 0.012
    start_lng = req.lng - 0.015
    
    waypoints = [
        RouteWaypoint(step=1, instruction="Depart Municipal Logistics Depot Gate 3", lat=start_lat, lng=start_lng),
        RouteWaypoint(step=2, instruction="Take Arterial Bypass 4 — Priority Green Corridor", lat=start_lat - 0.005, lng=start_lng + 0.005),
        RouteWaypoint(step=3, instruction="Turn East onto Ring Road Sector 7", lat=start_lat - 0.009, lng=start_lng + 0.010),
        RouteWaypoint(step=4, instruction="Arrive at Target Incident Zone & Deploy Crew", lat=req.lat, lng=req.lng)
    ]

    return DispatchResponse(
        incident_id=req.incident_id,
        assigned_crew_unit=unit_name,
        unit_id=unit_id,
        estimated_arrival_minutes=eta,
        optimal_route_waypoints=waypoints,
        required_equipment=equipment,
        traffic_delay_factor="Minimal (Emergency Signal Priority Active)"
    )
