import { useCallback, useEffect, useRef, useState } from 'react'
import type { LatLng } from '@/lib/geo'
import { formatDuration, pathDistanceKm, paceMinPerKm } from '@/lib/geo'

export type TrackerStatus = 'idle' | 'tracking' | 'paused'

export function useLiveTracker() {
  const [status, setStatus] = useState<TrackerStatus>('idle')
  const [points, setPoints] = useState<LatLng[]>([])
  const [elapsedSec, setElapsedSec] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const watchId = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const startedAt = useRef<string | null>(null)
  const pointsRef = useRef<LatLng[]>([])

  const distanceKm = pathDistanceKm(points)
  const pace = paceMinPerKm(distanceKm, elapsedSec)

  useEffect(() => {
    pointsRef.current = points
  }, [points])

  const clearWatch = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
  }, [stopTimer])

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError('GPS not available on this device')
      return
    }
    setError(null)
    setPoints([])
    setElapsedSec(0)
    startedAt.current = new Date().toISOString()
    setStatus('tracking')

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPoints((prev) => {
          if (prev.length === 0) return [point]
          const last = prev[prev.length - 1]
          const dup =
            Math.abs(last.lat - point.lat) < 0.00001 && Math.abs(last.lng - point.lng) < 0.00001
          return dup ? prev : [...prev, point]
        })
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )
    startTimer()
  }, [startTimer])

  const pause = useCallback(() => {
    clearWatch()
    stopTimer()
    setStatus('paused')
  }, [clearWatch, stopTimer])

  const resume = useCallback(() => {
    if (status !== 'paused') return
    setStatus('tracking')
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPoints((prev) => [...prev, point])
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )
    startTimer()
  }, [status, startTimer])

  const stop = useCallback(() => {
    clearWatch()
    stopTimer()
    setStatus('idle')
    const endedAt = new Date().toISOString()
    const finalPoints = [...pointsRef.current]
    const result = {
      points: finalPoints,
      distanceKm: pathDistanceKm(finalPoints),
      durationSec: elapsedSec,
      durationLabel: formatDuration(elapsedSec),
      startedAt: startedAt.current ?? endedAt,
      endedAt
    }
    startedAt.current = null
    return result
  }, [clearWatch, stopTimer, elapsedSec])

  const reset = useCallback(() => {
    clearWatch()
    stopTimer()
    setPoints([])
    setElapsedSec(0)
    setStatus('idle')
    setError(null)
    startedAt.current = null
  }, [clearWatch, stopTimer])

  useEffect(() => {
    return () => {
      clearWatch()
      stopTimer()
    }
  }, [clearWatch, stopTimer])

  return {
    status,
    points,
    distanceKm,
    elapsedSec,
    elapsedLabel: formatDuration(elapsedSec),
    pace,
    error,
    start,
    pause,
    resume,
    stop,
    reset
  }
}
