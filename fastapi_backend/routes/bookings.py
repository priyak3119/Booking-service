from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from pathlib import Path
from uuid import uuid4
import json
import shutil
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


from database import get_db
from models import Booking, Rider, Table, Package, PackageType
from schemas import BookingResponse, RiderResponse

router = APIRouter(prefix="/api/v2", tags=["bookings"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# ---------------- FILE SAVE HELPER ---------------- #

def save_file(file: UploadFile, prefix: str) -> str:
    extension = file.filename.split(".")[-1]
    filename = f"{prefix}_{uuid4().hex}.{extension}"
    filepath = UPLOAD_DIR / filename
    with filepath.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return str(filepath)


# ---------------- CREATE BOOKING ---------------- #

@router.post("/bookings", response_model=BookingResponse)
async def create_booking(
    event_id: int = Form(...),
    package_id: int = Form(...),

    # VIP fields
    full_name: Optional[str] = Form(None),
    contact_number: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    emirates_id: Optional[str] = Form(None),
    emirates_id_file: Optional[UploadFile] = File(None),
    table_id: Optional[int] = Form(None),

    # Rider fields
    riders: Optional[str] = Form(None),
    rider_files: Optional[List[UploadFile]] = File(None),

    db: Session = Depends(get_db)
):
    try:
        # ---------------- FETCH PACKAGE ---------------- #
        package = db.query(Package).filter(Package.id == package_id).first()
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")

        riders_data = []
        emirates_file_path = ""

        # ---------------- VIP VALIDATION ---------------- #
        if package.type == PackageType.VIP:
            if not all([full_name, contact_number, email, emirates_id, emirates_id_file, table_id]):
                raise HTTPException(status_code=400, detail="All VIP details are required")

            table = db.query(Table).filter(Table.id == table_id, Table.is_available == True).first()
            if not table:
                raise HTTPException(status_code=400, detail="Table not available")

            emirates_file_path = save_file(emirates_id_file, "vip_emirates")

        # ---------------- RIDER VALIDATION ---------------- #
        if package.type == PackageType.RIDER:
            if not riders:
                raise HTTPException(status_code=400, detail="Rider data required")

            riders_data = json.loads(riders)

            if len(riders_data) == 0:
                raise HTTPException(status_code=400, detail="At least one rider required")

            if not rider_files or len(rider_files) != len(riders_data):
                raise HTTPException(status_code=400, detail="Rider files mismatch")

        # ---------------- CREATE BOOKING ---------------- #
        booking = Booking(
            event_id=event_id,
            package_id=package_id,
            full_name=full_name if package.type == PackageType.VIP else "",
            contact_number=contact_number if package.type == PackageType.VIP else "",
            email=email if package.type == PackageType.VIP else "",
            emirates_id=emirates_id if package.type == PackageType.VIP else "",
            emirates_id_file=emirates_file_path if package.type == PackageType.VIP else "",
            table_id=table_id if package.type == PackageType.VIP else None,
            seats_booked=len(riders_data) if package.type == PackageType.RIDER else 1
        )

        # import random
        # from datetime import datetime, timedelta

        # booking.otp_code = f"{random.randint(100000, 999999)}"
        # booking.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
        
        # if booking.email:
        #     send_otp_email(booking.email, booking.otp_code)

        db.add(booking)
        db.flush() 

        # ---------------- ADD RIDERS ---------------- #
        rider_responses = []

        if package.type == PackageType.RIDER:
            for index, rider in enumerate(riders_data):
                rider_file_path = save_file(rider_files[index], f"rider_{index+1}")

                db_rider = Rider(
                    booking_id=booking.id,
                    package_id=package_id,
                    rider_name=rider["rider_name"],
                    rider_emirates_id=rider["rider_emirates_id"],
                    rider_email=rider["rider_email"],
                    rider_contact_number=rider["rider_contact_number"],
                    rider_emirates_id_file=rider_file_path
                )

                db.add(db_rider)
                db.flush()

                rider_responses.append(RiderResponse.from_orm(db_rider))

        # ---------------- LOCK VIP TABLE ---------------- #
        if package.type == PackageType.VIP:
            table.is_available = False

        db.commit()
        db.refresh(booking)

        # ---------------- CALCULATE AMOUNT ---------------- #
        amount = (
            package.price
            if package.type == PackageType.VIP
            else package.price * len(riders_data)
        )

        return BookingResponse(
            id=booking.id,
            full_name=booking.full_name,
            email=booking.email,
            booking_date=booking.booking_date,
            amount=float(amount),
            riders=rider_responses if rider_responses else None
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- GET BOOKING ---------------- #

@router.get("/bookings/{booking_id}")
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "success": True,
        "data": {
            "id": booking.id,
            "full_name": booking.full_name,
            "email": booking.email,
            "booking_date": booking.booking_date,
            "payment_status": booking.payment_status
        }
    }


@router.post("/bookings/{booking_id}/verify-otp")
def verify_booking_otp(
    booking_id: int,
    otp: str,
    db: Session = Depends(get_db)
):
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


def send_otp_email(to_email: str, otp_code: str):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    smtp_user = "priyabridgingfx@gmail.com"
    smtp_password = "tcrmxiotpmzubwqo"

    subject = "Your Booking OTP Code"
    body = f"Your OTP code is: {otp_code}\nIt will expire in 5 minutes."

    msg = MIMEMultipart()
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
