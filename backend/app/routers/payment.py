from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import uuid

router = APIRouter()

# ---------- REQUEST MODELS ----------

class PaymentRequest(BaseModel):
    event_id: int
    slot_type: str
    seats: List[int]
    amount: int
    email: str
    payment_method: str


class PaymentResponse(BaseModel):
    payment_id: str
    status: str
    message: str


# ---------- DUMMY PAYMENT ----------

@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(payload: PaymentRequest):
    """
    Dummy payment endpoint
    Later replaced with Magnati
    """

    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    # 🔐 simulate payment reference
    payment_id = str(uuid.uuid4())

    # TODO:
    # 1. Verify seat availability
    # 2. Lock seats (reserved)
    # 3. Call Magnati API
    # 4. On success → confirm booking

    return {
        "payment_id": payment_id,
        "status": "SUCCESS",
        "message": "Dummy payment successful"
    }
