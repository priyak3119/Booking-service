from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Booking, Payment, PaymentStatus
from schemas import PaymentInitiate
from config import settings
import requests
import uuid
import json

router = APIRouter(prefix="/api/v2", tags=["payments"])

MAGNITI_BASE_URL = "https://ap-gateway.mastercard.com/api/rest"
# MAGNITI_BASE_URL = "https://ap-gateway.mastercard.com/ma/login.s"


@router.post("/payment/create-session")
def create_payment_session(
    payment_data: PaymentInitiate,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == payment_data.booking_id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

    payload = {
        "apiOperation": "CREATE_CHECKOUT_SESSION",
        "order": {
            "id": transaction_id,
            "amount": payment_data.amount,
            "currency": "AED"
        },
        "interaction": {
            "returnUrl": "http://localhost:5173/payment/success",
            "cancelUrl": "http://localhost:5173/payment/failed"
        }
    }

    try:
        response = requests.post(
            f"{MAGNITI_BASE_URL}/version/{settings.magniti_api_version}"
            f"/merchant/{settings.magniti_merchant_id}/session",
            auth=(
                settings.magniti_operator_id,
                settings.magniti_password
            ),
            json=payload,
            timeout=30
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

    if response.status_code not in (200, 201):
        raise HTTPException(status_code=400, detail=response.text)

    result = response.json()

    payment = Payment(
        booking_id=payment_data.booking_id,
        amount=payment_data.amount,
        currency="AED",
        transaction_id=transaction_id,
        status=PaymentStatus.PENDING,
        payment_method="magniti",
        magniti_response=json.dumps(result)
    )

    db.add(payment)
    db.commit()

    return {
        "checkoutUrl": result["session"]["url"],
        "transactionId": transaction_id
    }



@router.get("/payment/verify/{transaction_id}")
def verify_payment(transaction_id: str):
    response = requests.get(
        f"{MAGNITI_BASE_URL}/merchant/{settings.magniti_merchant_id}/order/{transaction_id}",
        auth=(settings.magniti_api_key, "")
    )

    return response.json()
