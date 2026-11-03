import { useCallback, useEffect, useRef, useState } from 'react'

export function useRestTimer(defaultSec = 90) {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [totalSec, setTotalSec] = useState(defaultSec)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(
    (sec = defaultSec) => {
      clear()
      setTotalSec(sec)
      setSecondsLeft(sec)
      setRunning(true)
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clear()
            setRunning(false)
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200)
            return 0
          }
          return s - 1
        })
      }, 1000)
    },
    [clear, defaultSec]
  )

  const skip = useCallback(() => {
    clear()
    setSecondsLeft(0)
    setRunning(false)
  }, [clear])

  useEffect(() => () => clear(), [clear])

  const label = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

  const progress = totalSec > 0 && running ? secondsLeft / totalSec : 0

  return { secondsLeft, totalSec, progress, running, label, start, skip }
}

export function useWorkoutTimer() {
  const [elapsedSec, setElapsedSec] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef<number | null>(null)

  const start = useCallback(() => {
    setRunning(true)
    ref.current = window.setInterval(() => setElapsedSec((s) => s + 1), 1000)
  }, [])

  const pause = useCallback(() => {
    setRunning(false)
    if (ref.current != null) window.clearInterval(ref.current)
  }, [])

  const stop = useCallback(() => {
    pause()
    const dur = elapsedSec
    setElapsedSec(0)
    return dur
  }, [elapsedSec, pause])

  useEffect(() => () => {
    if (ref.current != null) window.clearInterval(ref.current)
  }, [])

  const label = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, '0')}`

  return { elapsedSec, running, label, start, pause, stop }
}
