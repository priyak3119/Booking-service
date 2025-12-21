# Event Booking API - FastAPI Backend

FastAPI backend for the event booking system with Magniti payment gateway integration.

## Quick Start

### 1. Setup Python Environment

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create `.env` file with your credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/event_booking
MAGNITI_API_KEY=your_api_key
MAGNITI_MERCHANT_ID=your_merchant_id
UPLOAD_FOLDER=./uploads
```

### 4. Setup Database

Create PostgreSQL database:

```bash
createdb event_booking
psql -d event_booking -f schema.sql
```

### 5. Run Server

```bash
python main.py
```

Server runs at: `http://127.0.0.1:8000`
API Docs: `http://127.0.0.1:8000/docs`

## API Routes

- `GET /api/v2/events/web` - Get event with packages & tables
- `POST /api/v2/bookings` - Create booking
- `POST /api/v2/payment/process` - Process payment
- `POST /api/v2/upload` - Upload files

## File Structure

```
fastapi_backend/
├── main.py              # Entry point
├── database.py          # Database setup
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── config.py            # Configuration
├── schema.sql           # Database schema
├── routes/
│   ├── events.py       # Event endpoints
│   ├── bookings.py     # Booking endpoints
│   ├── payments.py     # Payment endpoints
│   └── uploads.py      # File upload endpoints
├── uploads/            # Uploaded files
├── requirements.txt    # Python dependencies
├── .env.example        # Environment template
└── .env               # Your credentials (not in git)
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `MAGNITI_API_KEY` - Magniti payment API key
- `MAGNITI_MERCHANT_ID` - Your merchant ID
- `UPLOAD_FOLDER` - Where to store uploaded files

## Database Models

- **Event** - Event information
- **Package** - VIP and Rider packages
- **Table** - Venue tables
- **Booking** - Customer bookings
- **Rider** - Individual rider details
- **Payment** - Payment records

## Payment Integration

Magniti payment gateway is integrated with:
- Card validation
- Transaction tracking
- Payment status verification

## Notes

- CORS enabled for all origins (configure for production)
- File uploads limited to 5MB
- Supported file formats: PDF, JPG, PNG, JPEG
- Maximum 30 riders per booking
