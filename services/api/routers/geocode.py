
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/geocode", tags=["Location search"])

@router.get("/search")
async def search_locations(q: str = Query(..., min_length=3, max_length=160)) -> list[dict]:
    """Proxy a small, public OpenStreetMap location search for the map picker."""
    try:
        async with httpx.AsyncClient(timeout=8.0, headers={"User-Agent": "CivicTwin-Demo/1.0"}) as client:
            response = await client.get("https://nominatim.openstreetmap.org/search", params={
                "q": q, "format": "jsonv2", "limit": 5, "addressdetails": 1
            })
            response.raise_for_status()
        return [{"name": item["display_name"], "latitude": float(item["lat"]), "longitude": float(item["lon"])} for item in response.json()]
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Location search is temporarily unavailable") from exc
