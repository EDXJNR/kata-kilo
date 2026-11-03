import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import LoadingState from '@/components/ui/LoadingState'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useSleepTracker } from '@/hooks/useSleepTracker'
import { api } from '@/lib/api'
import {
  estimateSleepStages,
  formatBedWindow,
  formatSleepDuration,
  recoveryBadge,
  recoveryFromEntry,
  stageMinLabel
} from '@/lib/sleep-display'

const ALARM_KEY = 'katakilo.sleep.smartAlarm'
const TARGET_H = 7.5
const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

function loadAlarmOn() {
  try {
    return localStorage.getItem(ALARM_KEY) !== 'off'
  } catch {
    return true
  }
}

function RecoveryRing({ pct }: { pct: number }) {
  const r = 40
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)
  return (
    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle className="text-hud-container-high" cx="50" cy="50" fill="none" r={r} stroke="currentColor" strokeWidth="8" />
        <circle
          className="text-hud-primary transition-all duration-700 ease-out"
          cx="50"
          cy="50"
          fill="none"
          r={r}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8.5"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl leading-none font-bold text-hud-on">
          {pct}
          <span className="text-xs text-hud-primary font-bold">%</span>
        </span>
        <span className="text-[9px] uppercase tracking-wider text-hud-on-variant font-semibold mt-0.5">Restored</span>
      </div>
    </div>
  )
}

