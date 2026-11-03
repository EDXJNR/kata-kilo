import type { Exercise } from '@/data/exercises'
import { getExercise } from '@/data/exercises'
import type { PlanExercise } from '@/data/workout-plans'

export type LoggedSet = {
  reps: number
  weightKg: number
  isPr?: boolean
}

export type SessionExercise = {
  exerciseId: string
  targetSets: number
  targetReps: string
  restSec: number
  sets: LoggedSet[]
}

export type WorkoutSessionState = {
  name: string
  planId?: string
  startedAt: string
  exercises: SessionExercise[]
  currentIndex: number
  /** When false, user picked a workout but has not started the clock yet */
  live?: boolean
}

const STORAGE_KEY = 'katakilo.workout.session'

export function planToSession(
  name: string,
  planId: string,
  items: PlanExercise[],
  live = false
): WorkoutSessionState {
  return {
    name,
    planId,
    startedAt: new Date().toISOString(),
    live,
    currentIndex: 0,
    exercises: items.map((item) => ({
      exerciseId: item.exerciseId,
      targetSets: item.sets,
      targetReps: item.reps,
      restSec: item.restSec,
      sets: []
    }))
  }
}

export function builderExercise(exerciseId: string, sets = 3, reps = '10', restSec = 90): SessionExercise {
  return { exerciseId, targetSets: sets, targetReps: reps, restSec, sets: [] }
}

export function loadSession(): WorkoutSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WorkoutSessionState) : null
  } catch {
    return null
  }
}

export function saveSession(session: WorkoutSessionState | null) {
  if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  else localStorage.removeItem(STORAGE_KEY)
}

export function sessionVolumeKg(session: WorkoutSessionState): number {
  return session.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps * set.weightKg, 0),
    0
  )
}

export function sessionExercisesCompleted(session: WorkoutSessionState): number {
  return session.exercises.filter((ex) => ex.sets.length >= ex.targetSets).length
}

export function estimateCalories(durationMin: number, volumeKg: number): number {
  return Math.round(durationMin * 6 + volumeKg * 0.05)
}

export function getSessionExercise(session: WorkoutSessionState, index: number) {
  const item = session.exercises[index]
  if (!item) return null
  const exercise = getExercise(item.exerciseId)
  return exercise ? { ...item, exercise } : null
}

export type PersonalRecord = {
  exerciseId: string
  exerciseName: string
  weightKg: number
  reps: number
  date: string
}

export function computePRs(
  entries: { recorded_at: string; exercises?: SessionExercise[] | null }[]
): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>()
  for (const entry of entries) {
    for (const ex of entry.exercises ?? []) {
      const meta = getExercise(ex.exerciseId)
      if (!meta) continue
      for (const set of ex.sets) {
        const score = set.weightKg * (1 + set.reps / 30)
        const prev = best.get(ex.exerciseId)
        const prevScore = prev ? prev.weightKg * (1 + prev.reps / 30) : 0
        if (score > prevScore) {
          best.set(ex.exerciseId, {
            exerciseId: ex.exerciseId,
            exerciseName: meta.name,
            weightKg: set.weightKg,
            reps: set.reps,
            date: entry.recorded_at
          })
        }
      }
    }
  }
  return [...best.values()]
}

export type { Exercise }
