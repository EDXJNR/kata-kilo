import { useEffect } from 'react'
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'
import type { LatLng } from '@/lib/geo'
import 'leaflet/dist/leaflet.css'

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length < 2) return
    const bounds = points.map((p) => [p.lat, p.lng] as [number, number])
    map.fitBounds(bounds, { padding: [24, 24] })
  }, [points, map])
  return null
}

export default function LeafletRouteMap({
  points,
  height = 220,
  className = ''
}: {
  points: LatLng[]
  height?: number
  className?: string
}) {
  if (points.length < 2) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-line flex items-center justify-center text-fog text-xs ${className}`}
        style={{ height }}
      >
        No GPS path recorded yet
      </div>
    )
  }

  const center = points[Math.floor(points.length / 2)]
  const positions = points.map((p) => [p.lat, p.lng] as [number, number])

  return (
    <div className={`rounded-2xl overflow-hidden border border-line/60 shadow-inner ${className}`} style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={positions} pathOptions={{ color: '#ff375f', weight: 5, opacity: 0.9 }} />
        <FitBounds points={points} />
      </MapContainer>
    </div>
  )
}
