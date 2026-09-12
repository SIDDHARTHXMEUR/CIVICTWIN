import models
import schemas
from auth import create_access_token
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.Token)
def register_citizen(req: schemas.CitizenAuthRequest, db: Session = Depends(get_db)):
    citizen = db.query(models.Citizen).filter(models.Citizen.device_hash == req.device_hash).first()
    if not citizen:
        citizen = models.Citizen(device_hash=req.device_hash)
        db.add(citizen)
        db.commit()
        db.refresh(citizen)
    
    token = create_access_token({"sub": citizen.id, "role": "citizen"})
    return schemas.Token(access_token=token, role="citizen", user_id=citizen.id)

@router.post("/login", response_model=schemas.Token)
def login_authority(req: schemas.AuthorityLoginRequest, db: Session = Depends(get_db)):
    # Standard dev credentials for authority login
    if req.username == "admin" and req.password == "admin123":
        token = create_access_token({"sub": "auth-admin-1", "role": "authority"})
        return schemas.Token(access_token=token, role="authority", user_id="auth-admin-1")
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. Use admin / admin123"
    )
