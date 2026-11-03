type LogRowItem = {
  label: string
  value: string | number | null
  unit?: string
  /** Only set this when the value has a real state to signal — on track,
   * needs attention, personal best. Omit for neutral data; color should
   * mean something, not decorate every row. */
  status?: 'good' | 'attention' | 'neutral'
}

const STATUS_CLASS: Record<NonNullable<LogRowItem['status']>, string> = {
  good: 'text-cyan',
  attention: 'text-accent',
  neutral: 'text-bone'
}

export default function LogRow({ items }: { items: LogRowItem[] }) {
  return (
    <div className="divide-y divide-line/70 border-t border-b border-line/70">
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline justify-between gap-4 py-2.5 px-1">
          <span className="text-fog text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
          <span className={`font-display text-lg font-semibold tabular-nums ${STATUS_CLASS[item.status ?? 'neutral']}`}>
            {item.value ?? '—'}
            {item.value != null && item.unit ? (
              <span className="text-fog text-xs font-mono ml-1 font-normal">{item.unit}</span>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  )
}

export type { LogRowItem }
