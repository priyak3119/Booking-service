from fastapi import APIRouter, HTTPException, Query
import httpx

router = APIRouter(prefix="/api/v2", tags=["events"])

UMBRACO_EVENTS_URL = "http://127.0.0.1:64012/api/v2/events/web"

@router.get("/events/web")
async def get_events_web(
    event_id: int = Query(..., alias="event"),
    l: str = "en"
):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                UMBRACO_EVENTS_URL,
                params={"l": l}
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch events from Umbraco"
            )

        raw = response.json()

        # 🔍 Normalize Umbraco response
        if isinstance(raw, list):
            events = raw
        elif isinstance(raw, dict):
            if "data" in raw and isinstance(raw["data"], list):
                events = raw["data"]
            elif "events" in raw and isinstance(raw["events"], list):
                events = raw["events"]
            elif "result" in raw and isinstance(raw["result"], list):
                events = raw["result"]
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Unknown Umbraco response format: {raw.keys()}"
                )
        else:
            raise HTTPException(status_code=500, detail="Unexpected Umbraco response type")

        # 🔎 Find event
        event = next((e for e in events if e.get("id") == event_id), None)

        if not event:
            raise HTTPException(
                status_code=404,
                detail=f"No matching event found for ID {event_id}"
            )

        return event

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Umbraco connection error: {str(e)}"
        )
