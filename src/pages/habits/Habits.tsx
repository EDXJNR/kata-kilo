import { useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import LoadingState from '@/components/ui/LoadingState'
import { FieldLabel, PrimaryButton, TextField } from '@/components/ui/FieldInput'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { HABIT_CATALOG } from '@/lib/habit-catalog'
import StepWeekRings from '@/components/activity/StepWeekRings'
import { useAutoSteps } from '@/components/activity/AutoStepTrackerRunner'
import { getStepGoal } from '@/lib/daily-steps'

const HABIT_ICONS: Record<string, string> = {
  walk: 'directions_walk',
  stretch: 'self_improvement',
  protein: 'medication'
}

const HABIT_LABELS: Record<string, string> = {
  walk: 'Outdoor walk',
  stretch: 'Mobility & stretching',
  protein: 'Protein & fuel target'
}

function TargetsRing({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const r = 40
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)
  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle className="text-hud-container-high" cx="50" cy="50" fill="none" r={r} stroke="currentColor" strokeWidth="8" />
        <circle
          className="text-hud-primary transition-all duration-500"
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg font-bold text-hud-on leading-none">
          {done}/{total}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-hud-on-variant font-semibold">Today</span>
      </div>
    </div>
  )
}

export default function HabitsPage() {
  const { data, loading, error, reload } = useAsyncData(() => api.habits.get())
  const { stepsToday } = useAutoSteps()
  const [saving, setSaving] = useState<string | null>(null)
  const [targetsOpen, setTargetsOpen] = useState(false)
  const [targets, setTargets] = useState<{ walk_min: string; stretch_min: string; protein_g: string } | null>(null)

  const stepGoal = getStepGoal()
  const stepsHit = stepsToday >= stepGoal

  const todayDone = useMemo(
    () => new Set((data?.today ?? []).filter((l) => l.completed).map((l) => l.habit_key)),
    [data?.today]
  )

  const maxStreak = useMemo(() => {
    if (!data?.streaks) return 0
    return Math.max(0, ...Object.values(data.streaks))
  }, [data?.streaks])

  const doneCount = todayDone.size + (stepsHit ? 1 : 0)
  const totalCount = HABIT_CATALOG.length + 1

  if (loading) return <LoadingState />

  const t = targets ?? {
    walk_min: String(data?.targets.walk_min ?? 20),
    stretch_min: String(data?.targets.stretch_min ?? 5),
    protein_g: String(data?.targets.protein_g ?? 120)
  }

  async function toggle(habitKey: string) {
    setSaving(habitKey)
    try {
      await api.habits.log({ habitKey, completed: !todayDone.has(habitKey) })
      await reload()
    } finally {
      setSaving(null)
    }
  }

  async function saveTargets() {
    setSaving('targets')
    try {
      await api.habits.updateTargets({
        walk_min: Number(t.walk_min) || 20,
        stretch_min: Number(t.stretch_min) || 5,
        protein_g: Number(t.protein_g) || 120
      })
      await reload()
      setTargets(null)
      setTargetsOpen(false)
    } finally {
      setSaving(null)
    }
  }

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Daily wins" subtitle="Small actions that stack — walk, stretch, fuel, and steps." />
      </div>
      <div className="flex flex-col w-full px-5 lg:px-8 pb-10 gap-4 max-w-lg mx-auto lg:max-w-3xl font-body-hud bg-hud-surface min-h-full mt-2 lg:mt-0">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <section className="bg-hud-container-lowest rounded-xl shadow-sm p-4 border border-hud-outline-variant/30 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-hud-primary" />
              <span className="text-[10px] text-hud-on-variant uppercase tracking-wider font-semibold">Consistency</span>
            </div>
            <p className="font-display text-xl font-bold text-hud-on">
              {doneCount === totalCount ? 'All targets hit' : `${totalCount - doneCount} left today`}
            </p>
            {maxStreak > 0 ? (
              <div className="flex items-center gap-1.5 mt-1 text-hud-primary">
                <MaterialIcon name="local_fire_department" className="text-[18px]" filled />
                <span className="text-sm font-display font-bold">{maxStreak} day streak</span>
              </div>
            ) : (
              <p className="text-sm text-hud-on-variant mt-1">Check off habits to build streaks</p>
            )}
          </div>
          <TargetsRing done={doneCount} total={totalCount} />
        </section>

        <section className="bg-hud-container-lowest rounded-xl shadow-sm p-4 border border-hud-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-hud-on-variant uppercase tracking-wider font-semibold">Today&apos;s targets</span>
            <span className="text-xs font-display font-bold text-hud-primary">
              {Math.round((doneCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {HABIT_CATALOG.map((h) => {
              const done = todayDone.has(h.key)
              const streak = data?.streaks[h.key] ?? 0
              const target =
                h.key === 'walk'
                  ? `${data?.targets.walk_min ?? 20} min`
                  : h.key === 'stretch'
                    ? `${data?.targets.stretch_min ?? 5} min`
                    : `${data?.targets.protein_g ?? 120} g`
              return (
                <button
                  key={h.key}
                  type="button"
                  disabled={saving === h.key}
                  onClick={() => void toggle(h.key)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left w-full ${
                    done
                      ? 'bg-hud-container-low border-hud-primary/30'
                      : 'bg-hud-container-lowest border-hud-outline-variant/50 hover:bg-hud-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        done ? 'bg-hud-primary text-white shadow-sm' : 'border border-hud-outline-variant bg-hud-container-low'
                      }`}
                    >
                      {done ? (
                        <MaterialIcon name="check" className="text-[18px] font-bold" />
                      ) : (
                        <MaterialIcon name={HABIT_ICONS[h.key] ?? 'star'} className="text-[18px] text-hud-on-variant" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className={`text-sm font-semibold block truncate ${done ? 'text-hud-on-variant line-through' : 'text-hud-on'}`}>
                        {HABIT_LABELS[h.key] ?? h.label}
                      </span>
                      <span className={`text-[10px] font-medium ${done ? 'text-hud-primary' : 'text-hud-on-variant'}`}>
                        {done ? 'Completed' : `Target · ${target}`}
                        {streak > 0 ? ` · ${streak}d streak` : ''}
                      </span>
                    </div>
                  </div>
                  <MaterialIcon
                    name={HABIT_ICONS[h.key] ?? 'chevron_right'}
                    className={`text-[20px] shrink-0 ${done ? 'text-hud-primary' : 'text-hud-on-variant'}`}
                  />
                </button>
              )
            })}

            <div
              className={`flex items-center justify-between p-3 rounded-lg border ${
                stepsHit
                  ? 'bg-hud-container-low border-hud-primary/30'
                  : 'bg-hud-container-lowest border-hud-outline-variant/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    stepsHit ? 'bg-hud-primary text-white' : 'border border-hud-outline-variant bg-hud-container-low'
                  }`}
                >
                  {stepsHit ? (
                    <MaterialIcon name="check" className="text-[18px]" />
                  ) : (
                    <MaterialIcon name="directions_walk" className="text-[18px] text-hud-on-variant" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className={`text-sm font-semibold block ${stepsHit ? 'text-hud-on-variant line-through' : 'text-hud-on'}`}>
                    {stepGoal.toLocaleString()} steps
                  </span>
                  <span className={`text-[10px] font-medium ${stepsHit ? 'text-hud-primary' : 'text-hud-on-variant'}`}>
                    {stepsHit ? 'Completed' : `${stepsToday.toLocaleString()} / ${stepGoal.toLocaleString()} · auto-tracked`}
                  </span>
                </div>
              </div>
              <MaterialIcon name="ssid_chart" className={`text-[20px] shrink-0 ${stepsHit ? 'text-hud-primary' : 'text-hud-on-variant'}`} />
            </div>
          </div>
        </section>

        <section className="bg-hud-container-lowest rounded-xl shadow-sm p-4 border border-hud-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Weekly move</span>
              <p className="text-sm font-semibold text-hud-on">Step rings</p>
            </div>
            <span className="text-xs font-display text-hud-on-variant">{stepsToday.toLocaleString()} today</span>
          </div>
          <StepWeekRings stepsToday={stepsToday} />
        </section>

        <section className="bg-hud-container-lowest rounded-xl shadow-sm border border-hud-outline-variant/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setTargetsOpen((o) => !o)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-hud-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <MaterialIcon name="tune" className="text-[20px] text-hud-on-variant" />
              <div>
                <span className="font-display text-sm font-semibold text-hud-on block">Your targets</span>
                <span className="text-xs text-hud-on-variant">Walk, stretch &amp; protein goals</span>
              </div>
            </div>
            <MaterialIcon name={targetsOpen ? 'expand_less' : 'expand_more'} className="text-hud-on-variant" />
          </button>
          {targetsOpen ? (
            <div className="px-4 pb-4 border-t border-hud-outline-variant/40 pt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <FieldLabel>Walk (min)</FieldLabel>
                  <TextField
                    value={t.walk_min}
                    onChange={(e) => setTargets({ ...t, walk_min: e.target.value })}
                    type="number"
                    className="bg-hud-container-low border-hud-outline-variant"
                  />
                </div>
                <div>
                  <FieldLabel>Stretch (min)</FieldLabel>
                  <TextField
                    value={t.stretch_min}
                    onChange={(e) => setTargets({ ...t, stretch_min: e.target.value })}
                    type="number"
                    className="bg-hud-container-low border-hud-outline-variant"
                  />
                </div>
                <div>
                  <FieldLabel>Protein (g)</FieldLabel>
                  <TextField
                    value={t.protein_g}
                    onChange={(e) => setTargets({ ...t, protein_g: e.target.value })}
                    type="number"
                    className="bg-hud-container-low border-hud-outline-variant"
                  />
                </div>
              </div>
              <PrimaryButton loading={saving === 'targets'} onClick={() => void saveTargets()}>
                Save targets
              </PrimaryButton>
            </div>
          ) : null}
        </section>
      </div>
    </>
  )
}
