export interface Task {
  id: string
  title: string
  category: string
  completed: boolean
  xp: number
  dueDate?: string
  completedAt?: string
  createdAt: string
}

export interface Stats {
  totalTasks: number
  completedTasks: number
  completionRate: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  freezesLeft: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
}

export interface Report {
  id: string
  summary: string
  tips: string[]
  weekStart: string
  weekEnd: string
  createdAt: string
}
