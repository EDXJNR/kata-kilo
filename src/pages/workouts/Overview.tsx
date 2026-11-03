import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import LoadingState from '@/components/ui/LoadingState'
import { getExercise } from '@/data/exercises'
import { getNoEquipmentPlans } from '@/data/workout-plans'
import { useWorkoutSession } from '@/context/WorkoutSessionContext'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { planExercises, resolvePlan } from '@/lib/plan-utils'
import { useSavedPlans } from '@/hooks/useSavedPlans'
import { todayWeekdayIndex } from '@/lib/week-utils'

export default function WorkoutOverview() {
  const { loading, error } = useAsyncData(() => api.workouts.list())
  const { data: weekly } = useAsyncData(() => api.workouts.getWeekly().then((r) => r.plan))
  const { session, preparePlan, beginWorkout, workoutTimer } = useWorkoutSession()
  const { plans: savedPlans } = useSavedPlans()
  const [pickedId, setPickedId] = useState<string | null>(session?.planId ?? null)

  const todayIdx = todayWeekdayIndex()
  const todayPlan = weekly?.days.find((d) => d.weekday === todayIdx)
  const pickedPlan = pickedId ? resolvePlan(pickedId, savedPlans) : null
  const heroPlan = pickedPlan ?? (todayPlan?.planId ? resolvePlan(todayPlan.planId, savedPlans) : null)
  const heroName = heroPlan?.name ?? todayPlan?.workoutName ?? 'Upper Body Strength'
  const previewExercises = heroPlan ? planExercises(heroPlan).slice(0, 4) : []

  const libraryPlans = useMemo(() => {
    const builtins = getNoEquipmentPlans().slice(0, 3)
    if (savedPlans.length >= 3) return savedPlans.slice(0, 3)
    return [...savedPlans, ...builtins].slice(0, 3)
  }, [savedPlans])

  const workoutDays = weekly?.days.filter((d) => !d.isRest && d.planId).length ?? 6
  const completedBeforeToday =
    weekly?.days.filter((d) => d.weekday < todayIdx && !d.isRest).length ?? 0

  useEffect(() => {
    if (todayPlan?.planId && !pickedId && !session?.planId) {
      setPickedId(todayPlan.planId)
      preparePlan(todayPlan.planId)
    }
  }, [todayPlan?.planId, pickedId, session?.planId, preparePlan])

  if (loading) return <LoadingState />

  function selectPlan(id: string) {
    setPickedId(id)
    preparePlan(id)
  }

  function exerciseLabel(id: string) {
    return getExercise(id)?.name ?? id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Train" subtitle="This week’s plan, today’s session, and your library." />
      </div>
      <div className="flex flex-col w-full px-5 lg:px-8 gap-4 pb-28 max-w-lg mx-auto lg:max-w-none font-body-hud bg-hud-surface select-none">
        {error ? <div className="text-alert text-sm">{error}</div> : null}

        <div className="flex items-baseline justify-between pt-0.5">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-hud-on-variant uppercase tracking-widest block font-semibold">
              This week
            </span>
            <span className="font-display text-lg text-hud-on tracking-tight font-bold">Hypertrophy block</span>
          </div>
          <span className="text-xs text-hud-primary font-bold bg-emerald-50 dark:bg-hud-primary/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-hud-primary/30">
            Day {Math.min(completedBeforeToday + 1, workoutDays)} of {workoutDays}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 w-full bg-hud-container-lowest p-2 rounded-xl border border-hud-outline-variant/60 shadow-sm">
          {weekly?.days.map((day) => {
            const isToday = day.weekday === todayIdx
            const done = day.weekday < todayIdx && !day.isRest
            return (
              <button
                key={day.weekday}
                type="button"
                onClick={() => day.planId && selectPlan(day.planId)}
                className={`flex flex-col items-center py-2 rounded-lg transition-transform active:scale-95 ${
                  isToday
                    ? 'bg-hud-primary-container text-hud-on-primary shadow-sm ring-2 ring-emerald-600 ring-offset-1 dark:ring-offset-hud-surface'
                    : day.isRest
                      ? 'bg-hud-container-lowest border border-dashed border-slate-200 opacity-60'
                      : 'bg-slate-50 dark:bg-hud-container-high border border-slate-100 dark:border-hud-outline-variant/40'
                }`}
              >
                <span className={`text-[11px] font-semibold uppercase ${isToday ? 'text-emerald-100 font-bold' : 'text-slate-400'}`}>
                  {day.label.slice(0, 1)}
                </span>
                {day.isRest ? (
                  <span className="text-[10px] text-slate-400 mt-1 font-semibold">REST</span>
                ) : done ? (
                  <MaterialIcon name="check_circle" className="text-emerald-600 text-[16px] mt-1" filled />
                ) : isToday ? (
                  <MaterialIcon name="fitness_center" className="text-white text-[16px] mt-1" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5" />
                )}
              </button>
            )
          }) ?? null}
        </div>

        <article className="relative w-full rounded-2xl bg-hud-container-lowest border border-hud-outline-variant/60 shadow-sm p-4 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-hud-primary/10 text-emerald-800 dark:text-hud-primary text-[11px] tracking-wider uppercase font-bold">
              Today&apos;s workout
            </span>
            {heroPlan && 'durationMin' in heroPlan ? (
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <MaterialIcon name="schedule" className="text-[15px] text-hud-primary" />
                {heroPlan.durationMin} min
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl text-hud-on tracking-tight font-bold">{heroName}</h2>
            <p className="text-[13px] text-hud-on-variant">
              {previewExercises.length} exercises · {previewExercises.slice(0, 2).map((e) => exerciseLabel(e.exerciseId)).join(', ')}
            </p>
          </div>
          {previewExercises.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Key exercises</span>
              <div className="flex flex-wrap gap-1.5">
                {previewExercises.map((ex) => (
                  <span
                    key={ex.exerciseId}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-hud-container-high border border-slate-200/70 dark:border-hud-outline-variant/40 text-xs text-slate-700 dark:text-hud-on font-medium"
                  >
                    {exerciseLabel(ex.exerciseId)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {session?.live ? (
            <Link
              to="/workouts/train"
              className="w-full py-3.5 mt-2 bg-hud-primary-container hover:bg-emerald-700 text-hud-on-primary rounded-xl font-display text-base flex items-center justify-center gap-2 shadow-sm font-bold"
            >
              Continue — {workoutTimer.label}
              <MaterialIcon name="play_arrow" className="text-[20px]" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => beginWorkout()}
              disabled={!session || todayPlan?.isRest}
              className="w-full py-3.5 mt-2 bg-hud-primary-container hover:bg-emerald-700 text-hud-on-primary rounded-xl font-display text-base flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all font-bold disabled:opacity-40"
            >
              Start workout
              <MaterialIcon name="play_arrow" className="text-[20px]" />
            </button>
          )}
        </article>

        <div className="flex items-center justify-between pt-1">
          <h3 className="font-display text-base text-hud-on font-bold">Workout library</h3>
          <Link to="/workouts/library" className="text-xs text-hud-primary font-semibold hover:underline">
            View all
          </Link>
        </div>

        <div className="flex flex-col gap-2.5 pb-6">
          {libraryPlans.map((p) => (
            <div
              key={p.id}
              className="w-full bg-hud-container-lowest border border-hud-outline-variant/60 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-[15px] text-hud-on truncate font-bold">{p.name}</h4>
                {'tagline' in p && p.tagline ? (
                  <p className="text-xs text-hud-on-variant truncate mt-0.5">{String(p.tagline)}</p>
                ) : null}
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  {'durationMin' in p ? (
                    <>
                      <span className="flex items-center gap-0.5">
                        <MaterialIcon name="schedule" className="text-[13px] text-slate-400" />
                        {p.durationMin}m
                      </span>
                      <span>•</span>
                    </>
                  ) : null}
                  <span>{planExercises(p).length} exercises</span>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Start ${p.name}`}
                onClick={() => {
                  selectPlan(p.id)
                  beginWorkout()
                }}
                className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-hud-primary/10 text-hud-primary border border-emerald-200 dark:border-hud-primary/30 flex items-center justify-center hover:bg-hud-primary-container hover:text-hud-on-primary transition-all shrink-0"
              >
                <MaterialIcon name="play_arrow" className="text-[18px]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
