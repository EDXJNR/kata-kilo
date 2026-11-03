import { useCallback, useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import Panel from '@/components/ui/Panel'
import Modal from '@/components/ui/Modal'
import LoadingState from '@/components/ui/LoadingState'
import NotificationSettings from '@/components/NotificationSettings'
import { PrimaryButton } from '@/components/ui/FieldInput'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useSavedPlans } from '@/hooks/useSavedPlans'
import { api } from '@/lib/api'
import { WORKOUT_PLANS } from '@/data/workout-plans'
import { EXERCISES } from '@/data/exercises'
import { resolvePlan, planExercises } from '@/lib/plan-utils'
import {
  addMonths,
  addWeeks,
  currentMonthKey,
  emptyWeekDays,
  formatMonthLabel,
  formatWeekRange,
  mondayOfWeek,
  todayWeekdayIndex,
  weekStartsInMonth
} from '@/lib/week-utils'
import { buildAutoWeekDays } from '@/lib/auto-week'
import PlannerReminderBanner from '@/components/PlannerReminderBanner'
import type { WeeklyPlanDay } from '@/types/field-log'
import { ApiError } from '@/types/field-log'

const WORKOUT_TYPES = ['Upper Body', 'Lower Body', 'Full Body', 'Cardio', 'HIIT', 'Strength', 'Core', 'Recovery']
const INTENSITIES = ['Light', 'Moderate', 'Hard', 'Max']

function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

const emptyDraft = (defaultTime = '08:00'): Partial<WeeklyPlanDay> => ({
  isRest: false,
  workoutName: '',
  workoutType: '',
  durationMin: 45,
  intensity: 'Moderate',
  planId: null,
  exercises: null,
  reminderTime: defaultTime
})

function buildDayFromDraft(
  day: WeeklyPlanDay,
  draft: Partial<WeeklyPlanDay>,
  defaultReminderTime: string
): WeeklyPlanDay {
  if (draft.isRest) {
    return {
      ...day,
      isRest: true,
      workoutName: null,
      workoutType: null,
      durationMin: null,
      intensity: null,
      planId: null,
      exercises: null,
      reminderTime: null
    }
  }
  return {
    ...day,
    isRest: false,
    workoutName: draft.workoutName?.trim() || null,
    workoutType: draft.workoutType?.trim() || null,
    durationMin: draft.durationMin != null ? Number(draft.durationMin) : null,
    intensity: draft.intensity || null,
    planId: draft.planId || null,
    exercises: draft.exercises ?? null,
    reminderTime: draft.reminderTime?.trim() || defaultReminderTime
  }
}

