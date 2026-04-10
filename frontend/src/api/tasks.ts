import type { KyInstance } from 'ky'
import type { Task } from '../types'

export const taskApi = (api: KyInstance) => ({
  getAll: () => api.get('api/tasks/').json<Task[]>(),
  create: (data: { title: string; category: string; xp: number }) =>
    api.post('api/tasks/', { json: data }).json<Task>(),
  update: (id: string, data: Partial<Task>) =>
    api.put(`api/tasks/${id}`, { json: data }).json<Task>(),
  delete: (id: string) => api.delete(`api/tasks/${id}`),
})

