# ⚡ ProdTracker

A full-stack productivity tracker with gamification, AI-powered weekly reports, streak tracking, and a real-time XP leaderboard.


## 📸 Features

- ✅ **Task Management** — Create, categorize, and complete tasks with XP rewards
- 🔥 **Streak System** — Daily streaks with freeze protection (like Duolingo)
- 🏆 **Achievements** — Auto-unlock badges based on milestones (XP, streaks, task count)
- 📊 **Dashboard** — Live stats, completion rate, and XP leaderboard powered by Redis
- 🤖 **AI Weekly Reports** — Groq (LLaMA 3) analyzes your week and generates personalized tips
- 🎯 **AI Goal Breakdown** — Paste a goal, get a structured 7-day task plan
- 🔐 **Auth via Clerk** — Google/GitHub OAuth, session management out of the box
- ⚡ **Auto Scheduler** — Weekly reports auto-generated every Sunday via APScheduler


## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript + Vite | Core UI framework |
| Tailwind CSS v4 | Styling |
| shadcn/ui | Component library |
| Clerk | Authentication |
| Zustand | State management |
| Recharts | XP leaderboard charts |
| Framer Motion | Animations & XP popups |
| ky | HTTP client (fetch wrapper) |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI (Python) | REST API |
| Prisma (prisma-client-py) | ORM |
| PostgreSQL | Primary database |
| Redis | Leaderboard caching + rate limiting |
| Groq API (LLaMA 3 70B) | AI report + goal breakdown |
| APScheduler | Weekly report cron job |
| Clerk SDK | JWT verification middleware |


## 📁 Project Structure

```
productivity-tracker/
├── frontend/
│   ├── src/
│   │   ├── api/               # Typed API wrappers (tasks, reports, dashboard)
│   │   ├── components/        # Layout, shadcn/ui components
│   │   ├── features/
│   │   │   ├── auth/          # Clerk sync component
│   │   │   ├── tasks/         # Task CRUD with XP + animations
│   │   │   ├── dashboard/     # Stats cards + leaderboard chart
│   │   │   ├── achievements/  # Badge unlock display
│   │   │   └── reports/       # AI weekly report + goal breakdown
│   │   ├── hooks/             # useInitApi
│   │   ├── lib/               # ky API client
│   │   ├── store/             # Zustand stores
│   │   └── types/             # Shared TypeScript interfaces
│   └── .env
└── backend/
    ├── app/
    │   ├── api/routes/        # auth, tasks, dashboard, achievements, reports
    │   ├── core/              # config, database, clerk middleware
    │   ├── models/            # Prisma model helpers
    │   ├── schemas/           # Pydantic v2 schemas
    │   ├── services/          # groq, redis, gamification, scheduler
    │   └── utils/             # helpers
    ├── prisma/
    │   └── schema.prisma      # DB schema
    ├── main.py
    └── .env
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL
- Redis
- [Clerk](https://clerk.com) account
- [Groq](https://console.groq.com) API key


### 1. Clone the repo

```bash
git clone https://github.com/yourusername/productivity-tracker.git
cd productivity-tracker
```


### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/productivity_db
CLERK_SECRET_KEY=your_clerk_secret_key
GROQ_API_KEY=your_groq_api_key
REDIS_URL=redis://localhost:6379
```

Run Prisma migration:
```bash
prisma migrate dev --name init
prisma generate
```

Start the server:
```bash
uvicorn main:app --reload
```

API runs at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`


### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:8000
```

Start the dev server:
```bash
npm run dev
```

App runs at `http://localhost:5173`


## 🗄 Database Schema

```
User ──< Task
     ──< XPLog
     ──< Achievement
     ──< WeeklyReport
     ──  Streak (1:1)
```

### Key Models

**Task**
```
id, title, category, completed, xp, dueDate, completedAt, userId
```

**Streak**
```
userId, currentStreak, longestStreak, lastActiveAt, freezesLeft
```

**WeeklyReport**
```
userId, summary, tips[], weekStart, weekEnd
```


## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/sync` | Sync Clerk user to DB |
| GET | `/api/tasks/` | Get all tasks |
| POST | `/api/tasks/` | Create a task |
| PUT | `/api/tasks/:id` | Update / complete task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/dashboard/stats` | XP, streaks, completion rate |
| GET | `/api/dashboard/leaderboard` | Top 10 by XP (Redis cached) |
| GET | `/api/achievements/` | Earned badges |
| GET | `/api/reports/` | Past weekly reports |
| POST | `/api/reports/generate` | Generate AI weekly report |
| POST | `/api/reports/breakdown` | AI 7-day goal breakdown |


## 🎮 Gamification Logic

### XP System
- Each completed task awards XP (default: 10 XP)
- XP is logged to `XPLog` table and aggregated for leaderboard

### Streak Rules
- Completing any task increments your daily streak
- Missing a day resets streak to 1
- **Streak Freeze**: 2 freezes banked per user — auto-used on missed days

### Badge Unlocks
| Badge | Condition |
|---|---|
| 🎯 First Step | Complete first task |
| 🔥 On Fire | 3-day streak |
| ⚡ Week Warrior | 7-day streak |
| 💯 Century | Earn 100 XP |
| 🏆 XP Master | Earn 500 XP |


## 🤖 AI Integration (Groq)

### Weekly Report
Sends completed task logs to `llama3-70b-8192` and returns:
- 2–3 sentence weekly summary
- 3 personalized productivity tips

### Goal Breakdown
Accepts a free-text goal and returns a structured 7-day action plan with categories and XP values.

### Auto Scheduler
Every Sunday at 23:59, APScheduler auto-generates weekly reports for all active users.


## 🚢 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend + DB + Redis | Railway |

### Deploy Backend to Railway
1. Push code to GitHub
2. Create new Railway project → Deploy from repo
3. Add PostgreSQL and Redis plugins
4. Set environment variables in Railway dashboard
5. Railway auto-detects `requirements.txt` and deploys

### Deploy Frontend to Vercel
1. Push frontend folder to GitHub
2. Import repo in Vercel
3. Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` in Vercel env settings
4. Deploy


## 📝 Environment Variables

### Backend
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `GROQ_API_KEY` | From console.groq.com |
| `REDIS_URL` | Redis connection string |

### Frontend
| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `VITE_API_URL` | Backend base URL |


---

Built with ⚡ by [Your Name](https://github.com/yourusername)
