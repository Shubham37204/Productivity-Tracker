import { create } from 'zustand'
import createApi from '../lib/api'
import type { KyInstance } from 'ky'

interface ApiStore {
  api: KyInstance | null
  setApi: (getToken: () => Promise<string | null>) => void
}

export const useApiStore = create<ApiStore>((set) => ({
  api: null,
  setApi: (getToken) => set({ api: createApi(getToken) }),
}))
