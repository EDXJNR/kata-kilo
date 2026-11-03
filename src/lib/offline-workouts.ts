import type { WorkoutExerciseLog } from '@/types/field-log'

export type PendingWorkout = {
  id: string
  createdAt: string
  payload: {
    name: string
    duration_min: number
    volume_kg: number
    exercises: WorkoutExerciseLog[]
    calories_burned: number
    exercises_completed: number
    plan_type: string
  }
}

const QUEUE_KEY = 'katakilo.offline.workouts'

export function loadPendingWorkouts(): PendingWorkout[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PendingWorkout[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function enqueuePendingWorkout(payload: PendingWorkout['payload']) {
  const item: PendingWorkout = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload
  }
  const next = [...loadPendingWorkouts(), item]
  localStorage.setItem(QUEUE_KEY, JSON.stringify(next))
  return item
}

export function removePendingWorkout(id: string) {
  const next = loadPendingWorkouts().filter((w) => w.id !== id)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(next))
}
