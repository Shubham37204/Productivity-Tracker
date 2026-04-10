from app.core.database import db

async def get_user_by_clerk_id(clerk_id: str):
    return await db.user.find_unique(where={"clerkId": clerk_id})

async def get_user_by_id(user_id: str):
    return await db.user.find_unique(where={"id": user_id})

async def create_user(clerk_id: str, email: str, name: str = ""):
    return await db.user.create(data={
        "clerkId": clerk_id,
        "email": email,
        "name": name
    })

async def get_or_create_user(clerk_id: str, email: str, name: str = ""):
    existing = await get_user_by_clerk_id(clerk_id)
    if existing:
        return existing
    return await create_user(clerk_id, email, name)