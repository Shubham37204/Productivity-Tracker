import type { KyInstance } from 'ky'
import type { Achievement } from '../types'

export const achievementApi = (api: KyInstance) => ({
  getAll: () => api.get('api/achievements/').json<Achievement[]>(),
})
