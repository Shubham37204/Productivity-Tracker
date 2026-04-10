from fastapi import APIRouter, Depends
from app.core.clerk import get_current_user
from app.core.database import db
from app.services.redis_service import get_cache, set_cache, get_leaderboard

router = APIRouter()

async def get_db_user(current_user: dict = Depends(get_current_user)):
    return await db.user.find_unique(where={"clerkId": current_user["clerk_id"]})

@router.get("/stats")
async def get_stats(user=Depends(get_db_user)):
    cache_key = f"stats:{user.id}"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    total_tasks = await db.task.count(where={"userId": user.id})
    completed   = await db.task.count(where={"userId": user.id, "completed": True})
    xp_data     = await db.xplog.aggregate(where={"userId": user.id}, sum={"xp": True})
    streak      = await db.streak.find_unique(where={"userId": user.id})

    stats = {
        "totalTasks": total_tasks,
        "completedTasks": completed,
        "completionRate": round((completed / total_tasks * 100), 1) if total_tasks else 0,
        "totalXP": xp_data.get("_sum", {}).get("xp", 0) or 0,
        "currentStreak": streak.currentStreak if streak else 0,
        "longestStreak": streak.longestStreak if streak else 0,
        "freezesLeft": streak.freezesLeft if streak else 2
    }

    await set_cache(cache_key, stats, ttl=120)
    return stats

@router.get("/leaderboard")
async def leaderboard():
    cache_key = "leaderboard:top10"
    cached = await get_cache(cache_key)
    if cached:
        return cached

    board = await get_leaderboard(10)
    result = [{"userId": uid, "xp": int(xp)} for uid, xp in board]
    await set_cache(cache_key, result, ttl=300)
    return result