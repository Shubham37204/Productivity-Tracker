import { useEffect, useState } from 'react'
import { useApiStore } from '../../store/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { motion } from 'framer-motion'
import type { Report } from '../../types'

export default function Reports() {
  const api = useApiStore((s) => s.api)
  const [reports, setReports] = useState<Report[]>([])
  const [goal, setGoal] = useState('')
  const [breakdown, setBreakdown] = useState<{ tasks: { day: number; title: string; category: string; xp: number }[] } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [breaking, setBreaking] = useState(false)

  useEffect(() => {
    if (!api) return
    api.get('api/reports/').json<Report[]>().then(setReports).catch(console.error)
  }, [api])

  const handleGenerate = async () => {
    if (!api) return
    setGenerating(true)
    try {
      const report = await api.post('api/reports/generate').json<Report>()
      setReports((prev) => [report, ...prev])
    } catch {
      alert('No completed tasks this week to generate a report!')
    } finally {
      setGenerating(false)
    }
  }

  const handleBreakdown = async () => {
    if (!api || !goal.trim()) return
    setBreaking(true)
    try {
      const result = await api.post('api/reports/breakdown', { json: { goal } }).json<typeof breakdown>()
      setBreakdown(result)
    } finally {
      setBreaking(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1 text-base">AI-powered insights and goal planning</p>
      </div>

      {/* AI Goal Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">🎯 AI Goal Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Enter a goal and get a structured 7-day action plan</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="e.g. Learn system design, Build a portfolio..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="h-11 text-base"
          />
          <Button
            onClick={handleBreakdown}
            disabled={breaking || !goal.trim()}
            className="h-11 font-semibold px-6"
          >
            {breaking ? 'Generating plan...' : 'Generate 7-Day Plan'}
          </Button>

          {breakdown && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-3">Your action plan:</p>
              {breakdown.tasks.map((t) => (
                <div key={t.day} className="flex items-center gap-4 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground w-12 shrink-0">Day {t.day}</span>
                  <span className="flex-1 text-sm font-medium">{t.title}</span>
                  <span className="text-xs font-semibold text-yellow-600 shrink-0">+{t.xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate weekly report */}
      <div className="flex items-center justify-between p-5 rounded-2xl border border-dashed border-border bg-muted/30">
        <div>
          <p className="font-semibold text-base">Weekly AI Report</p>
          <p className="text-sm text-muted-foreground mt-0.5">Analyze your completed tasks from this week</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="font-semibold">
          {generating ? 'Generating...' : '⚡ Generate Report'}
        </Button>
      </div>

      {/* Past reports */}
      {reports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Past Reports</h2>
          {reports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">
                    {new Date(r.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
                    {new Date(r.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base text-muted-foreground leading-relaxed">{r.summary}</p>
                  <div className="space-y-2 border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tips</p>
                    {r.tips.map((tip, i) => (
                      <div key={i} className="flex gap-3 items-start text-sm">
                        <span className="mt-0.5">💡</span>
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {reports.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-lg font-medium">No reports yet</p>
          <p className="text-sm mt-1">Complete tasks this week and generate your first report!</p>
        </div>
      )}
    </div>
  )
}
