import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useApiStore } from '../store/useApi'

export function useInitApi() {
  const { getToken } = useAuth()
  const setApi = useApiStore((s) => s.setApi)
  const api = useApiStore((s) => s.api)

  useEffect(() => {
    setApi(async () => await getToken())
  }, [getToken])

  // Sync user to DB on first load
  useEffect(() => {
    if (!api) return
    api.post('api/auth/sync').catch(console.error)
  }, [api])
}