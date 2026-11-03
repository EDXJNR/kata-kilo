const STEPS_KEY = 'katakilo.steps.byDate'
const STEP_GOAL_KEY = 'katakilo.stepGoal'
const AUTO_TRACK_KEY = 'katakilo.autoSteps'

export const DEFAULT_STEP_GOAL = 10_000

export function todayKey() {
  return new Date().toLocaleDateString('en-CA')
}

type StepStore = Record<string, { steps: number; distanceKm: number }>

function readStore(): StepStore {
  try {
    const raw = localStorage.getItem(STEPS_KEY)
    return raw ? (JSON.parse(raw) as StepStore) : {}
  } catch {
    return {}
  }
}

function writeStore(store: StepStore) {
  localStorage.setItem(STEPS_KEY, JSON.stringify(store))
}

export function getLocalStepsToday(): { steps: number; distanceKm: number } {
  const key = todayKey()
  const row = readStore()[key]
  return { steps: row?.steps ?? 0, distanceKm: row?.distanceKm ?? 0 }
}

export function addLocalSteps(deltaSteps: number, deltaKm = 0) {
  if (deltaSteps <= 0 && deltaKm <= 0) return getLocalStepsToday()
  const key = todayKey()
  const store = readStore()
  const prev = store[key] ?? { steps: 0, distanceKm: 0 }
  store[key] = {
    steps: Math.max(0, prev.steps + Math.round(deltaSteps)),
    distanceKm: Math.round((prev.distanceKm + deltaKm) * 100) / 100
  }
  writeStore(store)
  return store[key]
}

export function setLocalSteps(steps: number, distanceKm?: number) {
  const key = todayKey()
  const store = readStore()
  store[key] = {
    steps: Math.max(0, Math.round(steps)),
    distanceKm: distanceKm ?? store[key]?.distanceKm ?? 0
  }
  writeStore(store)
  return store[key]
}

export function getStepGoal(): number {
  const n = Number(localStorage.getItem(STEP_GOAL_KEY))
  return n > 0 ? n : DEFAULT_STEP_GOAL
}

export function setStepGoal(goal: number) {
  localStorage.setItem(STEP_GOAL_KEY, String(Math.max(1000, Math.round(goal))))
}

export function isAutoStepTrackingEnabled(): boolean {
  return localStorage.getItem(AUTO_TRACK_KEY) !== 'off'
}

export function setAutoStepTracking(enabled: boolean) {
  localStorage.setItem(AUTO_TRACK_KEY, enabled ? 'on' : 'off')
}

export function last7DayKeys(): string[] {
  const keys: string[] = []
  const d = new Date()
  for (let i = 6; i >= 0; i--) {
    const copy = new Date(d)
    copy.setDate(copy.getDate() - i)
    keys.push(copy.toLocaleDateString('en-CA'))
  }
  return keys
}

export function stepsForDate(dateKey: string): number {
  return readStore()[dateKey]?.steps ?? 0
}
