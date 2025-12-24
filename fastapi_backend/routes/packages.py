from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Package

router = APIRouter(
    prefix="/api/v2/packages",
    tags=["Packages"]
)

@router.get("/")
def get_packages(event_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Package)
    if event_id:
        query = query.filter(Package.event_id == event_id)
    return query.all()
