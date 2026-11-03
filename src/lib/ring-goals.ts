import type { ActivityRing } from '@/types/field-log'

export type RingGoals = {
  move: number
  train: number
  distance: number
}

export const DEFAULT_RING_GOALS: RingGoals = {
  move: 500,
  train: 30,
  distance: 5
}

const STORAGE_KEY = 'katakilo.ringGoals'

export function loadRingGoalsLocal(): RingGoals {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_RING_GOALS
    const parsed = JSON.parse(raw) as Partial<RingGoals>
    return {
      move: parsed.move ?? DEFAULT_RING_GOALS.move,
      train: parsed.train ?? DEFAULT_RING_GOALS.train,
      distance: parsed.distance ?? DEFAULT_RING_GOALS.distance
    }
  } catch {
    return DEFAULT_RING_GOALS
  }
}

export function saveRingGoalsLocal(goals: RingGoals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

export function applyRingGoals(rings: ActivityRing[], goals: RingGoals): ActivityRing[] {
  const goalMap: Record<string, number> = {
    Move: goals.move,
    Train: goals.train,
    Distance: goals.distance
  }
  return rings.map((r) => ({ ...r, goal: goalMap[r.label] ?? r.goal }))
}

export function parseRingGoalsFromProfile(raw: unknown): RingGoals | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  return {
    move: Number(o.move) || DEFAULT_RING_GOALS.move,
    train: Number(o.train) || DEFAULT_RING_GOALS.train,
    distance: Number(o.distance) || DEFAULT_RING_GOALS.distance
  }
}
