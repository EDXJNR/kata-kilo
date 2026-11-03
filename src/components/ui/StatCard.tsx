export default function StatCard({
  label,
  value,
  unit,
  accent = 'primary'
}: {
  label: string
  value: string | number | null
  unit?: string
  accent?: 'primary' | 'accent' | 'cyan' | 'amber' | 'pink' | 'violet' | 'moss' | 'ember' | 'slate'
}) {
  const accentClass =
    accent === 'accent' || accent === 'ember'
      ? 'text-accent'
      : accent === 'cyan' || accent === 'slate'
        ? 'text-cyan'
        : accent === 'amber'
          ? 'text-amber'
          : accent === 'pink'
            ? 'text-pink'
            : accent === 'violet'
              ? 'text-violet'
              : 'text-primary'

  const display =
    typeof value === 'string' && value.length > 18 ? `${value.slice(0, 16)}…` : value

  return (
    <div className="rounded-lg border border-line bg-basalt2 p-4">
      <div className="text-fog text-[11px] font-mono uppercase tracking-widest mb-2">{label}</div>
      <div className={`font-display text-2xl font-semibold ${accentClass}`}>
        {display ?? '—'}
        {value != null && unit ? (
          <span className="text-fog text-sm font-mono ml-1">{unit}</span>
        ) : null}
      </div>
    </div>
  )
}
