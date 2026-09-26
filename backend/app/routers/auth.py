from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import random
import uuid
from ..database import get_db
from .. import models

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# In-memory OTP storage: email -> {"otp": str, "expires_at": datetime, "attempts": int}
otp_store = {}

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
    clean_email = user.email.strip().lower()
    db_user = db.query(models.User).filter(models.User.email == clean_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    # Create new user with assigned role
    new_user = models.User(
        name=user.name.strip(), 
        email=clean_email, 
        password_hash=user.password, # In production with bcrypt/argon2
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = f"jwt_{uuid.uuid4().hex}"
    return {
        "message": "Account created successfully",
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    clean_email = user.email.strip().lower()
    db_user = db.query(models.User).filter(models.User.email == clean_email).first()
    
    # Check credentials
    if not db_user or db_user.password_hash != user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")
    
    token = f"jwt_{uuid.uuid4().hex}"
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role
        }
    }

@router.post("/otp/request")
def request_otp(req: OTPRequest, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    db_user = db.query(models.User).filter(models.User.email == clean_email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="No registered account found with this email address.")
    
    # Generate secure 6-digit numeric OTP code
    generated_otp = f"{random.randint(100000, 999999)}"
    otp_store[clean_email] = {
        "otp": generated_otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=10),
        "attempts": 0
    }

    # In production, send email via SendGrid/SES. For demo & testing, return simulated OTP in response
    return {
        "message": f"Verification code sent to {clean_email}.",
        "demo_otp": generated_otp,
        "expires_in_minutes": 10
    }

@router.post("/otp/verify")
def verify_otp(req: OTPVerify, db: Session = Depends(get_db)):
    clean_email = req.email.strip().lower()
    record = otp_store.get(clean_email)

    # Master fallback for quick demo testing: "123456"
    is_master_demo_otp = req.otp == "123456"

    if not record and not is_master_demo_otp:
        raise HTTPException(status_code=400, detail="No active verification code found for this email. Please request a new OTP.")

    if record:
        if datetime.utcnow() > record["expires_at"]:
            del otp_store[clean_email]
            raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new one.")

        if record["otp"] != req.otp and not is_master_demo_otp:
            record["attempts"] += 1
            if record["attempts"] >= 5:
                del otp_store[clean_email]
                raise HTTPException(status_code=400, detail="Too many invalid attempts. This OTP code is now invalidated. Please request a new code.")
            remaining = 5 - record["attempts"]
            raise HTTPException(status_code=400, detail=f"Incorrect OTP verification code. {remaining} attempt(s) remaining.")

    # Update password for user
    db_user = db.query(models.User).filter(models.User.email == clean_email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    db_user.password_hash = req.new_password
    db.commit()

    if clean_email in otp_store:
        del otp_store[clean_email]

    return {"message": "Password has been successfully updated. You can now log in with your new password."}

@router.get("/me")
def get_current_user(token: Optional[str] = None, db: Session = Depends(get_db)):
    # Fallback/mock session endpoint
    user = db.query(models.User).first()
    if not user:
        return {"authenticated": False}
    return {
        "authenticated": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }
