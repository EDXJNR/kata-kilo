import { useEffect, useRef } from 'react'
import { parseTargetReps, speak } from '@/lib/voice-coach'

type Args = {
  enabled: boolean
  targetReps: string
  setNumber: number
  totalSets: number
  restRunning: boolean
  restSecondsLeft: number
  exerciseName: string
  guidedActive: boolean
}

/** Voice for reps + rest — does not announce workout session start. */
export function useWorkoutVoiceCoach({
  enabled,
  targetReps,
  setNumber,
  totalSets,
  restRunning,
  restSecondsLeft,
  exerciseName,
  guidedActive
}: Args) {
  const prevRestRunning = useRef(false)
  const repInterval = useRef<number | null>(null)
  const holdInterval = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || !guidedActive) return

    if (restRunning) {
      if (restSecondsLeft <= 5 && restSecondsLeft > 0) {
        speak(String(restSecondsLeft))
      }
      if (restSecondsLeft === 0 && prevRestRunning.current) {
        speak('Rest complete')
      }
    }

    if (prevRestRunning.current && !restRunning) {
      const { mode, count } = parseTargetReps(targetReps)
      speak(`Set ${setNumber} of ${totalSets}. ${exerciseName}. Go.`)

      if (repInterval.current) window.clearInterval(repInterval.current)
      if (holdInterval.current) window.clearInterval(holdInterval.current)

      if (mode === 'hold') {
        let left = count
        speak(`${left}`)
        holdInterval.current = window.setInterval(() => {
          left -= 1
          if (left <= 0) {
            window.clearInterval(holdInterval.current!)
            speak('Hold complete. Log your set when ready.')
            return
          }
          if (left <= 5 || left % 5 === 0) speak(String(left))
        }, 1000)
      } else {
        let rep = 0
        repInterval.current = window.setInterval(() => {
          rep += 1
          if (rep > count) {
            window.clearInterval(repInterval.current!)
            speak('Target reps reached. Log your set.')
            return
          }
          speak(String(rep))
        }, 2200)
      }
    }

    prevRestRunning.current = restRunning

    return () => {
      if (repInterval.current) window.clearInterval(repInterval.current)
      if (holdInterval.current) window.clearInterval(holdInterval.current)
    }
  }, [
    enabled,
    guidedActive,
    restRunning,
    restSecondsLeft,
    targetReps,
    setNumber,
    totalSets,
    exerciseName
  ])
}
