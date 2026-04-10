from fastapi import APIRouter, Depends
from app.core.clerk import get_current_user
from app.models.user import get_or_create_user

router = APIRouter()

@router.post("/sync")
async def sync_user(current_user: dict = Depends(get_current_user)):
    user = await get_or_create_user(
        clerk_id=current_user["clerk_id"],
        email=current_user["email"],
        name=current_user.get("name", "")
    )
    return user