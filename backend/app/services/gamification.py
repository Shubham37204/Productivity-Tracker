from app.core.database import db
from app.services.redis_service import update_leaderboard
from datetime import datetime, timezone

BADGES = [
    {"id": "first_task", "title": "First Step", "description": "Complete your first task", "icon": "🎯", "threshold": 1},
    {"id": "streak_3",   "title": "On Fire",    "description": "3-day streak",             "icon": "🔥", "threshold": 3},
    {"id": "streak_7",   "title": "Week Warrior","description": "7-day streak",             "icon": "⚡", "threshold": 7},
    {"id": "xp_100",     "title": "Century",    "description": "Earn 100 XP",              "icon": "💯", "threshold": 100},
    {"id": "xp_500",     "title": "XP Master",  "description": "Earn 500 XP",              "icon": "🏆", "threshold": 500},
]

async def award_xp(user_id: str, xp: int, reason: str):
    await db.xplog.create(data={"userId": user_id, "xp": xp, "reason": reason})
    
    total_xp = await db.xplog.aggregate(
        where={"userId": user_id},
        sum={"xp": True}
    )
    total = total_xp.get("_sum", {}).get("xp", 0) or 0
    await update_leaderboard(user_id, total)
    return total

async def update_streak(user_id: str):
    streak = await db.streak.find_unique(where={"userId": user_id})
    now = datetime.now(timezone.utc)

    if not streak:
        await db.streak.create(data={
            "userId": user_id,
            "currentStreak": 1,
            "longestStreak": 1,
            "lastActiveAt": now
        })
        return 1

    diff = (now - streak.lastActiveAt).days

    if diff == 1:
        new_streak = streak.currentStreak + 1
    elif diff == 0:
        return streak.currentStreak
    elif diff > 1 and streak.freezesLeft > 0:
        # Use a freeze
        new_streak = streak.currentStreak
        await db.streak.update(
            where={"userId": user_id},
            data={"freezesLeft": streak.freezesLeft - 1, "lastActiveAt": now}
        )
        return new_streak
    else:
        new_streak = 1

    longest = max(new_streak, streak.longestStreak)
    await db.streak.update(
        where={"userId": user_id},
        data={"currentStreak": new_streak, "longestStreak": longest, "lastActiveAt": now}
    )
    return new_streak

async def check_and_award_badges(user_id: str, total_xp: int, streak: int, task_count: int):
    existing = await db.achievement.find_many(where={"userId": user_id})
    existing_ids = {a.title for a in existing}

    for badge in BADGES:
        if badge["title"] in existing_ids:
            continue
        should_unlock = (
            (badge["id"] == "first_task" and task_count >= 1) or
            (badge["id"] == "streak_3"   and streak >= 3) or
            (badge["id"] == "streak_7"   and streak >= 7) or
            (badge["id"] == "xp_100"     and total_xp >= 100) or
            (badge["id"] == "xp_500"     and total_xp >= 500)
        )
        if should_unlock:
            await db.achievement.create(data={
                "userId": user_id,
                "title": badge["title"],
                "description": badge["description"],
                "icon": badge["icon"]
            })
            