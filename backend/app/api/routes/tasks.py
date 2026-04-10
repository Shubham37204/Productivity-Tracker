from fastapi import APIRouter, Depends, HTTPException
from app.core.clerk import get_current_user
from app.core.database import db
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.gamification import award_xp, update_streak, check_and_award_badges
from datetime import datetime, timezone

router = APIRouter()

async def get_db_user(current_user: dict = Depends(get_current_user)):
    user = await db.user.find_unique(where={"clerkId": current_user["clerk_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Call /auth/sync first.")
    return user

@router.get("/")
async def get_tasks(user=Depends(get_db_user)):
    return await db.task.find_many(
        where={"userId": user.id},
        order={"createdAt": "desc"}
    )

@router.post("/")
async def create_task(body: TaskCreate, user=Depends(get_db_user)):
    return await db.task.create(data={
        "userId": user.id,
        "title": body.title,
        "category": body.category,
        "dueDate": body.dueDate,
        "xp": body.xp
    })

@router.put("/{task_id}")
async def update_task(task_id: str, body: TaskUpdate, user=Depends(get_db_user)):
    task = await db.task.find_unique(where={"id": task_id})
    if not task or task.userId != user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = body.model_dump(exclude_none=True)

    # Handle completion
    if body.completed and not task.completed:
        update_data["completedAt"] = datetime.now(timezone.utc)

        total_xp = await award_xp(user.id, task.xp, f"Completed: {task.title}")
        streak = await update_streak(user.id)

        task_count = await db.task.count(where={"userId": user.id, "completed": True})
        await check_and_award_badges(user.id, total_xp, streak, task_count)

    return await db.task.update(where={"id": task_id}, data=update_data)

@router.delete("/{task_id}")
async def delete_task(task_id: str, user=Depends(get_db_user)):
    task = await db.task.find_unique(where={"id": task_id})
    if not task or task.userId != user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.task.delete(where={"id": task_id})
    return {"message": "Deleted"}