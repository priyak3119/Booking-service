# 🎫 Event Booking System (Full Stack)

A full-stack **Event Booking Platform** built using:

- ⚡ FastAPI (Backend)
- ⚛️ React.js (Frontend)
- 💳 Mastercard Payment Integration
- 📦 Modular API Architecture

This system allows users to book events, select packages, choose tables or riders, upload documents, and complete secure payments.

## 🚀 Project Overview

This project is a real-world **event booking system** with multi-step booking flow:

### 🔹 Booking Flow:
1. Select Event
2. Choose Package (VIP / Rider)
3. Fill Personal Details
4. Upload Emirates ID / Rider documents
5. Select Table (VIP) or Riders (Rider package)
6. Payment via Mastercard Checkout
7. Booking Confirmation

---

## 🛠️ Tech Stack

### Frontend:
- React.js
- JavaScript (ES6+)
- Tailwind CSS
- Lucide React Icons
- Fetch API

### Backend:
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- dotenv

### Payment:
- Mastercard Checkout SDK
## 🔗 Backend Modules

- Events API
- Bookings API
- Packages API
- Tables API
- Payments API
- File Upload API

## 🎯 Key Features

### 🎉 Event Selection
Users can view event details including:
- Title
- Location
- Date & time

### 📦 Package Selection
- VIP Package (Table booking)
- Rider Package (Multi-user booking)

### 🪑 Table Management
- Dynamic table selection
- Availability validation

### 👥 Rider System
- Add multiple riders dynamically
- Upload Emirates ID for each rider

### 📁 File Upload
- Emirates ID upload (PDF / JPG / PNG)
- Rider document uploads

### 💳 Payment Integration
- Mastercard Hosted Checkout
- Secure session-based payment flow

---

## 🔐 Payment Flow

1. Create booking (FastAPI)
2. Generate payment session
3. Load Mastercard SDK dynamically
4. Redirect to secure hosted checkout
5. Handle success / failure callbacks

---

## 📂 Frontend Structure
src/
├── BookingPage.jsx
├── components/
├── api/
├── styles/

## backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
