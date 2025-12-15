from pydantic import BaseModel, EmailStr

class BookingRequest(BaseModel):
    event_id: str
    full_name: str
    email: EmailStr
    phone: str
    slot_id: str
