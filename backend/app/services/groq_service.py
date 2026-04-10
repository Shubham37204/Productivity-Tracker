from groq import AsyncGroq
from app.core.config import settings
import json

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def generate_weekly_report(task_logs: list) -> dict:
    task_summary = "\n".join(
        [f"- {t['title']} (category: {t['category']}, xp: {t['xp']})" 
         for t in task_logs]
    )

    prompt = f"""
You are a productivity coach. Analyze these completed tasks from the past week:

{task_summary}

Respond ONLY with a valid JSON object in this exact format, no markdown:
{{
  "summary": "2-3 sentence summary of the week",
  "tips": ["tip 1", "tip 2", "tip 3"]
}}
"""
    response = await client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=500
    )

    content = response.choices[0].message.content
    return json.loads(content)

async def generate_task_breakdown(goal: str) -> dict:
    prompt = f"""
Break down this goal into a 7-day task plan: "{goal}"

Respond ONLY with valid JSON, no markdown:
{{
  "tasks": [
    {{"day": 1, "title": "task title", "category": "category", "xp": 10}},
    ...
  ]
}}
"""
    response = await client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=800
    )
    content = response.choices[0].message.content
    return json.loads(content)
