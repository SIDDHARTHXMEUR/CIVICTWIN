import os
import sys
from datetime import datetime, timedelta

# Add services/api and services/worker to sys.path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
api_dir = os.path.join(base_dir, "services", "api")
worker_dir = os.path.join(base_dir, "services", "worker")

for d in [api_dir, worker_dir]:
    if d not in sys.path:
        sys.path.append(d)

import models
from database import Base, SessionLocal, engine
from tasks import process_report_task


def seed_database():
    print("Recreating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Clear existing data
        db.query(models.Simulation).delete()
        db.query(models.IncidentInfrastructureImpact).delete()
        db.query(models.Report).delete()
        db.query(models.Incident).delete()
        db.query(models.InfrastructurePoint).delete()
        db.query(models.Citizen).delete()
        db.commit()

        print("Seeding infrastructure points around NIT Delhi...")
        infra_list = [
            models.InfrastructurePoint(
                name="NIT Delhi Main Academic Block",
                category="school",
                latitude=28.8427,
                longitude=77.1048
            ),
            models.InfrastructurePoint(
                name="Satyawadi Raja Harish Chandra Govt Hospital",
                category="hospital",
                latitude=28.8475,
                longitude=77.1022
            ),
            models.InfrastructurePoint(
                name="Narela Railway & Bus Terminal",
                category="transit",
                latitude=28.8521,
                longitude=77.0945
            ),
            models.InfrastructurePoint(
                name="GT Karnal Road Arterial Expressway",
                category="major_road",
                latitude=28.8390,
                longitude=77.1120
            ),
            models.InfrastructurePoint(
                name="Singhu Border Transit Checkpoint",
                category="transit",
                latitude=28.8650,
                longitude=77.1230
            )
        ]
        db.add_all(infra_list)
        db.commit()

        # 2. Seed realistic test citizens
        c1 = models.Citizen(device_hash="device_citizen_alpha_01")
        c2 = models.Citizen(device_hash="device_citizen_beta_02")
        c3 = models.Citizen(device_hash="device_citizen_gamma_03")
        c4 = models.Citizen(device_hash="device_citizen_delta_04")
        db.add_all([c1, c2, c3, c4])
        db.commit()

        # 3. Seed sample citizen reports around 3 realistic clusters
        print("Inserting sample citizen complaint reports...")

        sample_reports = [
            # Cluster 1: Heavy Drainage Blockage near NIT Delhi & Hospital
            {
                "citizen_id": c1.id,
                "raw_text": "Severe stormwater drain blockage causing deep standing water outside NIT Delhi main gate. Traffic is heavily backed up.",
                "latitude": 28.8429,
                "longitude": 77.1050,
                "photo_urls": ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80"],
                "hours_ago": 5
            },
            {
                "citizen_id": c2.id,
                "raw_text": "Water overflowing from municipal sewer near Raja Harish Chandra Hospital entrance. Smells terrible and blocking pedestrian access.",
                "latitude": 28.8432,
                "longitude": 77.1045,
                "photo_urls": ["https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&q=80"],
                "hours_ago": 4
            },
            {
                "citizen_id": c3.id,
                "raw_text": "Massive puddle and clogged drain right in front of college bus stop. Buses cannot pull up to curb.",
                "latitude": 28.8425,
                "longitude": 77.1052,
                "photo_urls": ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80"],
                "hours_ago": 2
            },
            {
                "citizen_id": c4.id,
                "raw_text": "Flooded street near NIT Delhi library block entrance. Water rising quickly due to clogged drain pipe.",
                "latitude": 28.8428,
                "longitude": 77.1049,
                "photo_urls": ["https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&q=80"],
                "hours_ago": 1
            },

            # Cluster 2: Deep Pothole Crater Cluster on GT Karnal Expressway
            {
                "citizen_id": c1.id,
                "raw_text": "Dangerous crater pothole on GT Karnal Road near Narela turnoff. Two cars blew tires this morning!",
                "latitude": 28.8392,
                "longitude": 77.1122,
                "photo_urls": ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80"],
                "hours_ago": 12
            },
            {
                "citizen_id": c2.id,
                "raw_text": "Sunken road surface and severe asphalt cracking near GT Karnal flyover. High accident risk at night.",
                "latitude": 28.8388,
                "longitude": 77.1118,
                "photo_urls": ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80"],
                "hours_ago": 8
            },

            # Cluster 3: Overflowing Garbage Dumping Hazard near Narela Transit Station
            {
                "citizen_id": c3.id,
                "raw_text": "Huge pile of uncollected garbage spilling onto the main road outside Narela Station. Stray animals scattering waste everywhere.",
                "latitude": 28.8523,
                "longitude": 77.0947,
                "photo_urls": ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80"],
                "hours_ago": 24
            },
            {
                "citizen_id": c4.id,
                "raw_text": "Sanitation dump bin overflowed 3 days ago, nobody has cleared it. Foul odor affecting nearby shops.",
                "latitude": 28.8519,
                "longitude": 77.0942,
                "photo_urls": ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80"],
                "hours_ago": 18
            }
        ]

        report_ids = []
        for r_data in sample_reports:
            submitted_time = datetime.utcnow() - timedelta(hours=r_data["hours_ago"])
            rep = models.Report(
                citizen_id=r_data["citizen_id"],
                raw_text=r_data["raw_text"],
                latitude=r_data["latitude"],
                longitude=r_data["longitude"],
                photo_urls=r_data["photo_urls"],
                submitted_at=submitted_time,
                processing_status="pending"
            )
            db.add(rep)
            db.commit()
            db.refresh(rep)
            report_ids.append(rep.id)

        print(f"Inserted {len(report_ids)} reports. Running pipeline worker tasks...")
        for r_id in report_ids:
            process_report_task(r_id)

        incidents_created = db.query(models.Incident).all()
        print(f"Successfully processed reports into {len(incidents_created)} consolidated Incidents!")
        for inc in incidents_created:
            print(f" -> Incident {inc.id[:8]}: Type={inc.issue_type}, Severity={inc.severity_score}, Risk={inc.escalation_risk}, Reports={inc.report_count}")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
