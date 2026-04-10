from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from app.core.config import settings

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    token = credentials.credentials
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://api.clerk.com/v1/tokens/verify",
            headers={
                "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
                "Content-Type": "application/json"
            },
            params={"token": token}
        )
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    data = res.json()
    return {
        "clerk_id": data.get("sub"),
        "email": data.get("email", ""),
        "name": data.get("name", "")
    }
