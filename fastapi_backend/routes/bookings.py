from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import Booking, Rider, Table, Package
from schemas import BookingResponse
from typing import Optional, List
import json
import shutil
from uuid import uuid4
from pathlib import Path
from datetime import datetime

router = APIRouter(prefix="/api/v2", tags=["bookings"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)  # Ensure upload folder exists

def save_file(file: UploadFile, prefix: str) -> str:
    """Save uploaded file and return file path"""
    extension = file.filename.split(".")[-1]
    filename = f"{prefix}_{uuid4().hex}.{extension}"
    filepath = UPLOAD_DIR / filename
    with filepath.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return str(filepath)

@router.post("/bookings", response_model=BookingResponse)
async def create_booking(
    event_id: int = Form(...),
    package_id: int = Form(...),
    full_name: str = Form(...),
    contact_number: str = Form(...),
    email: str = Form(...),
    emirates_id: str = Form(...),
    emirates_id_file: UploadFile = File(...),
    table_id: Optional[int] = Form(None),
    riders_json: Optional[str] = Form(None),
    rider_files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db)
):
    try:
        package = db.query(Package).filter(Package.id == package_id).first()
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")

        # Save main Emirates ID file
        emirates_id_file_path = save_file(emirates_id_file, "emirates")

        # VIP package logic
        if package.type == "VIP":
            if not table_id:
                raise HTTPException(status_code=400, detail="Table selection required for VIP package")
            
            table = db.query(Table).filter(Table.id == table_id).first()
            if not table:
                raise HTTPException(status_code=404, detail="Table not found")
            
            booked_seats = db.query(Booking).filter(Booking.table_id == table_id).count()
            remaining_seats = table.capacity - booked_seats
            if remaining_seats < 1:
                raise HTTPException(status_code=400, detail="This table is already fully booked")
        
        # Rider package logic
        riders_data = []
        if package.type == "RIDER":
            if not riders_json:
                raise HTTPException(status_code=400, detail="Riders data is required for Rider package")
            riders_data = json.loads(riders_json)
            if not riders_data or len(riders_data) == 0:
                raise HTTPException(status_code=400, detail="Riders list cannot be empty")
            if len(riders_data) > 30:
                raise HTTPException(status_code=400, detail="Maximum 30 riders allowed")
            if not rider_files or len(rider_files) != len(riders_data):
                raise HTTPException(status_code=400, detail="Rider files missing or count mismatch")

        # Create booking
        booking = Booking(
            event_id=event_id,
            package_id=package_id,
            full_name=full_name,
            contact_number=contact_number,
            email=email,
            emirates_id=emirates_id,
            emirates_id_file=emirates_id_file_path,
            table_id=table_id if package.type == "VIP" else None
        )
        db.add(booking)
        db.flush()  # Get booking.id before adding riders

        # Add riders
        if package.type == "RIDER":
            for i, rider in enumerate(riders_data):
                rider_file_path = save_file(rider_files[i], f"rider_{i+1}")
                db.add(Rider(
                    booking_id=booking.id,
                    rider_name=rider["rider_name"],
                    rider_emirates_id=rider["rider_emirates_id"],
                    rider_email=rider["rider_email"],
                    rider_contact_number=rider["rider_contact_number"],
                    rider_emirates_id_file=rider_file_path
                ))

        # Mark VIP table as unavailable
        if package.type == "VIP" and table_id:
            table.is_available = False

        db.commit()
        db.refresh(booking)

        return BookingResponse(
            id=booking.id,
            full_name=booking.full_name,
            email=booking.email,
            booking_date=booking.booking_date,
            amount=float(package.price) if package.type == "VIP" else float(package.price) * len(riders_data)
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


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
            "booking_date": booking.booking_date
        }
    }
