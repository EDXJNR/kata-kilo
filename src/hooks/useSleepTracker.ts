import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'

const STORAGE_KEY = 'katakilo.sleep.tracking'

type SleepSession = {
  startedAt: string
}

function loadSession(): SleepSession | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SleepSession
  } catch {
    return null
  }
}

function hoursBetween(start: string, end: string) {
  return (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000
}

export function useSleepTracker(onSaved: () => void) {
  const [session, setSession] = useState<SleepSession | null>(() => loadSession())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isTracking = session != null
  const elapsedH = session ? hoursBetween(session.startedAt, new Date().toISOString()) : 0

  const startTracking = useCallback(() => {
    const next = { startedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSession(next)
    setError(null)
  }, [])

  const finishTracking = useCallback(async () => {
    if (!session) return
    setSaving(true)
    setError(null)
    const endedAt = new Date().toISOString()
    const duration_h = Math.round(hoursBetween(session.startedAt, endedAt) * 10) / 10
    if (duration_h < 0.5) {
      setError('Session too short — track at least 30 minutes of sleep')
      setSaving(false)
      return
    }
    try {
      await api.sleep.create({
        duration_h,
        started_at: session.startedAt,
        ended_at: endedAt,
        source: 'tracked',
        quality: duration_h >= 7 ? 4 : duration_h >= 6 ? 3 : 2
      })
      localStorage.removeItem(STORAGE_KEY)
      setSession(null)
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save sleep')
    } finally {
      setSaving(false)
    }
  }, [session, onSaved])

  const cancelTracking = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
    setError(null)
  }, [])

  // Resume prompt if session is older than 3 hours when app opens
  useEffect(() => {
    if (session && elapsedH >= 3) {
      // session visible — user can tap "Wake up" to save
    }
  }, [session, elapsedH])

  return {
    isTracking,
    session,
    elapsedH,
    saving,
    error,
    startTracking,
    finishTracking,
    cancelTracking
  }
}
