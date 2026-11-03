import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import LeafletRouteMap from '@/components/ui/LeafletRouteMap'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useLiveTracker } from '@/hooks/useLiveTracker'
import { api } from '@/lib/api'
import { estimateSteps, formatPace, paceMinPerKm } from '@/lib/geo'
import { useAutoSteps } from '@/components/activity/AutoStepTrackerRunner'

type ActivityType = 'walk' | 'run' | 'hike'

function dispatchGps(active: boolean) {
  window.dispatchEvent(new CustomEvent('katakilo:gps', { detail: { active } }))
}

export default function RouteTrack() {
  const { reload } = useAsyncData(() => api.routes.list())
  const tracker = useLiveTracker()
  const { stepsToday } = useAutoSteps()
  const [activityType, setActivityType] = useState<ActivityType>('walk')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const isActive = tracker.status === 'tracking' || tracker.status === 'paused'
  const liveSteps = estimateSteps(tracker.distanceKm)
  const distDisplay = (Math.round(tracker.distanceKm * 100) / 100).toFixed(2)

  useEffect(() => {
    dispatchGps(isActive)
    return () => dispatchGps(false)
  }, [isActive])

  async function saveActivity() {
    const result = tracker.stop()
    if (result.distanceKm < 0.01 || result.points.length < 2) {
      setSaveError('Track a short distance before saving')
      tracker.reset()
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await api.routes.create({
        name: `${activityType === 'walk' ? 'Walk' : activityType === 'hike' ? 'Hike' : 'Run'} ${new Date().toLocaleDateString()}`,
        distance_km: Math.round(result.distanceKm * 100) / 100,
        activity_type: activityType,
        path: result.points,
        steps: estimateSteps(result.distanceKm),
        avg_pace_min_km: paceMinPerKm(result.distanceKm, result.durationSec) ?? undefined,
        started_at: result.startedAt,
        ended_at: result.endedAt,
        duration_min: Math.max(1, Math.round(result.durationSec / 60))
      })
      tracker.reset()
      await reload()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save route')
    } finally {
      setSaving(false)
    }
  }

  function startHoldFinish() {
    holdTimer.current = setTimeout(() => {
      void saveActivity()
    }, 800)
  }

  function cancelHoldFinish() {
    if (holdTimer.current) clearTimeout(holdTimer.current)
  }

  const mobileHud = (
    <div className="flex flex-col w-full px-5 gap-4 pb-10 max-w-lg mx-auto font-body-hud bg-hud-surface lg:hidden">
      <div className="flex items-center justify-between pt-2">
        <span className="px-2.5 py-1 rounded-full bg-hud-primary-container text-hud-on-primary text-[10px] font-bold uppercase tracking-widest shadow-sm">
          Outdoor {activityType}
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-hud-container-lowest border border-hud-outline-variant/60 shadow-sm">
          <MaterialIcon name="satellite_alt" className="text-[14px] text-hud-primary" />
          <span className="text-[10px] font-bold text-hud-on uppercase">GPS</span>
        </div>
      </div>

      <div className="relative w-full h-72 rounded-xl overflow-hidden bg-slate-50 border border-hud-outline-variant/60 shadow-sm">
        <LeafletRouteMap points={tracker.points} height={288} />
        {isActive ? (
          <div className="absolute bottom-2.5 left-2.5 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-hud-container-lowest/95 border border-hud-outline-variant/60 shadow-md backdrop-blur-xl flex items-center gap-2">
            <MaterialIcon name="speed" className="text-[16px] text-hud-primary" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Live pace</span>
            <span className="font-display text-sm text-hud-on font-bold">{formatPace(tracker.pace)}</span>
          </div>
        ) : null}
      </div>

      {!isActive ? (
        <div className="flex gap-2 justify-center">
          {(['walk', 'run', 'hike'] as ActivityType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActivityType(type)}
              className={`rounded-full px-4 py-2 text-xs font-semibold capitalize border ${
                activityType === type
                  ? 'border-hud-primary bg-emerald-50 dark:bg-hud-primary/10 text-hud-on'
                  : 'border-hud-outline-variant text-hud-on-variant'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Distance" icon="straighten" value={distDisplay} unit="KM" progress={Math.min(100, (tracker.distanceKm / 5) * 100)} />
        <MetricCard label="Time" icon="timer" value={tracker.elapsedLabel.split('.')[0]} hint="Session" />
        <MetricCard label="Avg pace" icon="speed" value={formatPace(tracker.pace) || '—'} hint="On target" />
        <MetricCard label="Calories" icon="local_fire_department" value={String(Math.round(tracker.distanceKm * 67 + liveSteps * 0.04))} unit="KCAL" />
      </div>

      {tracker.error ? <p className="text-alert text-xs text-center">{tracker.error}</p> : null}
      {saveError ? <p className="text-alert text-xs text-center">{saveError}</p> : null}

      <div className="flex items-center justify-between gap-3">
        {tracker.status === 'idle' ? (
          <button
            type="button"
            onClick={tracker.start}
            className="flex-1 py-3.5 rounded-xl bg-hud-primary-container text-hud-on-primary font-display text-sm font-bold uppercase shadow-md"
          >
            Start {activityType}
          </button>
        ) : null}
        {tracker.status === 'tracking' ? (
          <>
            <button
              type="button"
              onClick={tracker.pause}
              className="flex-1 py-3.5 rounded-xl bg-hud-container-lowest border-2 border-hud-outline-variant/60 text-hud-on flex items-center justify-center gap-2 font-display text-sm font-bold uppercase shadow-sm"
            >
              <MaterialIcon name="pause" className="text-[22px]" />
              Pause
            </button>
            <button
              type="button"
              onMouseDown={startHoldFinish}
              onMouseUp={cancelHoldFinish}
              onMouseLeave={cancelHoldFinish}
              onTouchStart={startHoldFinish}
              onTouchEnd={cancelHoldFinish}
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-hud-primary-container text-hud-on-primary flex items-center justify-center gap-2 font-display text-sm font-bold uppercase shadow-md disabled:opacity-50"
            >
              <MaterialIcon name="flag" className="text-[22px]" />
              Hold to finish
            </button>
          </>
        ) : null}
        {tracker.status === 'paused' ? (
          <>
            <button
              type="button"
              onClick={tracker.resume}
              className="flex-1 py-3.5 rounded-xl bg-hud-primary-container text-hud-on-primary font-display text-sm font-bold uppercase"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => void saveActivity()}
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-hud-primary text-hud-on-primary font-display text-sm font-bold uppercase disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Finish'}
            </button>
          </>
        ) : null}
      </div>

      {!isActive ? (
        <p className="text-center text-sm text-hud-on-variant">
          Background steps today: <strong className="text-hud-on tabular-nums">{stepsToday.toLocaleString()}</strong>
        </p>
      ) : null}

      <Link to="/routes/history" className="text-center text-sm text-hud-primary font-semibold hover:underline pb-2">
        Route history →
      </Link>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Walk & Run" subtitle="GPS sessions for outdoor walk, run, or hike." />
      </div>
      {mobileHud}
      <div className="hidden lg:block">
        <PageShell>
          <LeafletRouteMap points={tracker.points} height={320} />
          <p className="text-sm text-fog mt-4">Steps today: {stepsToday.toLocaleString()}</p>
        </PageShell>
      </div>
    </>
  )
}

function MetricCard({
  label,
  icon,
  value,
  unit,
  hint,
  progress
}: {
  label: string
  icon: string
  value: string
  unit?: string
  hint?: string
  progress?: number
}) {
  return (
    <div className="flex flex-col p-3.5 rounded-xl bg-hud-container-lowest border border-hud-outline-variant/60 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
        <MaterialIcon name={icon} className="text-[18px] text-hud-primary" />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-[32px] leading-tight text-hud-on font-bold tracking-tight tabular-nums">{value}</span>
        {unit ? <span className="font-display text-base text-hud-primary font-bold">{unit}</span> : null}
      </div>
      {progress != null ? (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div className="bg-hud-primary-container h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      ) : hint ? (
        <span className="text-[10px] text-slate-500 mt-2 font-medium">{hint}</span>
      ) : null}
    </div>
  )
}
