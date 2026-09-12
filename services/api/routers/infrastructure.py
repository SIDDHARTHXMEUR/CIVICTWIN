
import models
import schemas
from database import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/infrastructure", tags=["Infrastructure"])

@router.get("", response_model=list[schemas.InfrastructurePointResponse])
def list_infrastructure(db: Session = Depends(get_db)):
    points = db.query(models.InfrastructurePoint).all()
    return points
