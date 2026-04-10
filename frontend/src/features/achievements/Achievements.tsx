import { useEffect, useState } from 'react'
import { useApiStore } from '../../store/useApi'
import { Card, CardContent } from '../../components/ui/card'
import { motion } from 'framer-motion'
import type { Achievement } from '../../types'

export default function Achievements() {
  const api = useApiStore((s) => s.api)
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    if (!api) return
    api.get('api/achievements/').json<Achievement[]>().then(setAchievements).catch(console.error)
  }, [api])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Achievements</h1>
      {achievements.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">🔒</p>
          <p>Complete tasks to unlock achievements!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="pt-4 flex items-center gap-4">
                  <span className="text-4xl">{a.icon}</span>
                  <div>
                    <p className="font-bold">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
