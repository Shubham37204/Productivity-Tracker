from fastapi import APIRouter, Depends
from app.core.clerk import get_current_user
from app.core.database import db

router = APIRouter()

async def get_db_user(current_user: dict = Depends(get_current_user)):
    return await db.user.find_unique(where={"clerkId": current_user["clerk_id"]})

@router.get("/")
async def get_achievements(user=Depends(get_db_user)):
    return await db.achievement.find_many(
        where={"userId": user.id},
        order={"unlockedAt": "desc"}
    )