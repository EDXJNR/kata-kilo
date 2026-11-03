import { BMI_HEALTHY_MAX, BMI_HEALTHY_MIN, bmiCategory, bmiTargetProgress } from '@/lib/body-metrics'

export default function BmiProgressRing({
  bmiValue,
  heightCm,
  weightKg
}: {
  bmiValue: number
  heightCm: number
  weightKg: number
}) {
  const cat = bmiCategory(bmiValue)
  const { pct, target } = bmiTargetProgress(bmiValue)
  const radius = 72
  const stroke = 12
  const c = 2 * Math.PI * radius
  const offset = c * (1 - pct / 100)
  const m = heightCm / 100
  const targetWeight = Math.round(target * m * m * 10) / 10

  return (
    <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center">
      <div className="relative mx-auto">
        <svg viewBox="0 0 180 180" className="w-44 h-44">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="rgb(var(--color-line))" strokeWidth={stroke} opacity={0.35} />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={cat.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 90 90)"
            style={{ filter: `drop-shadow(0 0 8px ${cat.color}66)`, transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text x="90" y="82" textAnchor="middle" className="fill-fog" fontSize="10" fontFamily="IBM Plex Mono">
            BMI
          </text>
          <text x="90" y="108" textAnchor="middle" fill="rgb(var(--color-bone))" fontSize="26" fontWeight="700" fontFamily="Space Grotesk">
            {bmiValue}
          </text>
          <text x="90" y="126" textAnchor="middle" fill={cat.color} fontSize="10" fontFamily="IBM Plex Mono">
            {cat.label}
          </text>
        </svg>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-basalt/60 px-4 py-3 font-mono text-sm">
          <p className="text-fog text-xs uppercase tracking-widest mb-1">Formula</p>
          <p className="text-bone">
            {weightKg} ÷ ({m.toFixed(2)} m)² = <span className="text-primary font-bold">{bmiValue}</span>
          </p>
        </div>
        <div>
          <p className="text-fog text-xs font-mono uppercase tracking-widest mb-1">Healthy range</p>
          <p className="text-bone text-lg font-display font-semibold">
            {BMI_HEALTHY_MIN} – {BMI_HEALTHY_MAX}
          </p>
        </div>
        <div>
          <p className="text-fog text-xs font-mono uppercase tracking-widest mb-1">Target weight @ BMI {target}</p>
          <p className="text-primary text-2xl font-display font-bold">{targetWeight} kg</p>
        </div>
        <div>
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-fog">Progress to target</span>
            <span style={{ color: cat.color }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-line/40 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cat.color }} />
          </div>
        </div>
      </div>
    </div>
  )
}
