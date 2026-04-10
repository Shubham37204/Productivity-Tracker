from prisma import Prisma

# Re-export db instance for use across models
from app.core.database import db

__all__ = ["db"]
