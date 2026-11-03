import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '@/components/hud/MaterialIcon'
import LoadingState from '@/components/ui/LoadingState'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import type { NutritionEntry } from '@/types/field-log'

const CAL_TARGET = 2800
const WATER_GOAL_L = 4

function formatMealTime(iso: string) {
  try {
    const d = new Date(iso)
    const meal = d.getHours() < 11 ? 'Breakfast' : d.getHours() < 15 ? 'Lunch' : d.getHours() < 18 ? 'Snack' : 'Dinner'
    return `${meal} · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
  } catch {
    return 'Meal'
  }
}

function todayEntries(entries: NutritionEntry[]) {
  const day = new Date().toISOString().slice(0, 10)
  return entries.filter((e) => e.recorded_at.startsWith(day))
}

export default function EatHub() {
  const { data: nutrition, loading, reload } = useAsyncData(() => api.nutrition.list())
  const { data: profile } = useAsyncData(() => api.profile.get())
  const [hydrating, setHydrating] = useState(false)

  const weight = profile?.weight_kg ?? 75
  const proteinTarget = Number(profile?.habit_targets?.protein_g) || Math.round(weight * 1.6)
  const carbsTarget = 310
  const fatTarget = 70

  const entries = useMemo(() => todayEntries(nutrition?.entries ?? []), [nutrition?.entries])
  const totals = nutrition?.totals ?? {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    water_ml: 0
  }

  const loggedCal = Math.round(totals.calories)
  const remaining = Math.max(0, CAL_TARGET - loggedCal)
  const calPct = CAL_TARGET > 0 ? Math.min(1, loggedCal / CAL_TARGET) : 0
  const gaugeOffset = 245 * (1 - calPct)

  async function addWater() {
    setHydrating(true)
    try {
      await api.nutrition.create({ meal: 'Water', water_ml: 250 })
      await reload()
    } finally {
      setHydrating(false)
    }
  }

  if (loading && !nutrition) return <LoadingState label="Loading nutrition…" />

  const macros = [
    { label: 'Protein', current: totals.protein_g, target: proteinTarget, bar: 'bg-emerald-600', labelColor: 'text-emerald-700' },
    { label: 'Carbs', current: totals.carbs_g, target: carbsTarget, bar: 'bg-sky-500', labelColor: 'text-sky-700' },
    { label: 'Fats', current: totals.fat_g, target: fatTarget, bar: 'bg-amber-500', labelColor: 'text-amber-700' }
  ]

  return (
    <div className="flex flex-col w-full px-5 lg:px-8 pb-10 gap-4 max-w-lg mx-auto lg:max-w-none font-body-hud bg-hud-surface pt-3">
      <div className="hidden lg:block pt-4 pb-2 border-b border-hud-outline-variant/40">
        <h1 className="font-display text-2xl font-bold text-hud-on">Eat &amp; nutrition</h1>
      </div>

      <section className="rounded-2xl bg-hud-container-lowest p-4 shadow-sm border border-hud-outline-variant/60">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-hud-outline-variant/40">
          <span className="text-xs text-slate-600 dark:text-hud-on-variant uppercase tracking-wider font-bold">
            Daily calorie budget
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-hud-container-high text-slate-600 text-[11px] font-medium">
            Goal <strong className="text-hud-on font-bold">{CAL_TARGET.toLocaleString()} kcal</strong>
          </div>
        </div>
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col">
            <span className="text-sm text-slate-500 dark:text-hud-on-variant font-medium">Remaining today</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display text-[44px] text-hud-on font-bold tracking-tight leading-none tabular-nums">
                {remaining}
              </span>
              <span className="text-sm text-slate-500 font-bold">kcal</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {loggedCal.toLocaleString()} eaten
              </span>
            </div>
          </div>
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="39" fill="transparent" stroke="#f1f5f9" className="dark:stroke-hud-container-highest" strokeWidth="8" />
              <circle
                cx="48"
                cy="48"
                r="39"
                fill="transparent"
                stroke="#16a34a"
                strokeDasharray="245"
                strokeDashoffset={gaugeOffset}
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-xl font-bold text-hud-on leading-none">{Math.round(calPct * 100)}%</span>
              <span className="text-[9px] text-emerald-600 uppercase font-bold mt-0.5 tracking-wider">Consumed</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 dark:border-hud-outline-variant/40">
          {macros.map((m) => {
            const left = Math.max(0, m.target - (m.current ?? 0))
            const pct = m.target > 0 ? Math.min(100, ((m.current ?? 0) / m.target) * 100) : 0
            return (
              <div key={m.label} className="flex flex-col p-2.5 rounded-xl bg-slate-50 dark:bg-hud-container-high border border-slate-100 dark:border-hud-outline-variant/30">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold tracking-wide ${m.labelColor}`}>{m.label}</span>
                  <span className="text-[10px] text-slate-500">{Math.round(left)}g left</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-base text-hud-on font-bold tabular-nums">{Math.round(m.current ?? 0)}</span>
                  <span className="text-[11px] text-slate-500">/ {m.target}g</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-hud-container-highest rounded-full overflow-hidden mt-2">
                  <div className={`h-full rounded-full ${m.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2.5">
        <Link
          to="/meals/scan"
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-600 text-white font-display text-sm font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <MaterialIcon name="photo_camera" className="text-[20px]" />
          AI photo scan
        </Link>
        <Link
          to="/meals/scan"
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-hud-container-lowest border border-hud-outline-variant/60 text-hud-on font-display text-sm font-bold shadow-sm hover:border-emerald-300 active:scale-95 transition-all"
        >
          <MaterialIcon name="add_circle" className="text-[20px] text-hud-primary" />
          Log food
        </Link>
      </div>

      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-hud-container-lowest border border-hud-outline-variant/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 shrink-0">
            <MaterialIcon name="water_drop" className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase text-slate-500 font-semibold tracking-wide">Water intake</span>
            <span className="font-display text-[15px] text-hud-on font-bold leading-tight tabular-nums">
              {((totals.water_ml ?? 0) / 1000).toFixed(1)} / {WATER_GOAL_L.toFixed(1)}L
            </span>
          </div>
        </div>
        <button
          type="button"
          disabled={hydrating}
          onClick={() => void addWater()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-display text-[13px] font-bold active:scale-95 transition-all disabled:opacity-50"
        >
          <MaterialIcon name="add" className="text-[16px]" />
          +250ml
        </button>
      </div>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[17px] text-hud-on font-bold">Today&apos;s meals</h3>
            <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-hud-container-high px-2.5 py-0.5 rounded-full font-medium">
              {entries.length} logged
            </span>
          </div>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-hud-on-variant rounded-2xl border border-dashed border-hud-outline-variant/50 p-4 text-center bg-hud-container-lowest">
            No meals logged yet — scan or log your first meal.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl bg-hud-container-lowest p-3.5 border border-hud-outline-variant/60 shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-slate-500 font-medium">{formatMealTime(entry.recorded_at)}</span>
                  <h4 className="font-display text-[15px] text-hud-on font-semibold mt-0.5 truncate">{entry.meal}</h4>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-3">
                  <span className="font-display text-lg text-hud-on font-bold leading-none tabular-nums">{entry.calories ?? '—'}</span>
                  <span className="text-[10px] text-slate-500 uppercase mt-0.5">kcal</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-hud-outline-variant/40 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium">
                  {Math.round(entry.protein_g ?? 0)}g P
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-medium">
                  {Math.round(entry.carbs_g ?? 0)}g C
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium">
                  {Math.round(entry.fat_g ?? 0)}g F
                </span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
