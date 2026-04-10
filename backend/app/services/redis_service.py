import redis.asyncio as redis
from app.core.config import settings
import json

r = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def get_cache(key: str):
    val = await r.get(key)
    return json.loads(val) if val else None

async def set_cache(key: str, value: dict, ttl: int = 300):
    await r.set(key, json.dumps(value), ex=ttl)

async def delete_cache(key: str):
    await r.delete(key)

# Leaderboard using Redis sorted sets
async def update_leaderboard(user_id: str, xp: int):
    await r.zadd("leaderboard:global", {user_id: xp})

async def get_leaderboard(top_n: int = 10):
    return await r.zrevrange("leaderboard:global", 0, top_n - 1, withscores=True)