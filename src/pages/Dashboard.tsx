import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import HudConcentricRings from '@/components/hud/HudConcentricRings'
import MaterialIcon from '@/components/hud/MaterialIcon'
import LoadingState from '@/components/ui/LoadingState'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import {
  applyRingGoals,
  loadRingGoalsLocal,
  parseRingGoalsFromProfile,
  type RingGoals
} from '@/lib/ring-goals'
import { useAutoSteps } from '@/components/activity/AutoStepTrackerRunner'
import MotionPermissionBanner from '@/components/activity/MotionPermissionBanner'
import { HABIT_CATALOG } from '@/lib/habit-catalog'

const STEP_GOAL = 10000

export default function Dashboard() {
  const { data, loading, error } = useAsyncData(() => api.dashboard.get())
  const { data: profile } = useAsyncData(() => api.profile.get())
  const { data: readiness } = useAsyncData(() => api.story.readiness())
  const { data: habits, reload: reloadHabits } = useAsyncData(() => api.habits.get())
  const [goals] = useState<RingGoals>(() => loadRingGoalsLocal())
  const { stepsToday: autoStepsToday, distanceKm: autoDistKm, mergeServerSteps } = useAutoSteps()

  useEffect(() => {
    if (data?.stepsToday != null) mergeServerSteps(data.stepsToday)
  }, [data?.stepsToday, mergeServerSteps])

  const stepsToday = Math.max(data?.stepsToday ?? 0, autoStepsToday)
  const distanceTodayKm = Math.max(data?.distanceTodayKm ?? 0, autoDistKm)

  const ringSpecs = useMemo(() => {
    if (!data?.rings) return []
    const profileGoals = parseRingGoalsFromProfile(profile?.ring_goals) ?? goals
    const adjusted = data.rings.map((r) =>
      r.label === 'Move'
        ? { ...r, current: r.current + Math.round(stepsToday * 0.04) }
        : r.label === 'Distance'
          ? { ...r, current: distanceTodayKm }
          : r
    )
    const withBrand = applyRingGoals(adjusted, profileGoals)
    return withBrand.slice(0, 3).map((r) => ({
      label: r.label === 'Distance' ? 'Steps' : r.label,
      current:
        r.label === 'Move'
          ? r.current
          : r.label === 'Distance'
            ? stepsToday
            : r.label === 'Train'
              ? r.current
              : r.current,
      goal: r.label === 'Distance' ? STEP_GOAL : r.goal,
      color: r.label === 'Move' ? '#16a34a' : r.label === 'Train' ? '#0ea5e9' : '#f59e0b',
      unit: r.label === 'Train' ? 'min' : r.label === 'Move' ? 'kcal' : ''
    }))
  }, [data?.rings, goals, profile?.ring_goals, stepsToday, distanceTodayKm])

  const todayDone = useMemo(
    () => new Set(habits?.today.filter((l) => l.completed).map((l) => l.habit_key) ?? []),
    [habits?.today]
  )

  const maxStreak = useMemo(() => {
    if (!habits?.streaks) return 0
    return Math.max(0, ...Object.values(habits.streaks))
  }, [habits?.streaks])

  const overallPct =
    ringSpecs.length > 0
      ? Math.round(ringSpecs.reduce((s, r) => s + Math.min(100, (r.current / r.goal) * 100), 0) / ringSpecs.length)
      : 0

  const moveRing = ringSpecs.find((r) => r.label === 'Move')
  const trainRing = ringSpecs.find((r) => r.label === 'Train')
  const sleepHours = data?.avgSleepHours

  async function toggleHabit(key: string) {
    await api.habits.log({ habitKey: key, completed: !todayDone.has(key) })
    await reloadHabits()
  }

  if (loading) return <LoadingState />
  if (error || !data) {
    return <div className="px-5 py-8 text-alert text-sm">{error ?? 'Failed to load today'}</div>
  }

  const readinessScore = readiness?.score ?? null
  const readinessLabel =
    readiness?.recommendation === 'train' ? 'Optimal' : readiness?.recommendation === 'moderate' ? 'Moderate' : 'Recover'

  const habitRows = [
    ...HABIT_CATALOG.map((h) => ({
      key: h.key,
      label: h.key === 'stretch' ? 'Mobility & Stretching' : h.key === 'protein' ? 'Daily Vitamins & Creatine' : h.label,
      sub: todayDone.has(h.key) ? 'Completed' : 'Pending',
      icon: h.key === 'walk' ? 'directions_walk' : h.key === 'stretch' ? 'self_improvement' : 'medication',
      done: todayDone.has(h.key)
    })),
    {
      key: '__steps__',
      label: '10,000 Steps Target',
      sub: `${stepsToday.toLocaleString()} / ${STEP_GOAL.toLocaleString()} done`,
      icon: 'directions_walk',
      done: stepsToday >= STEP_GOAL,
      readonly: true
    }
  ].slice(0, 4)

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Today" subtitle="Readiness, rings, and quick actions." />
      </div>
      <div className="flex flex-col w-full px-5 lg:px-8 gap-4 pb-10 max-w-lg mx-auto lg:max-w-none font-body-hud bg-hud-surface min-h-full">
        <MotionPermissionBanner />

        {readinessScore != null ? (
          <div className="flex items-center justify-between p-4 rounded-xl bg-hud-container-lowest border border-hud-outline-variant/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-hud-container-high border border-emerald-100 dark:border-hud-outline-variant flex items-center justify-center text-hud-primary">
                <MaterialIcon name="bolt" className="text-[22px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-hud-on-variant font-semibold tracking-wider uppercase">Readiness score</span>
                <span className="font-display text-lg font-bold text-hud-on">
                  {readinessScore}% <span className="text-hud-primary text-sm font-semibold">· {readinessLabel}</span>
                </span>
              </div>
            </div>
            {readiness?.factors[0] ? (
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-hud-primary/10 text-hud-primary px-3 py-1 rounded-full text-xs font-semibold max-w-[40%]">
                <MaterialIcon name="trending_up" className="text-[14px] shrink-0" />
                <span className="truncate">{readiness.factors[0].label}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <section className="flex flex-col rounded-xl bg-hud-container-lowest border border-hud-outline-variant/60 p-4 shadow-sm gap-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-base font-bold text-hud-on">Daily activity</span>
            <span className="text-xs font-semibold text-hud-primary">{overallPct}% closed</span>
          </div>
          {ringSpecs.length > 0 ? <HudConcentricRings rings={ringSpecs} /> : null}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <StatTile icon="footprint" iconClass="text-amber-500" label="GPS steps" value={stepsToday.toLocaleString()} hint={`${Math.round((stepsToday / STEP_GOAL) * 100)}% of target`} hintPrimary />
            <StatTile
              icon="local_fire_department"
              iconClass="text-hud-primary"
              label="Active calories"
              value={`${Math.round(moveRing?.current ?? data.caloriesToday)} kcal`}
              hint={moveRing ? `Goal: ${Math.round(moveRing.goal)}` : undefined}
            />
            <StatTile
              icon="timer"
              iconClass="text-sky-500"
              label="Workout time"
              value={`${Math.round(trainRing?.current ?? 0)} min`}
              hint={`${data.workoutsThisWeek} this week`}
            />
            <StatTile
              icon="bedtime"
              iconClass="text-indigo-500"
              label="Sleep & rest"
              value={sleepHours != null ? `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m` : '—'}
              hint={sleepHours != null ? 'Avg recent' : undefined}
              hintPrimary={sleepHours != null}
            />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-sm font-bold uppercase text-hud-on">Quick actions</h2>
          <div className="grid grid-cols-3 gap-2">
            <QuickTile to="/workouts" icon="fitness_center" label="Workout" hint="Train tab" primary />
            <QuickTile to="/routes/track" icon="directions_walk" label="Walk / Run" hint="Outdoor GPS" />
            <QuickTile to="/meals" icon="restaurant" label="Log food" hint="Eat tab" />
          </div>
        </section>

        {habits ? (
          <section className="flex flex-col rounded-xl bg-hud-container-lowest border border-hud-outline-variant/60 p-4 shadow-sm gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-sm font-bold text-hud-on uppercase">Daily wins</h2>
                <span className="text-xs">🔥</span>
              </div>
              {maxStreak > 0 ? (
                <span className="text-xs text-hud-primary font-bold tracking-wider">{maxStreak} day streak</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              {habitRows.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  disabled={'readonly' in row && row.readonly}
                  onClick={() => !('readonly' in row && row.readonly) && void toggleHabit(row.key)}
                  className={`habit-item flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors text-left w-full ${
                    row.done
                      ? 'bg-slate-50 dark:bg-hud-container-high border-slate-200/60'
                      : 'bg-hud-container-lowest border-slate-200/60 hover:bg-slate-50 dark:hover:bg-hud-container-high'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                        row.done
                          ? 'bg-hud-primary-container text-hud-on-primary shadow-sm'
                          : 'border border-slate-300 dark:border-hud-outline-variant bg-hud-container-lowest text-transparent'
                      }`}
                    >
                      <MaterialIcon name="check" className="text-[16px] font-bold" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-sm truncate font-medium ${row.done ? 'text-slate-400 line-through' : 'text-hud-on'}`}
                      >
                        {row.label}
                      </span>
                      <span className={`text-[10px] font-semibold ${row.done ? 'text-hud-primary' : 'text-hud-on-variant'}`}>
                        {row.sub}
                      </span>
                    </div>
                  </div>
                  <MaterialIcon
                    name={row.icon}
                    className={`text-[18px] shrink-0 ${row.done ? 'text-hud-primary' : 'text-hud-on-variant'}`}
                  />
                </button>
              ))}
            </div>
            <Link to="/habits" className="text-center text-xs text-hud-primary font-medium hover:underline">
              Open daily wins
            </Link>
          </section>
        ) : null}
      </div>
    </>
  )
}

function StatTile({
  icon,
  iconClass,
  label,
  value,
  hint,
  hintPrimary
}: {
  icon: string
  iconClass: string
  label: string
  value: string
  hint?: string
  hintPrimary?: boolean
}) {
  return (
    <div className="flex flex-col p-3 rounded-lg bg-slate-50/80 dark:bg-hud-container-high/50 border border-slate-200/60 dark:border-hud-outline-variant/40">
      <span className="text-[11px] font-semibold text-slate-500 dark:text-hud-on-variant uppercase flex items-center gap-1.5">
        <MaterialIcon name={icon} className={`text-[15px] ${iconClass}`} />
        {label}
      </span>
      <span className="font-display text-xl font-bold text-hud-on mt-0.5">{value}</span>
      {hint ? (
        <span className={`text-[11px] font-medium mt-0.5 ${hintPrimary ? 'text-hud-primary' : 'text-slate-500 dark:text-hud-on-variant'}`}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}

function QuickTile({
  to,
  icon,
  label,
  hint,
  primary
}: {
  to: string
  icon: string
  label: string
  hint: string
  primary?: boolean
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center text-center p-3 rounded-xl bg-hud-container-lowest border border-hud-outline-variant/60 hover:border-emerald-300 dark:hover:border-hud-primary/40 hover:shadow-md transition-all group shadow-sm"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm mb-2 ${
          primary ? 'bg-hud-primary-container text-hud-on-primary' : 'bg-slate-100 dark:bg-hud-container-high text-slate-700 dark:text-hud-on'
        }`}
      >
        <MaterialIcon name={icon} className="text-[20px]" />
      </div>
      <span className="font-display text-xs font-bold text-hud-on">{label}</span>
      <span className="text-[10px] text-hud-on-variant mt-0.5">{hint}</span>
    </Link>
  )
}
