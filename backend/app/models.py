from pydantic import BaseModel
from typing import List, Optional

class TypeModel(BaseModel):
    En: Optional[str]
    Ar: Optional[str]

class TitleModel(BaseModel):
    En: Optional[str]
    Ar: Optional[str]

class CategoryModel(BaseModel):
    En: Optional[str]
    Ar: Optional[str]

class LocationModel(BaseModel):
    En: Optional[str]
    Ar: Optional[str]

class DateDescriptionModel(BaseModel):
    En: Optional[str]
    Ar: Optional[str]

class EventWebDto(BaseModel):
    id: int
    bookingType: Optional[str]
    eventType: Optional[TypeModel]
    typeId: Optional[str]
    title: Optional[TitleModel]
    category: Optional[CategoryModel]
    location: Optional[LocationModel]
    dates: Optional[List[str]] = []
    dateDescription: Optional[DateDescriptionModel]
    thumb: Optional[str]
    url: Optional[str]
