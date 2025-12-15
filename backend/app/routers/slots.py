from fastapi import APIRouter

router = APIRouter()

@router.get("/{event_id}")
def get_slots(event_id: str):
    # TODO: Load slots from DB
    return {
        "event_id": event_id,
        "slots": [
            {"id": "S1", "time": "10:00 AM", "available": True},
            {"id": "S2", "time": "12:00 PM", "available": True},
            {"id": "S3", "time": "02:00 PM", "available": False},
        ]
    }
