const ACCENT_MAP = {
  gold: { stroke: '#4ade80', bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' },
  coral: { stroke: '#FF6B6B', bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent' },
  cyan: { stroke: '#22D3EE', bg: 'bg-cyan/10', border: 'border-cyan/30', text: 'text-cyan' },
  violet: { stroke: '#A78BFA', bg: 'bg-violet/10', border: 'border-violet/30', text: 'text-violet' },
  pink: { stroke: '#F472B6', bg: 'bg-pink/10', border: 'border-pink/30', text: 'text-pink' }
} as const

export default function MacroRingCard({
  label,
  value,
  max,
  unit,
  accent = 'gold'
}: {
  label: string
  value: number
  max: number
  unit: string
  accent?: keyof typeof ACCENT_MAP
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)
  const theme = ACCENT_MAP[accent]

  return (
    <div className={`rounded-xl border ${theme.border} ${theme.bg} p-4 flex flex-col items-center`}>
      <div className="relative">
        <svg viewBox="0 0 88 88" className="w-[88px] h-[88px] -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgb(var(--color-line))" strokeWidth="6" opacity="0.4" />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-lg font-bold tabular-nums ${theme.text}`}>{pct}%</span>
        </div>
      </div>
      <p className="text-fog text-[10px] font-medium uppercase tracking-widest mt-2">{label}</p>
      <p className={`font-display text-sm font-semibold tabular-nums ${theme.text}`}>
        {Math.round(value)}
        <span className="text-fog text-xs font-normal ml-0.5">{unit}</span>
      </p>
    </div>
  )
}
