import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { loadPendingWorkouts, removePendingWorkout } from '@/lib/offline-workouts'

export function useOfflineWorkoutSync() {
  const [pendingCount, setPendingCount] = useState(() => loadPendingWorkouts().length)
  const [syncing, setSyncing] = useState(false)

  const refresh = useCallback(() => setPendingCount(loadPendingWorkouts().length), [])

  const syncNow = useCallback(async () => {
    const queue = loadPendingWorkouts()
    if (!queue.length || !navigator.onLine) return
    setSyncing(true)
    try {
      for (const item of queue) {
        await api.workouts.create(item.payload)
        removePendingWorkout(item.id)
      }
    } finally {
      refresh()
      setSyncing(false)
    }
  }, [refresh])

  useEffect(() => {
    refresh()
    const onOnline = () => void syncNow()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [syncNow, refresh])

  return { pendingCount, syncing, syncNow, refresh }
}
