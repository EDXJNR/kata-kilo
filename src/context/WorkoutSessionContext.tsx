import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRestTimerControl } from '@/components/workouts/RestTimer'
import { useSavedPlans } from '@/hooks/useSavedPlans'
import { resolvePlan, planExercises } from '@/lib/plan-utils'
import { prefillWeeklyPlannerFromSession } from '@/lib/planner-prefill'
import { useWorkoutTimer } from '@/hooks/useWorkoutTimers'
import { api } from '@/lib/api'
import { enqueuePendingWorkout } from '@/lib/offline-workouts'
import { ApiError } from '@/types/field-log'
import {
  builderExercise,
  estimateCalories,
  loadSession,
  planToSession,
  saveSession,
  sessionExercisesCompleted,
  sessionVolumeKg,
  type SessionExercise,
  type WorkoutSessionState
} from '@/lib/workout-session'

type WorkoutSessionContextValue = {
  session: WorkoutSessionState | null
  setSession: (s: WorkoutSessionState | null) => void
  workoutTimer: ReturnType<typeof useWorkoutTimer>
  restTimer: ReturnType<typeof useRestTimerControl>
  builderName: string
  setBuilderName: (v: string) => void
  builderExercises: SessionExercise[]
  setBuilderExercises: React.Dispatch<React.SetStateAction<SessionExercise[]>>
  preparePlan: (planId: string) => void
  prepareBuilder: () => void
  beginWorkout: () => void
  startPlan: (planId: string) => void
  startBuilder: () => void
  finishWorkout: () => Promise<void>
  saving: boolean
  lastSavedOffline: boolean
}

const WorkoutSessionContext = createContext<WorkoutSessionContextValue | undefined>(undefined)

function normalizeSession(raw: WorkoutSessionState | null): WorkoutSessionState | null {
  if (!raw) return null
  if (raw.live === undefined) return { ...raw, live: true }
  return raw
}

export function WorkoutSessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [session, setSessionState] = useState<WorkoutSessionState | null>(() => normalizeSession(loadSession()))
  const [builderName, setBuilderName] = useState('Custom Workout')
  const [builderExercises, setBuilderExercises] = useState(() => [
    builderExercise('push-up'),
    builderExercise('bodyweight-squat')
  ])
  const [saving, setSaving] = useState(false)
  const [lastSavedOffline, setLastSavedOffline] = useState(false)
  const workoutTimer = useWorkoutTimer()
  const restTimer = useRestTimerControl(90)
  const { plans: savedPlans } = useSavedPlans()

  const setSession = useCallback((s: WorkoutSessionState | null) => {
    setSessionState(normalizeSession(s))
  }, [])

  useEffect(() => {
    saveSession(session)
  }, [session])

  const preparePlan = useCallback(
    (planId: string) => {
      const plan = resolvePlan(planId, savedPlans)
      if (!plan) return
      setSession(planToSession(plan.name, plan.id, planExercises(plan), false))
    },
    [savedPlans, setSession]
  )

  const prepareBuilder = useCallback(() => {
    setSession({
      name: builderName,
      startedAt: new Date().toISOString(),
      live: false,
      currentIndex: 0,
      exercises: builderExercises
    })
  }, [builderName, builderExercises, setSession])

  const beginWorkout = useCallback(() => {
    if (!session) return
    setSession({
      ...session,
      live: true,
      startedAt: new Date().toISOString()
    })
    workoutTimer.start()
    navigate('/workouts/train')
  }, [session, navigate, workoutTimer, setSession])

  const startPlan = useCallback(
    (planId: string) => {
      preparePlan(planId)
      navigate('/workouts/train')
    },
    [preparePlan, navigate]
  )

  const startBuilder = useCallback(() => {
    prepareBuilder()
    navigate('/workouts/train')
  }, [prepareBuilder, navigate])

  const finishWorkout = useCallback(async () => {
    if (!session) return
    setSaving(true)
    const durationSec = workoutTimer.stop()
    const durationMin = Math.max(1, Math.round(durationSec / 60))
    const volume = sessionVolumeKg(session)
    const completed = sessionExercisesCompleted(session)
    const payload = {
      name: session.name,
      duration_min: durationMin,
      volume_kg: Math.round(volume),
      exercises: session.exercises,
      calories_burned: estimateCalories(durationMin, volume),
      exercises_completed: completed,
      plan_type: session.planId ?? 'custom'
    }
    try {
      if (!navigator.onLine) {
        enqueuePendingWorkout(payload)
        setLastSavedOffline(true)
        setSession(null)
        saveSession(null)
        navigate('/workouts')
        return
      }
      await api.workouts.create(payload)
      try {
        await prefillWeeklyPlannerFromSession(session, durationMin)
      } catch {
        /* planner optional */
      }
      setLastSavedOffline(false)
      setSession(null)
      saveSession(null)
      navigate('/workouts')
    } catch (err) {
      if (err instanceof ApiError && err.status >= 500) {
        enqueuePendingWorkout(payload)
        setLastSavedOffline(true)
        setSession(null)
        saveSession(null)
        navigate('/workouts')
        return
      }
      throw err
    } finally {
      setSaving(false)
    }
  }, [session, workoutTimer, navigate, setSession])

  return (
    <WorkoutSessionContext.Provider
      value={{
        session,
        setSession,
        workoutTimer,
        restTimer,
        builderName,
        setBuilderName,
        builderExercises,
        setBuilderExercises,
        preparePlan,
        prepareBuilder,
        beginWorkout,
        startPlan,
        startBuilder,
        finishWorkout,
        saving,
        lastSavedOffline
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  )
}

export function useWorkoutSession() {
  const ctx = useContext(WorkoutSessionContext)
  if (!ctx) throw new Error('useWorkoutSession must be used within WorkoutSessionProvider')
  return ctx
}
