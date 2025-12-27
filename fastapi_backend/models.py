
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class PackageType(str, enum.Enum):
    VIP = "VIP"
    RIDER = "RIDER"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False)  
    price = Column(Float, nullable=False)
    description = Column(Text)
    max_capacity = Column(Integer, default=1)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = relationship("Booking", back_populates="package")

class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False, default=6)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="table")



class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    # Event ID comes from Umbraco (NO FK)
    event_id = Column(Integer, nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    seats_booked = Column(Integer, default=1)

    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)

    full_name = Column(String(255), nullable=False)
    contact_number = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    emirates_id = Column(String(50), nullable=False)
    emirates_id_file = Column(String(500), nullable=False)

    booking_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    package = relationship("Package", back_populates="bookings")
    table = relationship("Table", back_populates="bookings")
    riders = relationship("Rider", back_populates="booking", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    

class Rider(Base):
    __tablename__ = "riders"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)

    rider_name = Column(String, nullable=False)
    rider_emirates_id = Column(String, nullable=False)

    rider_email = Column(String, nullable=False)
    rider_contact_number = Column(String, nullable=False)

    rider_emirates_id_file = Column(String, nullable=True)
    
    booking = relationship("Booking", back_populates="riders")



class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True)

    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="AED")
    transaction_id = Column(String(255))
    status = Column(String(20), default="PENDING")  # PENDING / COMPLETED / FAILED
    payment_method = Column(String(50))
    magniti_response = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")
