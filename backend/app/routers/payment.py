from fastapi import APIRouter

router = APIRouter()

@router.post("/initiate")
def initiate_payment(booking_id: str):
    return {
        "payment_url": "https://magnati.com/pay/redirect-url"
    }
