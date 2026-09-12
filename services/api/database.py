import math
import os

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./civictwin.db")

# Convert postgresql:// to postgresql+psycopg2:// if needed
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

# Add custom spatial distance functions for SQLite fallback
@event.listens_for(engine, "connect")
def connect_sqlite(dbapi_connection, connection_record):
    if "sqlite" in DATABASE_URL:
        # Define haversine distance in SQLite
        def haversine(lat1, lon1, lat2, lon2):
            if any(v is None for v in [lat1, lon1, lat2, lon2]):
                return 0.0
            r = 6371000  # meters
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            dphi = math.radians(lat2 - lat1)
            dlambda = math.radians(lon2 - lon1)
            a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
            return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        dbapi_connection.create_function("haversine_distance", 4, haversine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_schema_compatibility():
    """Apply additive migrations for existing local demo databases."""
    with engine.begin() as connection:
        if "sqlite" in DATABASE_URL:
            columns = {row[1] for row in connection.execute(text("PRAGMA table_info(incidents)"))}
            if "resolved_at" not in columns:
                connection.execute(text("ALTER TABLE incidents ADD COLUMN resolved_at DATETIME"))
        else:
            connection.execute(text("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
