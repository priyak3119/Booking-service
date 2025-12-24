from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Table

router = APIRouter(prefix="/api/v2", tags=["tables"])

@router.get("/tables")
def get_tables(db: Session = Depends(get_db)):
    tables = db.query(Table).all()
    return tables
