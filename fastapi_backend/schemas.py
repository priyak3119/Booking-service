from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class EventResponse(BaseModel):
    id: UUID
    title: str
    venue: str
    event_date: datetime
    description: Optional[str]
    image_url: Optional[str]

    class Config:
        from_attributes = True

class PackageResponse(BaseModel):
    id: UUID
    name: str
    type: str
    price: float
    description: Optional[str]
    max_capacity: int

    class Config:
        from_attributes = True

class TableResponse(BaseModel):
    id: UUID
    table_number: int
    capacity: int
    is_available: bool

    class Config:
        from_attributes = True

class RiderCreate(BaseModel):
    rider_name: str
    rider_emirates_id: str

class BookingCreate(BaseModel):
    event_id: UUID
    package_id: UUID
    full_name: str
    contact_number: str
    email: EmailStr
    emirates_id: str
    table_id: Optional[UUID] = None
    riders: Optional[List[RiderCreate]] = None

class BookingResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    booking_date: datetime
    amount: float

    class Config:
        from_attributes = True

class PaymentInitiate(BaseModel):
    booking_id: UUID
    amount: float
    card_number: str
    card_holder: str
    expiry_month: int
    expiry_year: int
    cvv: str

class PaymentResponse(BaseModel):
    id: UUID
    booking_id: UUID
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
