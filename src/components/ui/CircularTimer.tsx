type Props = {
  /** 0–1 progress (1 = full ring) */
  progress: number
  /** Center primary label e.g. 12:34 */
  label: string
  /** Smaller caption above label */
  caption?: string
  /** Subtitle below label */
  subtitle?: string
  color?: string
  size?: number
  className?: string
}

export default function CircularTimer({
  progress,
  label,
  caption,
  subtitle,
  color = '#ff375f',
  size = 200,
  className = ''
}: Props) {
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(1, Math.max(0, progress))
  const offset = c * (1 - pct)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="drop-shadow-[0_0_24px_rgba(255,55,95,0.35)]">
        <defs>
          <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#ff6b9d" />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgb(var(--color-line))"
          strokeWidth={stroke}
          opacity={0.35}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#timerGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        {caption ? (
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-fog mb-1">{caption}</span>
        ) : null}
        <span className="font-display font-bold tabular-nums text-bone" style={{ fontSize: size * 0.18 }}>
          {label}
        </span>
        {subtitle ? <span className="text-xs text-fog mt-1">{subtitle}</span> : null}
      </div>
    </div>
  )
}
