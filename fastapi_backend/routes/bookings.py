from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Booking, Rider, Table, Package
from schemas import BookingCreate, BookingResponse
from uuid import UUID

router = APIRouter(prefix="/api/v2", tags=["bookings"])

@router.post("/bookings", response_model=BookingResponse)
def create_booking(booking_data: BookingCreate, db: Session = Depends(get_db)):
    try:
        package = db.query(Package).filter(Package.id == booking_data.package_id).first()
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")

        if package.type == "VIP":
            if not booking_data.table_id:
                raise HTTPException(status_code=400, detail="Table selection required for VIP package")

            # Fetch table and check if it's already booked
            table = db.query(Table).filter(Table.id == booking_data.table_id).first()
            if not table:
                raise HTTPException(status_code=404, detail="Table not found")

            booked_seats = db.query(Booking).filter(Booking.table_id == booking_data.table_id).count()
            remaining_seats = table.capacity - booked_seats

            if remaining_seats < 1:
                raise HTTPException(status_code=400, detail="This table is already fully booked")

        if package.type == "RIDER":
            if not booking_data.riders or len(booking_data.riders) == 0:
                raise HTTPException(status_code=400, detail="Riders required for Rider package")
            if len(booking_data.riders) > 30:
                raise HTTPException(status_code=400, detail="Maximum 30 riders allowed")

        # Create booking
        booking = Booking(
            event_id=booking_data.event_id,
            package_id=booking_data.package_id,
            full_name=booking_data.full_name,
            contact_number=booking_data.contact_number,
            email=booking_data.email,
            emirates_id=booking_data.emirates_id,
            emirates_id_file="placeholder",
            table_id=booking_data.table_id if package.type == "VIP" else None
        )
        db.add(booking)
        db.flush()

        # Add riders if package is Rider type
        if booking_data.riders:
            for rider_data in booking_data.riders:
                rider = Rider(
                    booking_id=booking.id,
                    rider_name=rider_data.rider_name,
                    rider_emirates_id=rider_data.rider_emirates_id,
                    rider_id_file="placeholder"
                )
                db.add(rider)

        # Mark VIP table as unavailable if fully booked
        if package.type == "VIP" and booking_data.table_id:
            table.is_available = False

        db.commit()
        db.refresh(booking)

        return BookingResponse(
            id=booking.id,
            full_name=booking.full_name,
            email=booking.email,
            booking_date=booking.booking_date,
            amount=float(package.price)
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bookings/{booking_id}")
def get_booking(booking_id: UUID, db: Session = Depends(get_db)):
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
