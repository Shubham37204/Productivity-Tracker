import { useEffect } from 'react'
import { useApiStore } from '../../store/useApi'

// Called once after Clerk login to sync user to our DB
export default function SyncUser() {
  const api = useApiStore((s) => s.api)

  useEffect(() => {
    if (!api) return
    api.post('api/auth/sync').catch(console.error)
  }, [api])

  return null
}