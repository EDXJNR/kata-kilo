import { Link } from 'react-router-dom'
import { HABIT_CATALOG } from '@/lib/habit-catalog'
import type { HabitsData } from '@/types/field-log'

export default function HabitStrip({ data }: { data: HabitsData }) {
  const todayKeys = new Set(data.today.filter((l) => l.completed).map((l) => l.habit_key))

  return (
    <div className="flex flex-wrap gap-2">
      {HABIT_CATALOG.map((h) => {
        const done = todayKeys.has(h.key)
        const streak = data.streaks[h.key] ?? 0
        return (
          <Link
            key={h.key}
            to="/habits"
            title="Daily wins"
            className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
              done ? 'border-primary/50 bg-primary/10 text-bone' : 'border-line bg-basalt2/40 text-fog hover:border-primary/30'
            }`}
          >
            <span className="mr-1">{h.emoji}</span>
            {h.label}
            {streak > 0 ? <span className="ml-2 text-primary tabular-nums">{streak}🔥</span> : null}
          </Link>
        )
      })}
    </div>
  )
}
