from datetime import datetime, timezone

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def format_date(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")

    