export default function SleepHub() {
  const { data, loading, error, reload } = useAsyncData(() => api.sleep.list())
  const { data: profile } = useAsyncData(() => api.profile.get())
  const { data: readiness } = useAsyncData(() => api.story.readiness())
  const tracker = useSleepTracker(reload)
  const [alarmOn, setAlarmOn] = useState(loadAlarmOn)
  const [windState, setWindState] = useState<'idle' | 'loading' | 'active'>('idle')

  const trainingDays = profile?.training_days?.length ?? 3
  const sleepGoal = Math.min(9, Math.round((7 + trainingDays * 0.15) * 10) / 10)

  const lastNight = data?.entries[0] ?? null
  const trend = data?.trend ?? []

  const derived = useMemo(() => {
    const durationH = tracker.isTracking
      ? tracker.elapsedH
      : (lastNight?.duration_h ?? null)
    const recovery = tracker.isTracking
      ? null
      : recoveryFromEntry(lastNight, readiness?.score ?? null)
    const stages = durationH != null ? estimateSleepStages(durationH) : null
    const bedWindow = tracker.isTracking && tracker.session
      ? `Tracking since ${new Date(tracker.session.startedAt).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit'
        })}`
      : formatBedWindow(lastNight)
    const weekBars = buildWeekBars(trend, durationH, tracker.isTracking)
    const weekAvg =
      weekBars.length > 0
        ? weekBars.reduce((s, b) => s + b.hours, 0) / weekBars.filter((b) => b.hours > 0).length
        : null
    const debtMin =
      durationH != null && !tracker.isTracking
        ? Math.max(0, Math.round((sleepGoal - durationH) * 60))
        : 0
    return { durationH, recovery, stages, bedWindow, weekBars, weekAvg, debtMin }
  }, [lastNight, readiness?.score, trend, tracker.elapsedH, tracker.isTracking, tracker.session, sleepGoal])

  async function onWindDown() {
    if (tracker.isTracking) {
      await tracker.finishTracking()
      setWindState('idle')
      return
    }
    setWindState('loading')
    tracker.startTracking()
    setTimeout(() => setWindState('active'), 700)
    setTimeout(() => setWindState('idle'), 3200)
  }

  function toggleAlarm() {
    const next = !alarmOn
    setAlarmOn(next)
    try {
      localStorage.setItem(ALARM_KEY, next ? 'on' : 'off')
    } catch {
      /* ignore */
    }
  }

  if (loading) return <LoadingState />

  const dur = derived.durationH != null ? formatSleepDuration(derived.durationH) : null

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Sleep" subtitle="Recovery index, stages, and weekly rhythm." />
      </div>
      <div className="flex flex-col w-full px-5 lg:px-8 pb-10 gap-5 max-w-lg mx-auto lg:max-w-3xl font-body-hud bg-hud-surface min-h-full mt-2 lg:mt-0">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <section className="bg-hud-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-4 relative overflow-hidden border border-hud-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hud-primary" />
              <span className="text-xs text-hud-on-variant uppercase tracking-wider font-semibold">Recovery index</span>
            </div>
            <span className="bg-hud-container-low text-hud-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              {tracker.isTracking ? 'In session' : recoveryBadge(derived.recovery)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Duration</span>
              {dur ? (
                <div className="flex items-baseline gap-0.5 font-display font-bold text-hud-on tracking-tight text-3xl">
                  {dur.hrs}
                  <span className="text-hud-on-variant text-lg">h</span> {dur.mins}
                  <span className="text-hud-on-variant text-lg">m</span>
                </div>
              ) : (
                <p className="font-display text-xl font-bold text-hud-on">No sleep logged</p>
              )}
              <p className="text-sm text-hud-on-variant mt-0.5 truncate">
                {derived.bedWindow ?? 'Track tonight or log a session in history'}
              </p>
            </div>
            {derived.recovery != null ? <RecoveryRing pct={derived.recovery} /> : null}
          </div>
          {!tracker.isTracking ? (
            <div className="flex flex-col gap-2">
              {derived.recovery != null ? (
                <div className="bg-hud-container-low rounded-lg p-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <MaterialIcon name="check_circle" className="text-[18px] text-hud-primary shrink-0" filled />
                    <span className="text-sm text-hud-on font-medium truncate">
                      {readiness?.factors[0]?.label ?? 'Sleep aligned with your training load'}
                    </span>
                  </div>
                  <Link to="/sleep/history" className="font-display text-xs text-hud-on-variant shrink-0 hover:text-hud-primary">
                    History
                  </Link>
                </div>
              ) : null}
              <div className="bg-hud-container-low rounded-lg p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MaterialIcon name="timelapse" className="text-[18px] text-hud-primary shrink-0" />
                  <span className="text-sm text-hud-on font-medium">
                    Sleep debt · {derived.debtMin} min
                  </span>
                </div>
                <span className="text-xs font-display font-semibold text-hud-primary shrink-0">
                  {derived.debtMin === 0 ? 'Caught up' : 'Below goal'}
                </span>
              </div>
            </div>
          ) : null}
        </section>

        {derived.stages ? (
          <section className="bg-hud-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-3 border border-hud-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Architecture</span>
              <span className="font-display text-xs text-hud-on font-semibold">{derived.stages.efficiency}% efficiency</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-hud-container-high gap-0.5 my-1">
              <div className="h-full bg-hud-primary" style={{ width: `${derived.stages.deep.pct * 100}%` }} title="Deep" />
              <div className="h-full bg-emerald-300 dark:bg-emerald-600/70" style={{ width: `${derived.stages.rem.pct * 100}%` }} title="REM" />
              <div className="h-full bg-slate-300 dark:bg-slate-600" style={{ width: `${derived.stages.core.pct * 100}%` }} title="Core" />
              <div className="h-full bg-red-100 dark:bg-red-900/40" style={{ width: `${derived.stages.awake.pct * 100}%` }} title="Awake" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <StageRow color="bg-hud-primary" label="Deep" min={derived.stages.deep.min} pct={derived.stages.deep.pct} />
              <StageRow color="bg-emerald-300" label="REM" min={derived.stages.rem.min} pct={derived.stages.rem.pct} />
              <StageRow color="bg-slate-300" label="Core" min={derived.stages.core.min} pct={derived.stages.core.pct} />
              <StageRow color="bg-red-100" label="Awake" min={derived.stages.awake.min} pct={derived.stages.awake.pct} />
            </div>
            <p className="text-[10px] text-hud-on-variant">Stage split is estimated from duration when device data isn&apos;t linked.</p>
          </section>
        ) : null}

        <section className="bg-hud-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-4 border border-hud-outline-variant/30">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Weekly rhythm</span>
              <p className="text-sm text-hud-on font-semibold">{sleepGoal}h target threshold</p>
            </div>
            {derived.weekAvg != null && !Number.isNaN(derived.weekAvg) ? (
              <span className="font-display text-xs bg-hud-container-low text-hud-primary px-2 py-0.5 rounded-full font-bold">
                Avg {formatSleepDuration(derived.weekAvg).label}
              </span>
            ) : null}
          </div>
          <div className="relative pt-6 pb-2">
            <div
              className="absolute inset-x-0 border-t border-dashed border-hud-outline-variant flex justify-end"
              style={{ top: `${100 - (TARGET_H / 10) * 100 * 0.72}%` }}
            >
              <span className="text-[9px] text-hud-on-variant -mt-3.5 bg-hud-container-lowest pl-1">
                Target {Math.floor(TARGET_H)}h {Math.round((TARGET_H % 1) * 60)}m
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end h-28 relative z-10">
              {derived.weekBars.map((bar, i) => {
                const hit = bar.hours >= TARGET_H
                const isToday = i === derived.weekBars.length - 1
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      className={`w-full max-w-[28px] rounded-t transition-all relative ${
                        hit ? 'bg-hud-primary' : 'bg-slate-300 dark:bg-slate-600'
                      } ${isToday ? 'shadow-sm' : ''}`}
                      style={{ height: `${bar.heightPct}%` }}
                    >
                      {isToday && bar.hours > 0 ? (
                        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-300" />
                      ) : null}
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-hud-primary font-bold' : 'text-hud-on-variant'}`}>
                      {WEEK_LABELS[i]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-hud-container-lowest rounded-xl shadow-sm p-4 flex flex-col gap-4 border border-hud-outline-variant/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-hud-container-low flex items-center justify-center text-hud-on shrink-0">
                <MaterialIcon name="alarm" className="text-[20px]" />
              </div>
              <div className="min-w-0">
                <span className="font-display text-sm text-hud-on block font-semibold">Smart haptic alarm</span>
                <span className="text-sm text-hud-on-variant truncate block">Silent wake at lightest stage · 6:45 AM</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={alarmOn}
              onClick={toggleAlarm}
              className={`w-12 h-7 rounded-full relative p-0.5 transition-colors shrink-0 ${
                alarmOn ? 'bg-hud-primary' : 'bg-hud-container-highest'
              }`}
            >
              <span
                className={`block w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${
                  alarmOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <button
            type="button"
            onClick={onWindDown}
            disabled={tracker.saving || windState === 'loading'}
            className="w-full bg-slate-900 dark:bg-hud-on text-white dark:text-hud-surface font-display font-semibold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-70"
          >
            {windState === 'loading' ? (
              <>
                <MaterialIcon name="refresh" className="text-[20px] text-emerald-300 animate-spin" />
                <span>Initiating wind down…</span>
              </>
            ) : windState === 'active' || tracker.isTracking ? (
              <>
                <MaterialIcon name="check" className="text-[20px] text-emerald-300" />
                <span>{tracker.isTracking ? 'Wake up & save' : 'Wind down active'}</span>
              </>
            ) : (
              <>
                <MaterialIcon name="nightlight" className="text-[20px] text-emerald-300" />
                <span>Bedtime wind down</span>
              </>
            )}
          </button>
          {tracker.error ? <p className="text-xs text-red-600">{tracker.error}</p> : null}
        </section>
      </div>
    </>
  )
}

function StageRow({ color, label, min, pct }: { color: string; label: string; min: number; pct: number }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-hud-container-low">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-sm text-hud-on font-medium">{label}</span>
      </div>
      <div className="text-right">
        <span className="font-display text-sm text-hud-on font-semibold">{stageMinLabel(min)}</span>
        <span className="text-[10px] text-hud-on-variant ml-1">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  )
}

function buildWeekBars(trend: { label: string; value: number }[], tonightH: number | null, tracking: boolean) {
  const values = trend.slice(-7)
  while (values.length < 7) {
    values.unshift({ label: '', value: 0 })
  }
  if (tracking && tonightH != null) {
    values[values.length - 1] = { ...values[values.length - 1], value: tonightH }
  } else if (tonightH != null && values[values.length - 1]?.value === 0) {
    values[values.length - 1] = { ...values[values.length - 1], value: tonightH }
  }
  const maxH = Math.max(TARGET_H, ...values.map((v) => v.value), 1)
  return values.map((v) => ({
    hours: v.value,
    heightPct: Math.max(8, Math.round((v.value / maxH) * 100))
  }))
}
