export type LatLng = { lat: number; lng: number }

const EARTH_RADIUS_KM = 6371

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function pathDistanceKm(points: LatLng[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1], points[i])
  }
  return total
}

/** Rough estimate: ~1312 steps per km for running */
export function estimateSteps(distanceKm: number): number {
  return Math.round(distanceKm * 1312)
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatPace(minPerKm: number | null): string {
  if (minPerKm == null || !Number.isFinite(minPerKm) || minPerKm <= 0) return '—'
  const m = Math.floor(minPerKm)
  const s = Math.round((minPerKm - m) * 60)
  return `${m}:${String(s).padStart(2, '0')}/km`
}

export function paceMinPerKm(distanceKm: number, durationSec: number): number | null {
  if (distanceKm <= 0 || durationSec <= 0) return null
  return durationSec / 60 / distanceKm
}

export function normalizePath(points: LatLng[], padding = 0.08): {
  d: string
  viewBox: string
  start: { x: number; y: number }
  end: { x: number; y: number }
} | null {
  if (points.length < 2) return null
  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const latSpan = maxLat - minLat || 0.001
  const lngSpan = maxLng - minLng || 0.001
  const w = lngSpan * (1 + padding * 2)
  const h = latSpan * (1 + padding * 2)
  const originLng = minLng - lngSpan * padding
  const originLat = maxLat + latSpan * padding

  const toXY = (p: LatLng) => ({
    x: ((p.lng - originLng) / w) * 100,
    y: ((originLat - p.lat) / h) * 100
  })

  const xy = points.map(toXY)
  const coords = xy.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)

  return {
    d: `M ${coords.join(' L ')}`,
    viewBox: '0 0 100 100',
    start: xy[0],
    end: xy[xy.length - 1]
  }
}