export default function WorkoutPlanner() {
  const [weekStart, setWeekStart] = useState(() => mondayOfWeek())
  const [days, setDays] = useState<WeeklyPlanDay[]>(emptyWeekDays)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editDay, setEditDay] = useState<WeeklyPlanDay | null>(null)
  const [draft, setDraft] = useState(emptyDraft())
  const [applying, setApplying] = useState(false)
  const [view, setView] = useState<'week' | 'month'>('week')
  const [monthKey, setMonthKey] = useState(() => currentMonthKey())

  const { data, loading, error } = useAsyncData(
    () => api.workouts.getWeekly(weekStart).then((r) => r.plan),
    [weekStart]
  )
  const { data: profile, reload: reloadProfile } = useAsyncData(() => api.profile.get(), [])
  const { plans: savedPlans } = useSavedPlans()
  const { data: checkins } = useAsyncData(() => api.planner.checkins(weekStart), [weekStart])

  const defaultReminderTime = profile?.reminder_preferences?.time ?? '08:00'
  const checkedWeekdays = new Set((checkins?.checkins ?? []).map((c) => c.weekday))

  useEffect(() => {
    if (data?.days?.length) {
      setDays(data.days)
    } else if (!loading) {
      setDays(emptyWeekDays())
    }
  }, [data, loading])

  const todayIdx = todayWeekdayIndex()
  const showReminderBanner =
    !profile?.reminder_preferences?.enabled ||
    (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted')

  const openEdit = (day: WeeklyPlanDay) => {
    setSaveError(null)
    setEditDay(day)
    setDraft({
      isRest: day.isRest,
      workoutName: day.workoutName ?? '',
      workoutType: day.workoutType ?? '',
      durationMin: day.durationMin ?? 45,
      intensity: day.intensity ?? 'Moderate',
      planId: day.planId,
      exercises: day.exercises,
      reminderTime: day.reminderTime ?? defaultReminderTime
    })
  }

  const applyPlan = (planId: string) => {
    const plan = resolvePlan(planId, savedPlans)
    if (!plan) return
    setDraft((d) => ({
      ...d,
      isRest: false,
      workoutName: plan.name,
      workoutType: plan.category,
      durationMin: plan.durationMin,
      intensity: 'Moderate',
      planId: plan.id,
      exercises: planExercises(plan),
      reminderTime: d.reminderTime ?? defaultReminderTime
    }))
  }

  const savePlan = useCallback(
    async (updatedDays: WeeklyPlanDay[]) => {
      setSaving(true)
      setSaved(false)
      setSaveError(null)
      const previous = days
      setDays(updatedDays)
      try {
        const savedPlan = await api.workouts.saveWeekly({ weekStart, days: updatedDays })
        setDays(savedPlan.days)
        setSaved(true)
        window.setTimeout(() => setSaved(false), 2000)
        return true
      } catch (err) {
        setDays(previous)
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error && err.message
              ? err.message
              : 'Could not save plan'
        setSaveError(message)
        return false
      } finally {
        setSaving(false)
      }
    },
    [weekStart, days]
  )

  const saveDay = async () => {
    if (!editDay) return
    if (!draft.isRest && !draft.workoutName?.trim() && !draft.planId) {
      setSaveError('Add a workout name or choose a plan from the list.')
      return
    }
    setApplying(true)
    setSaveError(null)
    const updated = days.map((d) =>
      d.weekday === editDay.weekday ? buildDayFromDraft(d, draft, defaultReminderTime) : d
    )
    const ok = await savePlan(updated)
    setApplying(false)
    if (ok) setEditDay(null)
  }

  const copyWeekToRestOfMonth = async () => {
    setApplying(true)
    setSaveError(null)
    try {
      const template = days
      const weeks = weekStartsInMonth(monthKey).filter((ws) => ws !== weekStart)
      for (const ws of weeks) {
        await api.workouts.saveWeekly({ weekStart: ws, days: template })
      }
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not copy month')
    } finally {
      setApplying(false)
    }
  }

  const autoFillWeek = async () => {
    setApplying(true)
    try {
      const hints = await api.automation.suggestions()
      const next = buildAutoWeekDays({
        trainingDays: hints.plannerHint.trainingDays,
        preferredDurationMin: hints.plannerHint.preferredDurationMin,
        savedPlans,
        defaultReminderTime
      })
      await savePlan(next)
    } finally {
      setApplying(false)
    }
  }

  const clearDay = async (day: WeeklyPlanDay) => {
    const updated = days.map((d) =>
      d.weekday === day.weekday
        ? {
            ...d,
            isRest: false,
            workoutName: null,
            workoutType: null,
            durationMin: null,
            intensity: null,
            planId: null,
            exercises: null,
            reminderTime: null
          }
        : d
    )
    await savePlan(updated)
  }

  if (loading && !data) return <LoadingState />

  return (
    <>
      <PageHeader
        title="Training planner"
        subtitle="Plan by week or copy a week across the whole month."
        action={
          <div className="flex flex-wrap gap-2">
            {saved ? <span className="text-primary text-sm self-center">Saved ✓</span> : null}
            <button
              type="button"
              disabled={applying || saving}
              onClick={() => void autoFillWeek()}
              className="min-h-[44px] px-3 rounded-lg border border-line text-fog text-sm hover:text-bone shadow-md shadow-black/15"
            >
              Auto-fill week
            </button>
            <PrimaryButton disabled={saving} onClick={() => void savePlan(days)}>
              {saving ? 'Saving…' : 'Save week'}
            </PrimaryButton>
          </div>
        }
      />
      <PageShell>
        {error || saveError ? (
          <div className="rounded-lg border border-alert/40 bg-alert/10 px-4 py-3 text-sm text-alert">
            {saveError ?? error}
            {saveError?.includes('weekly_plans') || saveError?.includes('relation') ? (
              <p className="text-xs mt-1 opacity-90">Run migration 0005_weekly_buddy.sql in Supabase, then redeploy the worker.</p>
            ) : null}
          </div>
        ) : null}

        <PlannerReminderBanner />

        {showReminderBanner && profile ? (
          <NotificationSettings
            variant="banner"
            prefs={profile.reminder_preferences ?? { enabled: false, time: '08:00' }}
            onSave={async (prefs) => {
              await api.reminders.update(prefs)
              reloadProfile()
            }}
          />
        ) : null}

        <div className="flex rounded-xl border border-line p-1 gap-1 w-fit shadow-md shadow-black/15">
          <button
            type="button"
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[40px] ${
              view === 'week' ? 'bg-primary text-basalt' : 'text-fog hover:text-bone'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[40px] ${
              view === 'month' ? 'bg-primary text-basalt' : 'text-fog hover:text-bone'
            }`}
          >
            Month
          </button>
        </div>

        {view === 'month' ? (
          <Panel title={formatMonthLabel(monthKey)} variant="raised">
            <div className="flex items-center justify-between gap-3 mb-4">
              <button
                type="button"
                onClick={() => setMonthKey((m) => addMonths(m, -1))}
                className="min-h-[44px] px-3 rounded-lg border border-line text-fog"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setMonthKey((m) => addMonths(m, 1))}
                className="min-h-[44px] px-3 rounded-lg border border-line text-fog"
              >
                →
              </button>
            </div>
            <p className="text-fog text-sm mb-4">
              Edit one week below, save it, then copy that pattern to every week in {formatMonthLabel(monthKey)}.
            </p>
            <button
              type="button"
              disabled={applying || saving}
              onClick={() => void copyWeekToRestOfMonth()}
              className="w-full min-h-[48px] rounded-xl bg-primary/90 text-basalt font-semibold shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              Copy this week to rest of month
            </button>
            <ul className="mt-4 space-y-2">
              {weekStartsInMonth(monthKey).map((ws) => (
                <li key={ws}>
                  <button
                    type="button"
                    onClick={() => {
                      setWeekStart(ws)
                      setView('week')
                    }}
                    className={`w-full text-left rounded-xl border px-4 py-3 min-h-[48px] shadow-md shadow-black/10 ${
                      ws === weekStart ? 'border-primary bg-primary/10' : 'border-line hover:border-primary/30'
                    }`}
                  >
                    <span className="text-bone text-sm font-medium">{formatWeekRange(ws)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setWeekStart((w) => addWeeks(w, -1))}
            className="min-h-[44px] px-3 rounded-lg border border-line text-fog hover:text-bone shadow-md shadow-black/15"
          >
            ← Prev
          </button>
          <p className="text-bone font-display font-semibold">{formatWeekRange(weekStart)}</p>
          <button
            type="button"
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            className="min-h-[44px] px-3 rounded-lg border border-line text-fog hover:text-bone shadow-md shadow-black/15"
          >
            Next →
          </button>
        </div>

        {view === 'week' ? (
        <>
        <Panel variant="quiet" title="Your week">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {days.map((day) => {
              const isToday = day.weekday === todayIdx && weekStart === mondayOfWeek()
              const hasPlan = Boolean(day.workoutName) || day.isRest
              return (
                <button
                  key={day.weekday}
                  type="button"
                  onClick={() => openEdit(day)}
                  className={`rounded-xl border p-4 text-left transition-colors min-h-[100px] touch-manipulation ${
                    day.isRest
                      ? 'border-line/80 bg-basalt2/40'
                      : day.workoutName
                        ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                        : 'border-dashed border-line hover:border-primary/40 hover:bg-basalt2/60'
                  } ${isToday ? 'ring-1 ring-primary/50' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-fog">{day.label}</span>
                    <div className="flex items-center gap-2">
                      {checkedWeekdays.has(day.weekday) ? (
                        <span className="text-[10px] text-emerald-400 font-medium">Checked in ✓</span>
                      ) : null}
                      {isToday ? <span className="text-[10px] text-primary font-medium">Today</span> : null}
                    </div>
                  </div>
                  {day.isRest ? (
                    <p className="text-sm text-fog">Rest day</p>
                  ) : day.workoutName ? (
                    <>
                      <p className="text-bone font-display font-semibold text-sm">{day.workoutName}</p>
                      <p className="text-fog text-xs mt-1">
                        {[day.workoutType, day.durationMin ? `${day.durationMin} min` : null, day.intensity]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {day.reminderTime ? (
                        <p className="text-primary/80 text-[10px] mt-1.5 flex items-center gap-1">
                          <span aria-hidden>🔔</span>
                          Reminder {formatTimeLabel(day.reminderTime)}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-fog text-sm">No plan — tap to add</p>
                  )}
                  {hasPlan ? <span className="text-[10px] text-primary mt-2 inline-block">Edit</span> : null}
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel variant="raised" title="Quick overview">
          <ul className="space-y-2 text-sm">
            {days.map((day) => (
              <li key={day.weekday} className="flex justify-between gap-2 border-b border-line/40 pb-2 last:border-0">
                <span className="text-fog w-24 shrink-0">{day.label.slice(0, 3)}</span>
                <span className={`text-right ${day.isRest ? 'text-fog' : day.workoutName ? 'text-bone' : 'text-fog/60'}`}>
                  {day.isRest
                    ? 'Rest'
                    : day.workoutName
                      ? `${day.workoutName}${day.reminderTime ? ` · ${formatTimeLabel(day.reminderTime)}` : ''}`
                      : '—'}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        </>
        ) : null}
      </PageShell>

      <Modal open={editDay != null} onClose={() => setEditDay(null)} title={editDay ? `Plan ${editDay.label}` : ''} wide>
        {editDay ? (
          <div className="space-y-4">
            {saveError ? (
              <div className="rounded-lg border border-alert/40 bg-alert/10 px-3 py-2 text-sm text-alert">{saveError}</div>
            ) : null}

            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(draft.isRest)}
                onChange={(e) => setDraft((d) => ({ ...d, isRest: e.target.checked }))}
                className="rounded border-line"
              />
              <span className="text-sm text-bone">Rest day</span>
            </label>

            {!draft.isRest ? (
              <>
                <div>
                  <label className="text-xs text-fog block mb-1">From saved or built-in plan</label>
                  <select
                    value={draft.planId ?? ''}
                    onChange={(e) => {
                      if (e.target.value) applyPlan(e.target.value)
                      else setDraft((d) => ({ ...d, planId: null }))
                    }}
                    className="w-full rounded-lg border border-line bg-basalt px-3 py-2 text-sm text-bone min-h-[44px]"
                  >
                    <option value="">Choose a plan…</option>
                    {savedPlans.length > 0 ? (
                      <optgroup label="My plans">
                        {savedPlans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.durationMin} min)
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    <optgroup label="Built-in plans">
                      {WORKOUT_PLANS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.durationMin} min)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-fog block mb-1">Workout name</label>
                  <input
                    value={draft.workoutName ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, workoutName: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-basalt px-3 py-2 text-sm text-bone min-h-[44px]"
                    placeholder="Upper Body"
                  />
                </div>
                <div>
                  <label className="text-xs text-fog block mb-1">Type</label>
                  <select
                    value={draft.workoutType ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, workoutType: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-basalt px-3 py-2 text-sm text-bone min-h-[44px]"
                  >
                    <option value="">Select type</option>
                    {WORKOUT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-fog block mb-1">Duration (min)</label>
                    <input
                      type="number"
                      min={5}
                      value={draft.durationMin ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, durationMin: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-line bg-basalt px-3 py-2 text-sm text-bone min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-fog block mb-1">Intensity</label>
                    <select
                      value={draft.intensity ?? 'Moderate'}
                      onChange={(e) => setDraft((d) => ({ ...d, intensity: e.target.value }))}
                      className="w-full rounded-lg border border-line bg-basalt px-3 py-2 text-sm text-bone min-h-[44px]"
                    >
                      {INTENSITIES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-fog block mb-1">Reminder time for this day</label>
                  <input
                    type="time"
                    value={draft.reminderTime ?? defaultReminderTime}
                    onChange={(e) => setDraft((d) => ({ ...d, reminderTime: e.target.value }))}
                    className="w-full max-w-[200px] rounded-lg border border-line bg-basalt px-3 py-2.5 text-sm text-bone min-h-[44px]"
                  />
                </div>
                {draft.exercises && Array.isArray(draft.exercises) && draft.exercises.length > 0 ? (
                  <div className="rounded-lg border border-line/60 p-3">
                    <p className="text-xs text-fog mb-2">{draft.exercises.length} exercises</p>
                    <ul className="text-xs text-bone space-y-1 max-h-32 overflow-y-auto">
                      {(draft.exercises as { exerciseId: string; sets: number; reps: string }[]).map((ex, i) => {
                        const name = EXERCISES.find((e) => e.id === ex.exerciseId)?.name ?? ex.exerciseId
                        return (
                          <li key={i}>
                            {name} — {ex.sets}×{ex.reps}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <PrimaryButton disabled={applying || saving} loading={applying} onClick={() => void saveDay()}>
                Apply
              </PrimaryButton>
              <button
                type="button"
                disabled={applying || saving}
                onClick={() => {
                  void clearDay(editDay).then(() => setEditDay(null))
                }}
                className="min-h-[44px] px-4 rounded-lg border border-line text-fog hover:text-alert text-sm"
              >
                Clear day
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
