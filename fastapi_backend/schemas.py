from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
# from schemas.rider import RiderCreate


# class EventResponse(BaseModel):
#     id: int
#     title: str
#     venue: str
#     event_date: datetime
#     description: Optional[str]
#     image_url: Optional[str]

#     class Config:
#         from_attributes = True


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
    rider_email: EmailStr
    rider_contact_number: str
    rider_emirates_id_file: str | None = None


class BookingCreate(BaseModel):
    event_id: int
    package_id: int
    full_name: str
    contact_number: str
    email: EmailStr
    emirates_id: str
    table_id: int | None = None
    riders: list[RiderCreate] | None = None

class RiderResponse(BaseModel):
    id: int
    booking_id: int
    rider_name: str
    rider_emirates_id: str
    rider_email: EmailStr
    rider_contact_number: str
    rider_emirates_id_file: Optional[str] = None

    class Config:
        from_attributes = True


class BookingResponse(BaseModel):
    id: int
    full_name: str
    email: str
    booking_date: datetime
    amount: float
    riders: Optional[List[RiderResponse]] = None  # <-- add this line

    class Config:
        from_attributes = True



# ✅ SAFE Magniti schema
class PaymentInitiate(BaseModel):
    booking_id: int
    package_id: int
    amount: float


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    package_id: int
    transaction_id: str
    status: str
    amount: float

    class Config:
        from_attributes = True


# class EventDetailResponse(BaseModel):
#     event: EventResponse
#     packages: List[PackageResponse]
#     tables: List[TableResponse]

#     class Config:
#         from_attributes = True
