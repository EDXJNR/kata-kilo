type RingSpec = {
  label: string
  current: number
  goal: number
  color: string
  unit?: string
}

function formatValue(spec: RingSpec) {
  if (spec.unit === 'km') return spec.current.toFixed(1)
  if (spec.unit === 'min') return String(Math.round(spec.current))
  if (spec.unit === 'kcal') return String(Math.round(spec.current))
  return String(Math.round(spec.current))
}

function RingArc({
  spec,
  radius,
  stroke
}: {
  spec: RingSpec
  radius: number
  stroke: number
}) {
  const pct = spec.goal > 0 ? Math.min(spec.current / spec.goal, 1) : 0
  const c = 2 * Math.PI * radius
  const offset = c * (1 - pct)

  return (
    <circle
      cx="120"
      cy="120"
      r={radius}
      fill="none"
      stroke={spec.color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeDasharray={c}
      strokeDashoffset={offset}
      transform="rotate(-90 120 120)"
      style={{
        transition: 'stroke-dashoffset 1.25s cubic-bezier(0.34, 1.2, 0.64, 1)',
        filter: `drop-shadow(0 0 12px ${spec.color}66)`
      }}
    />
  )
}

function RingTrack({ radius, stroke, trackColor }: { radius: number; stroke: number; trackColor: string }) {
  return (
    <circle cx="120" cy="120" r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} opacity={0.35} />
  )
}

export default function ActivityRings({ rings }: { rings: RingSpec[] }) {
  const specs = rings.filter(Boolean).slice(0, 3)
  const radii = [88, 68, 48]
  const strokes = [14, 14, 12]
  const trackColor = 'rgb(var(--color-line))'

  const overallPct =
    specs.length > 0
      ? Math.round(
          specs.reduce((s, r) => s + Math.min(100, (r.current / r.goal) * 100), 0) / specs.length
        )
      : 0

  return (
    <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-center">
      <div className="relative mx-auto">
        <svg viewBox="0 0 240 240" className="w-56 h-56 sm:w-64 sm:h-64">
          {specs.map((spec, i) => (
            <g key={spec.label}>
              <RingTrack radius={radii[i]} stroke={strokes[i]} trackColor={trackColor} />
              <RingArc spec={spec} radius={radii[i]} stroke={strokes[i]} />
            </g>
          ))}
          <text
            x="120"
            y="112"
            textAnchor="middle"
            className="fill-fog"
            fontSize="11"
            fontFamily="IBM Plex Mono"
            letterSpacing="0.12em"
          >
            TODAY
          </text>
          <text
            x="120"
            y="138"
            textAnchor="middle"
            fill="rgb(var(--color-bone))"
            fontSize="28"
            fontWeight="700"
            fontFamily="Space Grotesk, sans-serif"
          >
            {overallPct}%
          </text>
        </svg>
      </div>

      <div className="space-y-3">
        {specs.map((r) => {
          const pct = r.goal > 0 ? Math.min(100, Math.round((r.current / r.goal) * 100)) : 0
          return (
            <div
              key={r.label}
              className="rounded-xl border border-line bg-basalt/60 p-4 transition-transform hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-basalt2"
                    style={{ background: r.color, boxShadow: `0 0 10px ${r.color}88` }}
                  />
                  <span className="text-bone font-display font-semibold text-base">{r.label}</span>
                </div>
                <span className="text-fog text-xs font-mono">{pct}%</span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-2xl font-display font-bold tabular-nums" style={{ color: r.color }}>
                  {formatValue(r)}
                  {r.unit ? (
                    <span className="text-fog text-sm font-mono font-normal ml-1">{r.unit}</span>
                  ) : null}
                </p>
                <p className="text-fog text-xs font-mono">
                  goal {r.goal} {r.unit ?? ''}
                </p>
              </div>
              <div className="mt-2.5 h-1.5 rounded-full bg-line/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: r.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type { RingSpec }
