from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import connect_db, disconnect_db
from app.services.scheduler import start_scheduler
from app.api.routes import auth, tasks, dashboard, achievements, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    start_scheduler()
    print("✅ DB connected | Scheduler started")
    yield
    await disconnect_db()

app = FastAPI(title="Productivity Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,         prefix="/api/auth",         tags=["Auth"])
app.include_router(tasks.router,        prefix="/api/tasks",        tags=["Tasks"])
app.include_router(dashboard.router,    prefix="/api/dashboard",    tags=["Dashboard"])
app.include_router(achievements.router, prefix="/api/achievements", tags=["Achievements"])
app.include_router(reports.router,      prefix="/api/reports",      tags=["Reports"])

@app.get("/health")
async def health():
    return {"status": "ok", "db": "connected"}