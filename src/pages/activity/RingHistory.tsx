import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import ActivityRings from '@/components/ui/ActivityRings'
import LoadingState from '@/components/ui/LoadingState'
import Panel from '@/components/ui/Panel'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { getStepGoal } from '@/lib/daily-steps'
import {
  applyRingGoals,
  loadRingGoalsLocal,
  parseRingGoalsFromProfile
} from '@/lib/ring-goals'
import {
  addMonths,
  currentMonthKey,
  dateForWeekday,
  formatMonthLabel,
  parseMonthKey,
  weekStartsInMonth
} from '@/lib/week-utils'

function monthBounds(monthKey: string) {
  const { year, month } = parseMonthKey(monthKey)
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

function buildRingsForDay(
  day: { steps: number; distanceKm: number; trainMin: number },
  goals: ReturnType<typeof loadRingGoalsLocal>
) {
  const moveCal = Math.round(day.steps * 0.04 + day.trainMin * 5 + day.distanceKm * 60)
  return applyRingGoals(
    [
      { label: 'Move', current: moveCal, goal: goals.move, color: '#ff6b6b', unit: 'kcal' },
      { label: 'Train', current: day.trainMin, goal: goals.train, color: '#7c5cff', unit: 'min' },
      { label: 'Distance', current: day.distanceKm, goal: goals.distance, color: '#22d3ee', unit: 'km' }
    ],
    goals
  )
}

export default function RingHistoryPage() {
  const [monthKey, setMonthKey] = useState(() => currentMonthKey())
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  const { start, end } = monthBounds(monthKey)
  const { data: profile } = useAsyncData(() => api.profile.get())
  const { data, loading } = useAsyncData(() => api.activity.history(start, end), [start, end])

  const goals = useMemo(() => {
    const fromProfile = parseRingGoalsFromProfile(profile?.ring_goals)
    return fromProfile ?? loadRingGoalsLocal()
  }, [profile?.ring_goals])

  const stepGoal = getStepGoal()
  const byDate = useMemo(() => {
    const map = new Map<string, { steps: number; distanceKm: number; trainMin: number }>()
    for (const row of data?.days ?? []) {
      map.set(row.date, row)
    }
    return map
  }, [data])

  const calendarDays = useMemo(() => {
    const { year, month } = parseMonthKey(monthKey)
    const first = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0).getDate()
    const pad = (first.getDay() + 6) % 7
    const cells: ({ date: string; inMonth: boolean } | null)[] = []
    for (let i = 0; i < pad; i++) cells.push(null)
    for (let d = 1; d <= lastDay; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({ date, inMonth: true })
    }
    return cells
  }, [monthKey])

  const selected = selectedDate ? byDate.get(selectedDate) : undefined

  if (loading && !data) return <LoadingState />

  return (
    <>
      <PageHeader
        title="Activity history"
        subtitle="Tap a day to see your rings. Data comes from walks, workouts, and synced steps."
        action={
          <Link to="/" className="text-primary text-sm font-medium hover:underline min-h-[44px] inline-flex items-center">
            Back to today
          </Link>
        }
      />
      <PageShell>
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={() => setMonthKey((m) => addMonths(m, -1))}
            className="min-h-[44px] px-3 rounded-xl border border-line text-fog hover:text-bone shadow-md shadow-black/20"
          >
            ←
          </button>
          <p className="text-bone font-display font-semibold">{formatMonthLabel(monthKey)}</p>
          <button
            type="button"
            onClick={() => setMonthKey((m) => addMonths(m, 1))}
            className="min-h-[44px] px-3 rounded-xl border border-line text-fog hover:text-bone shadow-md shadow-black/20"
          >
            →
          </button>
        </div>

        <Panel title="Calendar" variant="raised">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-fog mb-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, i) => {
              if (!cell) return <div key={`pad-${i}`} />
              const row = byDate.get(cell.date)
              const pct = row ? Math.min(100, Math.round((row.steps / stepGoal) * 100)) : 0
              const active = selectedDate === cell.date
              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setSelectedDate(cell.date)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs border transition-all ${
                    active
                      ? 'border-primary bg-primary/15 text-bone shadow-lg shadow-primary/15'
                      : 'border-line/50 bg-basalt/40 text-fog hover:border-primary/30'
                  }`}
                >
                  <span className="font-semibold tabular-nums">{Number(cell.date.slice(8))}</span>
                  {row ? (
                    <span
                      className="text-[9px] mt-0.5 tabular-nums"
                      style={{ color: pct >= 80 ? '#ff6b6b' : '#94a3b8' }}
                    >
                      {pct}%
                    </span>
                  ) : (
                    <span className="text-[9px] mt-0.5 opacity-40">—</span>
                  )}
                </button>
              )
            })}
          </div>
        </Panel>

        {selectedDate ? (
          <Panel title={selectedDate} variant="raised" className="mt-4">
            {selected ? (
              <>
                <ActivityRings rings={buildRingsForDay(selected, goals)} />
                <p className="text-fog text-xs mt-4 text-center">
                  {selected.steps.toLocaleString()} steps · {selected.trainMin} min train ·{' '}
                  {selected.distanceKm.toFixed(1)} km
                </p>
              </>
            ) : selectedDate === new Date().toISOString().slice(0, 10) ? (
              <p className="text-fog text-sm">
                Today&apos;s live rings are on the{' '}
                <Link to="/" className="text-primary hover:underline">
                  Today
                </Link>{' '}
                screen.
              </p>
            ) : (
              <p className="text-fog text-sm">No synced activity for this day yet.</p>
            )}
          </Panel>
        ) : null}

        <Panel title="Weeks this month" variant="quiet" className="mt-6">
          <ul className="space-y-2 text-sm text-fog">
            {weekStartsInMonth(monthKey).map((ws) => (
              <li key={ws} className="flex justify-between border-b border-line/30 pb-2">
                <span>{ws}</span>
                <span className="text-bone/80">
                  {Array.from({ length: 7 }, (_, wd) => dateForWeekday(ws, wd))
                    .filter((d) => d.startsWith(monthKey.slice(0, 7)))
                    .map((d) => byDate.get(d)?.steps ?? 0)
                    .reduce((a, b) => a + b, 0)
                    .toLocaleString()}{' '}
                  steps
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </>
  )
}
