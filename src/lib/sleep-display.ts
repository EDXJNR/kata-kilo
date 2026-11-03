import type { SleepEntry } from '@/types/field-log'

const STAGE_SHARES = { deep: 0.23, rem: 0.27, core: 0.43, awake: 0.07 } as const

export function formatSleepDuration(durationH: number) {
  const hrs = Math.floor(durationH)
  const mins = Math.round((durationH - hrs) * 60)
  return { hrs, mins, label: `${hrs}h ${mins}m` }
}

export function formatBedWindow(entry: SleepEntry | null | undefined) {
  if (!entry?.started_at || !entry?.ended_at) return null
  const start = new Date(entry.started_at)
  const end = new Date(entry.ended_at)
  const fmt = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })
  return `In bed ${fmt(start)} – ${fmt(end)}`
}

export function estimateSleepStages(durationH: number) {
  const totalMin = Math.round(durationH * 60)
  const deep = Math.round(totalMin * STAGE_SHARES.deep)
  const rem = Math.round(totalMin * STAGE_SHARES.rem)
  const core = Math.round(totalMin * STAGE_SHARES.core)
  const awake = Math.max(0, totalMin - deep - rem - core)
  return {
    deep: { min: deep, pct: STAGE_SHARES.deep },
    rem: { min: rem, pct: STAGE_SHARES.rem },
    core: { min: core, pct: STAGE_SHARES.core },
    awake: { min: awake, pct: awake / totalMin || STAGE_SHARES.awake },
    efficiency: Math.round((1 - STAGE_SHARES.awake) * 100)
  }
}

export function stageMinLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

export function recoveryFromEntry(entry: SleepEntry | null | undefined, readinessScore: number | null) {
  if (readinessScore != null) return Math.min(100, Math.max(0, Math.round(readinessScore)))
  if (entry?.quality != null) return Math.min(100, Math.max(0, Math.round(entry.quality * 10)))
  if (entry?.duration_h != null) {
    const target = 7.5
    return Math.min(100, Math.max(35, Math.round((entry.duration_h / target) * 88)))
  }
  return null
}

export function recoveryBadge(score: number | null) {
  if (score == null) return 'Log sleep'
  if (score >= 80) return 'Optimal range'
  if (score >= 60) return 'Moderate'
  return 'Recover'
}
