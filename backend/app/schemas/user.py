from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    clerk_id: str
    email: str
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    clerkId: str
    email: str
    name: Optional[str]
    createdAt: datetime

    