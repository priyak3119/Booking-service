from sqlalchemy import Table, Column, Integer, String, JSON
from app.database import metadata

events = Table(
    "events",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("booking_type", String),
    Column("title", JSON),            # {"en": "...", "ar": "..."}
    Column("category", JSON),
    Column("location", JSON),
    Column("type", JSON),
    Column("type_id", String),
    Column("dates", JSON),            # List of date strings
    Column("date_description", JSON),
    Column("thumb", String),
    Column("url", String),
)
