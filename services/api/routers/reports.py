import os
import sys
from datetime import datetime

import models
import schemas
from database import get_db
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session

# Add worker directory to sys.path if not present
worker_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "worker"))
if worker_dir not in sys.path:
    sys.path.append(worker_dir)

from tasks import process_report_task

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=schemas.ReportResponse)
async def submit_report(
    request: Request,
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    """Accept JSON for the web client and multipart/form-data for camera uploads."""
    content_type = request.headers.get("content-type", "")
    try:
        if content_type.startswith("multipart/"):
            form = await request.form()
            photos = form.getlist("photos")
            upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
            os.makedirs(upload_dir, exist_ok=True)
            photo_urls = []
            for photo in photos[:3]:
                if not getattr(photo, "filename", None):
                    continue
                safe_name = f"{datetime.utcnow().timestamp()}_{os.path.basename(photo.filename)}"
                destination = os.path.join(upload_dir, safe_name)
                with open(destination, "wb") as output:
                    output.write(await photo.read())
                photo_urls.append(f"/uploads/{safe_name}")
            req = schemas.ReportCreate(
                device_hash=str(form.get("device_hash", "")), raw_text=str(form.get("raw_text", "")),
                latitude=float(form.get("latitude")), longitude=float(form.get("longitude")), photo_urls=photo_urls
            )
        else:
            req = schemas.ReportCreate(**(await request.json()))
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=f"Invalid report submission: {exc}")
    # Ensure citizen exists
    citizen = db.query(models.Citizen).filter(models.Citizen.device_hash == req.device_hash).first()
    if not citizen:
        citizen = models.Citizen(device_hash=req.device_hash)
        db.add(citizen)
        db.commit()
        db.refresh(citizen)

    report = models.Report(
        citizen_id=citizen.id,
        raw_text=req.raw_text,
        photo_urls=req.photo_urls or [],
        latitude=req.latitude,
        longitude=req.longitude,
        submitted_at=datetime.utcnow(),
        processing_status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Immediately trigger pipeline processing
    background_tasks.add_task(process_report_task, report.id)

    return report

@router.get("/{report_id}", response_model=schemas.ReportResponse)
def get_report_status(report_id: str, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
