from fastapi import APIRouter, Depends, HTTPException
from app.core.clerk import get_current_user
from app.core.database import db
from app.services.groq_service import generate_weekly_report, generate_task_breakdown
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

router = APIRouter()

class GoalRequest(BaseModel):
    goal: str

async def get_db_user(current_user: dict = Depends(get_current_user)):
    return await db.user.find_unique(where={"clerkId": current_user["clerk_id"]})

@router.get("/")
async def get_reports(user=Depends(get_db_user)):
    return await db.weeklyreport.find_many(
        where={"userId": user.id},
        order={"createdAt": "desc"}
    )

@router.post("/generate")
async def generate_report_now(user=Depends(get_db_user)):
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)

    tasks = await db.task.find_many(where={
        "userId": user.id,
        "completed": True,
        "completedAt": {"gte": week_start}
    })

    if not tasks:
        raise HTTPException(status_code=400, detail="No completed tasks this week")

    task_logs = [{"title": t.title, "category": t.category, "xp": t.xp} for t in tasks]
    result = await generate_weekly_report(task_logs)

    return await db.weeklyreport.create(data={
        "userId": user.id,
        "summary": result["summary"],
        "tips": result["tips"],
        "weekStart": week_start,
        "weekEnd": now
    })

@router.post("/breakdown")
async def breakdown_goal(body: GoalRequest, user=Depends(get_db_user)):
    return await generate_task_breakdown(body.goal)