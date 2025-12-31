from dotenv import load_dotenv
load_dotenv()  # MUST be before using env vars

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import events, bookings, payments, uploads, packages, tables
import os

from fastapi.responses import FileResponse


from config import settings
print("Magniti merchant:", settings.magniti_merchant_id)


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Event Booking API",
    description="FastAPI backend for event booking system with payment integration",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(uploads.router)
app.include_router(packages.router)
app.include_router(tables.router)

@app.get("/")
def read_root():
    return {
        "message": "Event Booking API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
    
    


app = FastAPI()

@app.get("/test_mastercard")
def serve_test_page():
    return FileResponse("test_mastercard.html")

