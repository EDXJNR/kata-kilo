export default function MacroBar({
  label,
  value,
  unit,
  max,
  accent = 'primary'
}: {
  label: string
  value: number
  unit: string
  max: number
  accent?: 'primary' | 'accent' | 'cyan' | 'amber' | 'pink' | 'moss' | 'ember' | 'slate'
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const barColor =
    accent === 'accent' || accent === 'ember'
      ? 'bg-accent'
      : accent === 'cyan' || accent === 'slate'
        ? 'bg-cyan'
        : accent === 'amber'
          ? 'bg-amber'
          : accent === 'pink'
            ? 'bg-pink'
            : 'bg-primary'

  return (
    <div>
      <div className="flex justify-between text-[11px] font-mono uppercase tracking-widest mb-1.5">
        <span className="text-fog">{label}</span>
        <span className="text-bone">
          {Math.round(value)}
          {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-basalt overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
