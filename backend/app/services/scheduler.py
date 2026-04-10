from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.core.database import db
from app.services.groq_service import generate_weekly_report
from datetime import datetime, timedelta, timezone

scheduler = AsyncIOScheduler()

async def generate_reports_for_all_users():
    users = await db.user.find_many()
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)

    for user in users:
        tasks = await db.task.find_many(
            where={
                "userId": user.id,
                "completed": True,
                "completedAt": {"gte": week_start}
            }
        )
        if not tasks:
            continue

        task_logs = [{"title": t.title, "category": t.category, "xp": t.xp} for t in tasks]
        
        try:
            result = await generate_weekly_report(task_logs)
            await db.weeklyreport.create(data={
                "userId": user.id,
                "summary": result["summary"],
                "tips": result["tips"],
                "weekStart": week_start,
                "weekEnd": now
            })
        except Exception as e:
            print(f"Report failed for {user.id}: {e}")

def start_scheduler():
    scheduler.add_job(
        generate_reports_for_all_users,
        CronTrigger(day_of_week="sun", hour=23, minute=59)
    )
    scheduler.start()