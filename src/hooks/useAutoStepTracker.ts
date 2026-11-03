import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import {
  addLocalSteps,
  getLocalStepsToday,
  isAutoStepTrackingEnabled,
  setLocalSteps,
  todayKey
} from '@/lib/daily-steps'
import { estimateSteps } from '@/lib/geo'

export type AutoStepState = {
  stepsToday: number
  distanceKm: number
  tracking: boolean
  needsMotionPermission: boolean
  error: string | null
}

async function requestMotionPermission(): Promise<boolean> {
  const DM = DeviceMotionEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  if (typeof DM.requestPermission === 'function') {
    try {
      return (await DM.requestPermission()) === 'granted'
    } catch {
      return false
    }
  }
  return true
}

/** Walking pace ~0.5–3.5 m/s; ignore jitter when speed unknown unless displacement is large enough */
function isLikelyWalking(speedMs: number | null | undefined, segmentKm: number): boolean {
  if (speedMs != null && !Number.isNaN(speedMs)) {
    if (speedMs < 0.45 || speedMs > 3.8) return false
    return segmentKm >= 0.006
  }
  return segmentKm >= 0.018
}

export function useAutoStepTracker() {
  const [state, setState] = useState<AutoStepState>(() => ({
    stepsToday: getLocalStepsToday().steps,
    distanceKm: getLocalStepsToday().distanceKm,
    tracking: false,
    needsMotionPermission:
      typeof (DeviceMotionEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function',
    error: null
  }))

  const lastGeo = useRef<{ lat: number; lng: number; at: number } | null>(null)
  const syncTimer = useRef<number | null>(null)
  const watchId = useRef<number | null>(null)

  const refreshLocal = useCallback(() => {
    const { steps, distanceKm } = getLocalStepsToday()
    setState((s) => ({ ...s, stepsToday: steps, distanceKm }))
  }, [])

  const syncServer = useCallback(async () => {
    const { steps, distanceKm } = getLocalStepsToday()
    if (steps <= 0) return
    try {
      await api.activity.syncSteps({ date: todayKey(), steps, distanceKm })
    } catch {
      /* retry later */
    }
  }, [])

  const grantMotion = useCallback(async () => {
    const ok = await requestMotionPermission()
    setState((s) => ({ ...s, needsMotionPermission: !ok, tracking: ok || s.tracking }))
    return ok
  }, [])

  const mergeServerSteps = useCallback((serverSteps: number) => {
    const local = getLocalStepsToday().steps
    const merged = Math.max(local, serverSteps)
    if (merged > local) setLocalSteps(merged)
    setState((s) => ({ ...s, stepsToday: merged }))
  }, [])

  useEffect(() => {
    if (!isAutoStepTrackingEnabled()) return

    void (async () => {
      const motionOk = await requestMotionPermission()
      setState((s) => ({
        ...s,
        needsMotionPermission:
          typeof (DeviceMotionEvent as unknown as { requestPermission?: unknown }).requestPermission ===
            'function' && !motionOk,
        tracking: !!navigator.geolocation
      }))
    })()

    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude: lat, longitude: lng, speed } = pos.coords
          const now = Date.now()
          const prev = lastGeo.current
          lastGeo.current = { lat, lng, at: now }
          if (!prev) return

          const dLat = ((lat - prev.lat) * Math.PI) / 180
          const dLng = ((lng - prev.lng) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((prev.lat * Math.PI) / 180) *
              Math.cos((lat * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2
          const km = 6371 * 2 * Math.asin(Math.sqrt(a))
          if (km < 0.002 || km > 0.12) return
          if (now - prev.at < 4000 && km < 0.008) return

          if (!isLikelyWalking(speed, km)) return

          addLocalSteps(estimateSteps(km), km)
          refreshLocal()
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 25_000 }
      )
    }

    syncTimer.current = window.setInterval(() => void syncServer(), 45_000)
    void syncServer()

    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current)
      if (syncTimer.current != null) window.clearInterval(syncTimer.current)
    }
  }, [refreshLocal, syncServer])

  return { ...state, refreshLocal, grantMotion, mergeServerSteps }
}
