from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class EventResponse(BaseModel):
    id: int
    title: str
    venue: str
    event_date: datetime
    description: Optional[str]
    image_url: Optional[str]

    class Config:
        from_attributes = True


class PackageResponse(BaseModel):
    id: int
    name: str
    type: str
    price: float
    description: Optional[str]
    max_capacity: int

    class Config:
        from_attributes = True


class TableResponse(BaseModel):
    id: int
    table_number: int
    capacity: int
    is_available: bool

    class Config:
        from_attributes = True


class RiderCreate(BaseModel):
    rider_name: str
    rider_emirates_id: str


class BookingCreate(BaseModel):
    event_id: int
    package_id: int
    full_name: str
    contact_number: str
    email: EmailStr
    emirates_id: str
    table_id: Optional[int] = None
    riders: Optional[List[RiderCreate]] = None


class BookingResponse(BaseModel):
    id: int
    full_name: str
    email: str
    booking_date: datetime
    amount: float

    class Config:
        from_attributes = True


# ✅ SAFE Magniti schema
class PaymentInitiate(BaseModel):
    booking_id: int
    amount: float


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    transaction_id: str
    status: str
    amount: float

    class Config:
        from_attributes = True


class EventDetailResponse(BaseModel):
    event: EventResponse
    packages: List[PackageResponse]
    tables: List[TableResponse]

    class Config:
        from_attributes = True
