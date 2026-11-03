export type LoaderVariant = 'run' | 'lift'

export function loaderVariantForPath(pathname: string): LoaderVariant {
  const p = pathname.toLowerCase()
  if (
    p.includes('/workouts') ||
    p.includes('/train') ||
    p.includes('/body') ||
    p.includes('/builder') ||
    p.includes('/library')
  ) {
    return 'lift'
  }
  return 'run'
}

function RunnerIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28" aria-hidden>
      <ellipse cx="60" cy="98" rx="28" ry="6" className="fill-primary/15 loader-shadow-pulse" />
      <g className="loader-run-body">
        <circle cx="72" cy="28" r="10" className="fill-none stroke-primary stroke-[3]" />
        <path
          d="M72 38 L58 58 L48 78 M58 58 L78 52 M48 78 L38 92 M48 78 L62 88"
          className="fill-none stroke-primary stroke-[3] stroke-linecap-round stroke-linejoin-round"
        />
      </g>
      <g className="loader-run-leg-a">
        <path d="M48 78 L42 92" className="stroke-primary stroke-[3] stroke-linecap-round" />
      </g>
      <g className="loader-run-leg-b">
        <path d="M62 88 L68 92" className="stroke-primary stroke-[3] stroke-linecap-round" />
      </g>
    </svg>
  )
}

function LifterIllustration() {
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28" aria-hidden>
      <ellipse cx="60" cy="98" rx="26" ry="5" className="fill-primary/15 loader-shadow-pulse" />
      <g className="loader-lift-body">
        <circle cx="60" cy="34" r="10" className="fill-none stroke-primary stroke-[3]" />
        <path
          d="M60 44 L60 68 M60 52 L44 48 M60 52 L76 48 M60 68 L50 88 M60 68 L70 88"
          className="fill-none stroke-primary stroke-[3] stroke-linecap-round stroke-linejoin-round"
        />
      </g>
      <g className="loader-lift-bar">
        <path
          d="M32 42 L88 42 M36 42 L36 38 M84 42 L84 38"
          className="fill-none stroke-bone stroke-[4] stroke-linecap-round"
        />
        <rect x="30" y="40" width="8" height="8" rx="2" className="fill-primary" />
        <rect x="82" y="40" width="8" height="8" rx="2" className="fill-primary" />
      </g>
    </svg>
  )
}

export default function FitnessLoader({
  variant,
  label
}: {
  variant: LoaderVariant
  label?: string
}) {
  const caption = label ?? (variant === 'lift' ? 'Loading training…' : 'Loading…')

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 min-h-[min(50vh,320px)]"
      role="status"
      aria-live="polite"
      aria-label={caption}
    >
      <div className="rounded-3xl border border-line/60 bg-basalt2/80 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5)] px-8 py-8 flex flex-col items-center">
        {variant === 'lift' ? <LifterIllustration /> : <RunnerIllustration />}
        <p className="mt-4 text-sm text-fog font-medium tracking-wide">{caption}</p>
        <div className="mt-3 flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary loader-dot"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
