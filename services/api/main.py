import sys
import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base, SessionLocal, ensure_schema_compatibility
import models
from routers import auth, reports, incidents, infrastructure, geocode, simulation, routing
from realtime import manager

# Auto-create tables
Base.metadata.create_all(bind=engine)
ensure_schema_compatibility()

app = FastAPI(
    title="CivicTwin API",
    description="AI Urban Intelligence Layer for Responsive Cities — Spatial Digital Twin Engine",
    version="1.0.0"
)

# CORS middleware for citizen app and authority dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "uploads"), check_dir=False), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(incidents.router)
app.include_router(infrastructure.router)
app.include_router(geocode.router)
app.include_router(simulation.router)
app.include_router(routing.router)

@app.websocket("/ws/incidents")
async def websocket_incidents(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open & receive heartbeat
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong", "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "CivicTwin AI Engine",
        "location": "Jaipur Metro Node (26.9124° N, 75.7873° E)",
        "docs": "/docs"
    }

@app.on_event("startup")
def startup_seed_check():
    """Ensure infrastructure points & sample incidents are seeded on startup if empty."""
    db = SessionLocal()
    try:
        inc_count = db.query(models.Incident).count()
        if inc_count == 0:
            print("Auto-seeding sample Jaipur municipal reports and incidents on startup...")
            try:
                # Add seed directory to sys.path
                seed_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "infra", "seed_data"))
                if seed_dir not in sys.path:
                    sys.path.append(seed_dir)
                from seed import seed_database  # type: ignore
                seed_database()
            except Exception as e:
                print(f"Startup seed warning: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
