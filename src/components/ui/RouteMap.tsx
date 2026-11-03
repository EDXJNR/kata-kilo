import type { LatLng } from '@/lib/geo'
import { normalizePath } from '@/lib/geo'

export default function RouteMap({
  points,
  live = false,
  height = 200
}: {
  points: LatLng[]
  live?: boolean
  height?: number
}) {
  const path = normalizePath(points)

  if (!path) {
    return (
      <div
        className="rounded-md border border-dashed border-line flex items-center justify-center text-fog text-xs font-mono"
        style={{ height }}
      >
        {live ? 'Waiting for GPS signal…' : 'No route path recorded'}
      </div>
    )
  }

  return (
    <div className="rounded-md border border-line bg-basalt overflow-hidden" style={{ height }}>
      <svg viewBox={path.viewBox} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="route-glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7A9471" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4F6B7A" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          d={path.d}
          fill="none"
          stroke="url(#route-glow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.length > 0 ? (
          <>
            <circle cx={path.start.x} cy={path.start.y} r="3" fill="#7A9471" />
            <circle
              cx={path.end.x}
              cy={path.end.y}
              r="3"
              fill={live ? '#C9683F' : '#EDEDE6'}
            />
          </>
        ) : null}
      </svg>
    </div>
  )
}
