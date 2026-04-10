from app.core.database import db

async def get_tasks_by_user(user_id: str):
    return await db.task.find_many(
        where={"userId": user_id},
        order={"createdAt": "desc"}
    )

async def get_task_by_id(task_id: str):
    return await db.task.find_unique(where={"id": task_id})

async def count_completed_tasks(user_id: str) -> int:
    return await db.task.count(where={"userId": user_id, "completed": True})
