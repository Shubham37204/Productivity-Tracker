from fastapi import APIRouter, Depends
from app.core.database import db
from app.core.clerk import get_current_user

router = APIRouter()

@router.post("/sync")
async def sync_user(current_user: dict = Depends(get_current_user)):
    existing = await db.user.find_unique(where={"clerkId": current_user["clerk_id"]})
    if existing:
        return existing

    user = await db.user.create(data={
        "clerkId": current_user["clerk_id"],
        "email": current_user["email"],
        "name": current_user.get("name", "")
    })
    return user