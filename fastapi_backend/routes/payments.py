from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Booking, Payment, PaymentStatus
from schemas import PaymentInitiate
from config import settings
from utils.email import send_email
import requests
import uuid
import json
from datetime import datetime

router = APIRouter(prefix="/api/v2", tags=["payments"])

# ✅ Mastercard / Magniti REST API
MAGNITI_BASE_URL = "https://ap-gateway.mastercard.com/api/rest"


@router.post("/payment/create-session")
def create_payment_session(payment_data: PaymentInitiate, db: Session = Depends(get_db)):
    print("Received body:", payment_data)
    # ---------- VALIDATE BOOKING ----------
    booking = db.query(Booking).filter(
        Booking.id == payment_data.booking_id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # if not booking.otp_verified:
    #     raise HTTPException(
    #         status_code=403,
    #         detail="OTP verification required before payment"
    #     )

    if payment_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid payment amount")

    # ---------- PREVENT DUPLICATE PAYMENT ----------
    existing_payment = db.query(Payment).filter(
        Payment.booking_id == booking.id,
        Payment.status == PaymentStatus.PENDING
    ).first()

    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="Payment already initiated for this booking"
        )

    # ---------- CREATE TRANSACTION ----------
    transaction_id = f"BOOK-{booking.id}-{uuid.uuid4().hex[:8].upper()}"

    payload = {
        "apiOperation": "CREATE_CHECKOUT_SESSION",
        "order": {
            "id": transaction_id,
            "amount": f"{payment_data.amount:.2f}",
            "currency": "AED"
        },
        "interaction": {
            "operation": "PURCHASE",
            "returnUrl": "http://localhost:5173/payment/success",
            "cancelUrl": "http://localhost:5173/payment/failed"
        }
    }

    request_url = (
        f"{MAGNITI_BASE_URL}/version/{settings.magniti_api_version}"
        f"/merchant/{settings.magniti_merchant_id}/session"
    )

    print("Magniti Request URL:", request_url)
    print("Magniti Payload:", json.dumps(payload, indent=2))

    response = requests.post(
        request_url,
        auth=(
            settings.magniti_operator_id,
            settings.magniti_password
        ),
        json=payload,
        timeout=30
    )

    print("Magniti Status:", response.status_code)
    print("Magniti Response:", response.text)

    if response.status_code not in (200, 201):
        raise HTTPException(
            status_code=400,
            detail="Failed to create payment session"
        )

    result = response.json()

    # ---------- SAVE PAYMENT ----------
    payment = Payment(
        booking_id=booking.id,
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


# =====================================================
# VERIFY PAYMENT (OPTIONAL / ADMIN)
# =====================================================
@router.get("/payment/verify/{transaction_id}")
def verify_payment(transaction_id: str):
    request_url = (
        f"{MAGNITI_BASE_URL}/version/{settings.magniti_api_version}"
        f"/merchant/{settings.magniti_merchant_id}/order/{transaction_id}"
    )

    response = requests.get(
        request_url,
        auth=(
            settings.magniti_operator_id,
            settings.magniti_password
        ),
        timeout=30
    )

    return response.json()


# =====================================================
# PAYMENT RETRY
# =====================================================
@router.post("/payment/retry/{booking_id}")
def retry_payment(
    booking_id: int,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.payment_status == PaymentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Payment already completed")

    # Remove old failed payment
    old_payment = db.query(Payment).filter(
        Payment.booking_id == booking.id
    ).first()

    if old_payment:
        db.delete(old_payment)
        db.commit()

    return {
        "message": "Retry allowed. Please create a new payment session."
    }


# =====================================================
# MAGNITI WEBHOOK
# =====================================================
@router.post("/payment/webhook")
async def magniti_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Mastercard / Magniti webhook receiver
    """
    try:
        payload = await request.json()
        print("Webhook Payload:", json.dumps(payload, indent=2))

        order = payload.get("order")
        result = payload.get("result")

        if not order or not result:
            raise HTTPException(status_code=400, detail="Invalid webhook payload")

        transaction_id = order.get("id")
        payment_result = result.get("status")

        if not transaction_id:
            raise HTTPException(status_code=400, detail="Transaction ID missing")

        payment = db.query(Payment).filter(
            Payment.transaction_id == transaction_id
        ).first()

        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        # 🔒 Idempotency check
        if payment.status != PaymentStatus.PENDING:
            return {"success": True, "message": "Already processed"}

        # ---------- UPDATE STATUS ----------
        if payment_result == "SUCCESS":
            payment.status = PaymentStatus.COMPLETED
            payment.booking.payment_status = PaymentStatus.COMPLETED

            # ---------- SEND EMAIL CONFIRMATION ----------
            send_email(
                to=payment.booking.email,
                subject="Booking Confirmed 🎉",
                body=f"""
Hi {payment.booking.full_name},

Your booking has been successfully confirmed.

Booking ID: {payment.booking.id}
Amount Paid: AED {payment.amount}

Thank you for booking with us!
"""
            )
        else:
            payment.status = PaymentStatus.FAILED
            payment.booking.payment_status = PaymentStatus.FAILED

        payment.magniti_response = json.dumps(payload)

        db.commit()

        return {"success": True}

    except Exception as e:
        db.rollback()
        print("Webhook Error:", str(e))
        raise HTTPException(status_code=500, detail="Webhook processing failed")
    