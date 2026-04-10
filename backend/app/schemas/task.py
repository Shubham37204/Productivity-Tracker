from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    category: str = "General"
    dueDate: Optional[datetime] = None
    xp: int = 10

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    completed: Optional[bool] = None
    dueDate: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    category: str
    completed: bool
    xp: int
    dueDate: Optional[datetime]
    completedAt: Optional[datetime]
    createdAt: datetime
    