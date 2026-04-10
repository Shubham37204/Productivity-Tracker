import { useEffect, useState } from 'react'
import { useApiStore } from '../../store/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Zap, Flame, Trophy, CheckSquare, Target, Snowflake } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import type { Stats } from '../../types'

export default function Dashboard() {
  const api = useApiStore((s) => s.api)
  const [stats, setStats] = useState<Stats | null>(null)
  const [leaderboard, setLeaderboard] = useState<{ userId: string; xp: number }[]>([])

  useEffect(() => {
    if (!api) return
    api.get('api/dashboard/stats').json<Stats>().then(setStats).catch(console.error)
    api.get('api/dashboard/leaderboard').json<{ userId: string; xp: number }[]>().then(setLeaderboard).catch(console.error)
  }, [api])

  const statCards = stats ? [
    { label: 'Total XP',        value: stats.totalXP,          icon: Zap,         color: 'text-yellow-500' },
    { label: 'Current Streak',  value: `${stats.currentStreak}d`, icon: Flame,    color: 'text-orange-500' },
    { label: 'Tasks Done',      value: stats.completedTasks,   icon: CheckSquare, color: 'text-green-500'  },
    { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: Target,  color: 'text-blue-500'   },
    { label: 'Best Streak',     value: `${stats.longestStreak}d`, icon: Trophy,   color: 'text-purple-500' },
    { label: 'Streak Freezes',  value: stats.freezesLeft,      icon: Snowflake,   color: 'text-cyan-500'   },
  ] : []

  const chartData = leaderboard.map((e, i) => ({
    name: `#${i + 1}`,
    xp: e.xp,
  }))

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
                <Icon size={18} className={color} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🏆 XP Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#b45309'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!stats && (
        <p className="text-center text-muted-foreground animate-pulse">Loading stats...</p>
      )}
    </div>
  )
}
