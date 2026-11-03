import { getStepGoal, last7DayKeys, stepsForDate, todayKey } from '@/lib/daily-steps'

function MiniRing({ pct, dayNum, isToday, weekday }: { pct: number; dayNum: number; isToday: boolean; weekday: string }) {
  const r = 14
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, pct))

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[2.25rem]">
      <span className={`text-[10px] font-medium ${isToday ? 'text-primary' : 'text-fog/80'}`}>{weekday}</span>
      <div className="relative w-9 h-9">
        {isToday ? <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" aria-hidden /> : null}
        <svg viewBox="0 0 36 36" className="w-9 h-9">
          <circle cx="18" cy="18" r={r} fill="none" stroke="rgb(var(--color-line))" strokeWidth="3" opacity={0.35} />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke="#ff375f"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 18 18)"
            style={{ filter: pct > 0 ? 'drop-shadow(0 0 4px rgba(255,55,95,0.6))' : undefined }}
            opacity={pct > 0 ? 1 : 0.2}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums ${
            isToday ? 'text-bone' : 'text-fog'
          }`}
        >
          {dayNum}
        </span>
      </div>
    </div>
  )
}

export default function StepWeekRings({ stepsToday }: { stepsToday: number }) {
  const goal = getStepGoal()
  const keys = last7DayKeys()
  const today = todayKey()
  const weekdayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="flex justify-between gap-1">
      {keys.map((dateKey) => {
        const steps = dateKey === today ? stepsToday : stepsForDate(dateKey)
        const pct = goal > 0 ? steps / goal : 0
        const d = new Date(dateKey + 'T12:00:00')
        return (
          <MiniRing
            key={dateKey}
            pct={pct}
            dayNum={d.getDate()}
            isToday={dateKey === today}
            weekday={weekdayLetters[(d.getDay() + 6) % 7]}
          />
        )
      })}
    </div>
  )
}
