from fastapi import APIRouter
from models.booking import BookingRequest

router = APIRouter()

@router.post("/")
def create_booking(data: BookingRequest):
    return {
        "message": "Booking created",
        "booking": data
    }
