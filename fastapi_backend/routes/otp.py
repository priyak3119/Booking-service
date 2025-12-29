from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Booking
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/v2/otp", tags=["otp"])

@router.post("/send/{booking_id}")
def send_otp(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    otp = str(random.randint(100000, 999999))
    booking.otp_code = otp
    booking.otp_verified = False
    booking.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)

    db.commit()

    # 🔔 Replace with SMS / Email service
    print(f"OTP for {booking.email}: {otp}")

    return {"message": "OTP sent successfully"}

@router.post("/verify/{booking_id}")
def verify_otp(booking_id: int, otp: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.otp_verified:
        return {"message": "OTP already verified"}

    if booking.otp_code != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if booking.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    booking.otp_verified = True
    booking.otp_code = None

    db.commit()

    return {"message": "OTP verified successfully"}
