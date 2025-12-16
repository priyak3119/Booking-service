from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

UMBRACO_EVENTS_URL = "http://localhost:64012/api/v2/events/web"

@router.get("/events/web")
async def get_events_web(l: str = "en"):
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

        # RETURN UMBRACO RESPONSE AS-IS
        return response.json()

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Umbraco connection error: {str(e)}"
        )
