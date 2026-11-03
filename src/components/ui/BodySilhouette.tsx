import { bmiCategory } from '@/lib/body-metrics'

/** Maps BMI to horizontal body mass — wider silhouette as BMI rises. */
function bodyScale(bmi: number): { scaleX: number; scaleY: number } {
  if (bmi < 18.5) {
    const t = bmi / 18.5
    return { scaleX: 0.78 + t * 0.1, scaleY: 0.92 + t * 0.06 }
  }
  if (bmi < 25) {
    const t = (bmi - 18.5) / 6.5
    return { scaleX: 0.88 + t * 0.1, scaleY: 0.98 + t * 0.04 }
  }
  if (bmi < 30) {
    const t = (bmi - 25) / 5
    return { scaleX: 0.98 + t * 0.22, scaleY: 1.02 + t * 0.06 }
  }
  const t = Math.min(1, (bmi - 30) / 12)
  return { scaleX: 1.2 + t * 0.28, scaleY: 1.08 + t * 0.08 }
}

export default function BodySilhouette({
  bmiValue,
  weightKg,
  heightCm
}: {
  bmiValue: number
  weightKg: number
  heightCm: number
}) {
  const cat = bmiCategory(bmiValue)
  const { scaleX, scaleY } = bodyScale(bmiValue)
  const heightM = (heightCm / 100).toFixed(2)

  return (
    <div className="flex flex-col items-center">
      <div className="body-scene relative w-full max-w-[220px] h-[280px] mx-auto">
        <div
          className="body-spinner absolute inset-0 flex items-center justify-center"
          style={{ perspective: '600px' }}
        >
          <div
            className="body-figure"
            style={{
              transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <svg viewBox="0 0 120 240" className="w-[120px] h-[240px] drop-shadow-lg" aria-hidden>
              <defs>
                <linearGradient id="bodyFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={cat.color} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={cat.color} stopOpacity="0.45" />
                </linearGradient>
                <filter id="bodyGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Head */}
              <ellipse cx="60" cy="22" rx="16" ry="18" fill="url(#bodyFill)" filter="url(#bodyGlow)" />
              {/* Neck */}
              <rect x="54" y="38" width="12" height="10" rx="3" fill="url(#bodyFill)" opacity="0.9" />
              {/* Torso */}
              <path
                d="M38 48 Q60 44 82 48 L88 118 Q60 128 32 118 Z"
                fill="url(#bodyFill)"
                filter="url(#bodyGlow)"
              />
              {/* Arms */}
              <path
                d="M38 52 Q18 70 14 110 Q16 118 24 116 Q28 80 38 68 Z"
                fill="url(#bodyFill)"
                opacity="0.85"
              />
              <path
                d="M82 52 Q102 70 106 110 Q104 118 96 116 Q92 80 82 68 Z"
                fill="url(#bodyFill)"
                opacity="0.85"
              />
              {/* Legs */}
              <path d="M42 118 L38 210 Q44 218 50 210 L54 118 Z" fill="url(#bodyFill)" opacity="0.9" />
              <path d="M66 118 L62 210 Q68 218 74 210 L78 118 Z" fill="url(#bodyFill)" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Floor shadow */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-primary/20 blur-md"
          style={{ width: `${80 * scaleX}px`, height: '12px' }}
        />
      </div>

      <div className="mt-3 text-center space-y-1">
        <p className="font-display text-3xl font-bold tabular-nums" style={{ color: cat.color }}>
          {bmiValue}
          <span className="text-fog text-sm font-normal ml-1">BMI</span>
        </p>
        <p className="text-sm font-medium" style={{ color: cat.color }}>
          {cat.label}
        </p>
        <p className="text-fog text-xs tabular-nums">
          {weightKg} kg · {heightCm} cm · {heightM} m
        </p>
      </div>
    </div>
  )
}
