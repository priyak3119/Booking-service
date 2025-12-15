from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import booking, slots, payment


app = FastAPI(title="FBMA Booking Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to React domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(booking.router, prefix="/api/booking", tags=["Booking"])
app.include_router(slots.router, prefix="/api/slots", tags=["Slots"])
app.include_router(payment.router, prefix="/api/payment", tags=["Payment"])
