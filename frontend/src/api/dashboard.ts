import type { KyInstance } from 'ky'
import type { Stats } from '../types'

export const dashboardApi = (api: KyInstance) => ({
  getStats: () => api.get('api/dashboard/stats').json<Stats>(),
  getLeaderboard: () =>
    api.get('api/dashboard/leaderboard').json<{ userId: string; xp: number }[]>(),
})