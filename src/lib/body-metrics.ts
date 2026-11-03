import type { BodyEntry } from '@/types/field-log'

/** WHO healthy BMI range */
export const BMI_HEALTHY_MIN = 18.5
export const BMI_HEALTHY_MAX = 24.9
export const BMI_TARGET = 22

export function bmi(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

export function bmiCategory(value: number): { label: string; color: string } {
  if (value < 18.5) return { label: 'Underweight', color: '#22d3ee' }
  if (value < 25) return { label: 'Healthy', color: '#4ade80' }
  if (value < 30) return { label: 'Overweight', color: '#F59E0B' }
  return { label: 'Obese', color: '#FF6B6B' }
}

/** 0–100 progress toward healthy BMI target (22) */
export function bmiTargetProgress(value: number): {
  pct: number
  target: number
  direction: 'lose' | 'gain' | 'maintain'
  kgToTarget: number | null
} {
  if (value >= BMI_HEALTHY_MIN && value <= BMI_HEALTHY_MAX) {
    const dist = Math.abs(value - BMI_TARGET)
    const pct = Math.round(Math.max(60, 100 - dist * 8))
    return { pct, target: BMI_TARGET, direction: 'maintain', kgToTarget: null }
  }
  if (value > BMI_HEALTHY_MAX) {
    const pct = Math.min(99, Math.round(((value - BMI_TARGET) / (value - BMI_HEALTHY_MIN)) * 100))
    return { pct: Math.max(5, 100 - pct), target: BMI_TARGET, direction: 'lose', kgToTarget: null }
  }
  const pct = Math.min(99, Math.round(((BMI_TARGET - value) / (BMI_HEALTHY_MIN - value)) * 50))
  return { pct: Math.max(5, 100 - pct), target: BMI_TARGET, direction: 'gain', kgToTarget: null }
}

export function weightForBmi(targetBmi: number, heightCm: number): number | null {
  if (heightCm <= 0) return null
  const m = heightCm / 100
  return Math.round(targetBmi * m * m * 10) / 10
}

export function latestMetric(entries: BodyEntry[], key: keyof BodyEntry): number | null {
  for (const e of entries) {
    const v = e[key]
    if (typeof v === 'number') return v
  }
  return null
}

export function metricTrend(entries: BodyEntry[], key: 'weight_kg' | 'waist_cm', days = 14) {
  return [...entries]
    .filter((e) => e[key] != null)
    .reverse()
    .slice(-days)
    .map((e) => ({
      label: new Date(e.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: Number(e[key])
    }))
}

export function bmiTrend(entries: BodyEntry[], heightCm: number, days = 14) {
  return [...entries]
    .filter((e) => e.weight_kg != null)
    .reverse()
    .slice(-days)
    .map((e) => ({
      label: new Date(e.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: bmi(e.weight_kg!, heightCm) ?? 0
    }))
    .filter((p) => p.value > 0)
}

export function weightChange7d(entries: BodyEntry[]): number | null {
  const weights = entries.filter((e) => e.weight_kg != null).slice(0, 7)
  if (weights.length < 2) return null
  const newest = weights[0].weight_kg!
  const oldest = weights[weights.length - 1].weight_kg!
  return Math.round((newest - oldest) * 10) / 10
}
