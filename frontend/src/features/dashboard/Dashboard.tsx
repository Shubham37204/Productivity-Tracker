import { useEffect, useState } from 'react'
import { useApiStore } from '../../store/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Zap, Flame, Trophy, CheckSquare, Target, Snowflake } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import type { Stats } from '../../types'

const DEFAULT_STATS: Stats = {
  totalTasks: 0,
  completedTasks: 0,
  completionRate: 0,
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  freezesLeft: 2,
}

export default function Dashboard() {
  const api = useApiStore((s) => s.api)
  const [stats, setStats] = useState<Stats | null>(null)
  const [leaderboard, setLeaderboard] = useState<{ userId: string; xp: number }[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!api) return
    api.get('api/dashboard/stats')
      .json<Stats>()
      .then(setStats)
      .catch(() => { setStats(DEFAULT_STATS); setError(true) })

    api.get('api/dashboard/leaderboard')
      .json<{ userId: string; xp: number }[]>()
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]))
  }, [api])

  const displayStats = stats ?? DEFAULT_STATS

  const statCards = [
    { label: 'Total XP',        value: displayStats.totalXP,             icon: Zap,         color: 'text-yellow-500' },
    { label: 'Current Streak',  value: `${displayStats.currentStreak}d`, icon: Flame,       color: 'text-orange-500' },
    { label: 'Tasks Done',      value: displayStats.completedTasks,      icon: CheckSquare, color: 'text-green-500'  },
    { label: 'Completion Rate', value: `${displayStats.completionRate}%`,icon: Target,      color: 'text-blue-500'   },
    { label: 'Best Streak',     value: `${displayStats.longestStreak}d`, icon: Trophy,      color: 'text-purple-500' },
    { label: 'Streak Freezes',  value: displayStats.freezesLeft,         icon: Snowflake,   color: 'text-cyan-500'   },
  ]

  const chartData = leaderboard.map((e, i) => ({ name: `#${i + 1}`, xp: e.xp }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-base">Your productivity at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon size={18} className={color} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-muted-foreground text-center">
          Complete your first task to see live stats!
        </p>
      )}

      {/* Leaderboard */}
      {chartData.length > 0 ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">🏆 XP Leaderboard</CardTitle>
            <p className="text-sm text-muted-foreground">Top performers this week</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={40}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="xp" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#e2e8f0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16 text-muted-foreground border border-dashed rounded-2xl">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium">Leaderboard is empty</p>
          <p className="text-sm mt-1">Complete tasks to earn XP and appear here!</p>
        </div>
      )}
    </div>
  )
}
