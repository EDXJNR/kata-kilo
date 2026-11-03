type RingSpec = { label: string; current: number; goal: number; color: string; unit?: string }

const DEFAULT_COLORS = ['#16a34a', '#0ea5e9', '#f59e0b']

function pct(spec: RingSpec) {
  return spec.goal > 0 ? Math.min(1, spec.current / spec.goal) : 0
}

function formatVal(spec: RingSpec) {
  if (spec.label === 'Steps' || spec.unit === '') return Math.round(spec.current).toLocaleString()
  if (spec.unit === 'min' || spec.unit === 'm') return String(Math.round(spec.current))
  return String(Math.round(spec.current))
}

function formatGoal(spec: RingSpec) {
  if (spec.label === 'Move') return `${Math.round(spec.goal)} kcal`
  if (spec.label === 'Train') return `${Math.round(spec.goal)} min`
  if (spec.label === 'Steps') return `${Math.round(spec.goal).toLocaleString()}`
  return `${Math.round(spec.goal)}${spec.unit ?? ''}`
}

export default function HudConcentricRings({ rings }: { rings: RingSpec[] }) {
  const specs = rings.slice(0, 3).map((r, i) => ({
    ...r,
    color: r.color || DEFAULT_COLORS[i] || '#16a34a'
  }))
  const radii = [50, 38, 26]
  const overall =
    specs.length > 0
      ? Math.round(specs.reduce((s, r) => s + pct(r) * 100, 0) / specs.length)
      : 0

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {specs.map((spec, i) => {
            const r = radii[i]
            const c = 2 * Math.PI * r
            const offset = c * (1 - pct(spec))
            return (
              <g key={spec.label}>
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="transparent"
                  className="stroke-slate-100 dark:stroke-hud-container-highest"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="transparent"
                  stroke={spec.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.2, 0.64, 1)' }}
                />
              </g>
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-xl text-hud-on font-bold leading-none">{overall}%</span>
          <span className="text-[10px] text-hud-on-variant font-medium uppercase mt-0.5">Today</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-hud-container-high/80 border border-slate-100 dark:border-hud-outline-variant/30"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: spec.color }} />
              <span className="font-display text-xs font-semibold text-slate-600 dark:text-hud-on-variant truncate">
                {spec.label}
              </span>
            </div>
            <span className="font-display text-sm text-hud-on font-bold tabular-nums">
              {formatVal(spec)}{' '}
              <span className="text-slate-400 dark:text-hud-on-variant text-xs font-normal">{formatGoal(spec)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
