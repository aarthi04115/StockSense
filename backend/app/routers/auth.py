from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
import uuid

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Warehouse Staff"

class OTPRequest(BaseModel):
    email: str

class OTPVerify(BaseModel):
    email: str
    otp: str
    new_password: str

@router.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # In production, hash the password
    new_user = models.User(
        name=user.name, 
        email=user.email, 
        password_hash=user.password, 
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or db_user.password_hash != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # In production, return a JWT token
    return {"message": "Login successful", "token": f"mock-jwt-token-{uuid.uuid4()}", "role": db_user.role}

@router.post("/otp/request")
def request_otp(req: OTPRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if not db_user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, an OTP has been sent."}
    
    # Mock sending OTP (e.g., via Twilio/SendGrid)
    return {"message": "OTP sent to email (Mock: 123456)"}

@router.post("/otp/verify")
def verify_otp(req: OTPVerify, db: Session = Depends(get_db)):
    if req.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if db_user:
        db_user.password_hash = req.new_password
        db.commit()
    
    return {"message": "Password reset successfully"}
