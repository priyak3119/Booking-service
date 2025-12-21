from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Payment, Booking, PaymentStatus
from schemas import PaymentInitiate, PaymentResponse
from config import settings
import requests
import json
from uuid import UUID
import uuid

router = APIRouter(prefix="/api/v2", tags=["payments"])

@router.post("/payment/process", response_model=PaymentResponse)
def process_payment(payment_data: PaymentInitiate, db: Session = Depends(get_db)):
    try:
        booking = db.query(Booking).filter(Booking.id == payment_data.booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        existing_payment = db.query(Payment).filter(Payment.booking_id == payment_data.booking_id).first()
        if existing_payment:
            raise HTTPException(status_code=400, detail="Payment already exists for this booking")

        transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

        magniti_payload = {
            "merchantId": settings.magniti_merchant_id,
            "transactionId": transaction_id,
            "amount": str(payment_data.amount),
            "currency": "AED",
            "cardNumber": payment_data.card_number,
            "cardHolder": payment_data.card_holder,
            "expiryMonth": str(payment_data.expiry_month).zfill(2),
            "expiryYear": str(payment_data.expiry_year),
            "cvv": payment_data.cvv,
        }

        headers = {
            "Authorization": f"Bearer {settings.magniti_api_key}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(
                "https://api.magniti.ae/v1/payments/process",
                json=magniti_payload,
                headers=headers,
                timeout=30
            )

            magniti_response = response.json()
            payment_status = PaymentStatus.COMPLETED if response.status_code == 200 else PaymentStatus.FAILED

        except requests.exceptions.RequestException as e:
            magniti_response = {"error": str(e)}
            payment_status = PaymentStatus.FAILED

        payment = Payment(
            booking_id=payment_data.booking_id,
            amount=payment_data.amount,
            currency="AED",
            transaction_id=transaction_id,
            status=payment_status,
            payment_method="card",
            magniti_response=json.dumps(magniti_response)
        )

        db.add(payment)
        db.commit()
        db.refresh(payment)

        if payment_status != PaymentStatus.COMPLETED:
            raise HTTPException(
                status_code=400,
                detail=f"Payment processing failed: {magniti_response.get('message', 'Unknown error')}"
            )

        return PaymentResponse(
            id=payment.id,
            booking_id=payment.booking_id,
            transaction_id=payment.transaction_id,
            status=payment.status.value,
            amount=payment.amount
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payment/verify/{transaction_id}")
def verify_payment(transaction_id: str, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.transaction_id == transaction_id).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return {
        "success": True,
        "data": {
            "transaction_id": payment.transaction_id,
            "status": payment.status.value,
            "amount": payment.amount,
            "booking_id": str(payment.booking_id)
        }
    }

@router.get("/payment/booking/{booking_id}")
def get_payment_by_booking(booking_id: UUID, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.booking_id == booking_id).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found for this booking")

    return {
        "success": True,
        "data": {
            "id": str(payment.id),
            "transaction_id": payment.transaction_id,
            "status": payment.status.value,
            "amount": payment.amount
        }
    }
