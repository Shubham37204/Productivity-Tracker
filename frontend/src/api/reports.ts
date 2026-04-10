import type { KyInstance } from 'ky'
import type { Report } from '../types'

export const reportApi = (api: KyInstance) => ({
  getAll: () => api.get('api/reports/').json<Report[]>(),
  generate: () => api.post('api/reports/generate').json<Report>(),
  breakdown: (goal: string) =>
    api.post('api/reports/breakdown', { json: { goal } }).json<{
      tasks: { day: number; title: string; category: string; xp: number }[]
    }>(),
})
