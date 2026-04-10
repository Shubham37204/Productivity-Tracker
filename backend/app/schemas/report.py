from pydantic import BaseModel
from typing import List
from datetime import datetime

class ReportResponse(BaseModel):
    id: str
    summary: str
    tips: List[str]
    weekStart: datetime
    weekEnd: datetime
    createdAt: datetime