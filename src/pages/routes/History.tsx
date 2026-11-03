import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { HudIntroBlock, HudStatCard, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/components/ui/FieldInput'
import LoadingState from '@/components/ui/LoadingState'
import LeafletRouteMap from '@/components/ui/LeafletRouteMap'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import type { RouteEntry } from '@/types/field-log'

function formatPace(minPerKm: number | null | undefined) {
  if (minPerKm == null || !Number.isFinite(minPerKm)) return '—'
  const m = Math.floor(minPerKm)
  const s = Math.round((minPerKm - m) * 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDuration(min: number | null | undefined) {
  if (min == null) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

export default function RouteHistory() {
  const { data, loading, error } = useAsyncData(() => api.routes.list())
  const entries = data?.entries ?? []
  const [filter, setFilter] = useState<'all' | 'run' | 'walk'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return entries
    return entries.filter((e) => (filter === 'run' ? e.activity_type === 'run' : e.activity_type !== 'run'))
  }, [entries, filter])

  const selected = useMemo(
    () => filtered.find((e) => e.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  )

  const totalKm = entries.reduce((sum, e) => sum + e.distance_km, 0)
  const avgPace =
    entries.filter((e) => e.avg_pace_min_km).length > 0
      ? entries.reduce((s, e) => s + (e.avg_pace_min_km ?? 0), 0) / entries.filter((e) => e.avg_pace_min_km).length
      : null
  const totalElev = entries.reduce((s, e) => s + (e.elevation_m ?? 0), 0)

  if (loading) return <LoadingState />

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Route history" />
      </div>
      <HudSubpageShell className="gap-5">
        <HudIntroBlock
          eyebrow="Telemetry log"
          title="Route history"
          description="GPS trails, elevation profiles, and outdoor movement data."
          trailing={
            <span className="text-[11px] text-hud-on-variant bg-hud-container-high px-2.5 py-0.5 rounded-full font-display">
              {entries.length} saved
            </span>
          }
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="grid grid-cols-2 gap-2.5">
          <HudStatCard label="Total distance" value={Math.round(totalKm * 10) / 10} unit="km" hint="All time" icon="distance" />
          <HudStatCard label="Saved routes" value={entries.length} unit="paths" hint={`${filtered.length} shown`} icon="polyline" />
          <HudStatCard label="Avg pace" value={formatPace(avgPace)} unit="/km" hint="Recorded sessions" icon="speed" />
          <HudStatCard label="Total ascent" value={Math.round(totalElev)} unit="m" hint="If GPS provided elev." icon="landscape" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
          {(
            [
              ['all', 'All routes', entries.length],
              ['run', 'Running', entries.filter((e) => e.activity_type === 'run').length],
              ['walk', 'Trail walks', entries.filter((e) => e.activity_type !== 'run').length]
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-display font-semibold whitespace-nowrap shadow-sm ${
                filter === key ? 'bg-slate-900 text-white' : 'bg-hud-container-lowest text-hud-on border border-hud-outline-variant/40'
              }`}
            >
              {label} {count > 0 ? `(${count})` : ''}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No routes yet" hint="Finish a tracked walk or run from the Walk tab." />
        ) : selected ? (
          <FeaturedRoute entry={selected} />
        ) : null}

        <div className="flex flex-col gap-3">
          {filtered.slice(0, 8).map((e) => (
            <CompactRouteRow key={e.id} entry={e} active={e.id === selected?.id} onClick={() => setSelectedId(e.id)} />
          ))}
        </div>

        <section className="bg-hud-container-low rounded-2xl p-4 flex flex-col items-center text-center gap-3 border border-hud-outline-variant/30">
          <div className="w-10 h-10 rounded-full bg-hud-container-lowest flex items-center justify-center text-hud-primary shadow-sm">
            <MaterialIcon name="file_upload" className="text-[20px]" />
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-hud-on">Import outdoor telemetry</h4>
            <p className="text-xs text-hud-on-variant px-2 mt-0.5">GPX import coming soon — track live routes today.</p>
          </div>
          <Link to="/routes/track" className="w-full py-2 rounded-xl bg-hud-container-lowest text-hud-on text-xs font-semibold shadow-sm hover:bg-hud-container-high">
            Start GPS track
          </Link>
        </section>
      </HudSubpageShell>
    </>
  )
}

function FeaturedRoute({ entry }: { entry: RouteEntry }) {
  return (
    <div className="bg-hud-container-lowest rounded-2xl shadow-sm p-4 flex flex-col gap-3 border border-hud-outline-variant/30">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="bg-hud-primary/10 text-hud-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <MaterialIcon name="verified" className="text-[12px]" /> GPS
            </span>
            <span className="text-[11px] text-hud-on-variant">{formatDate(entry.recorded_at)}</span>
          </div>
          <h3 className="font-display font-semibold text-hud-on">{entry.name}</h3>
          <p className="text-sm text-hud-on-variant capitalize">{entry.activity_type ?? 'outdoor'} session</p>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden h-44 bg-hud-container-low">
        <LeafletRouteMap points={entry.path ?? []} height={176} />
      </div>
      <div className="grid grid-cols-4 gap-2 py-1 border-y border-hud-outline-variant/40">
        <MetricCol label="Dist" value={`${entry.distance_km.toFixed(2)} km`} />
        <MetricCol label="Duration" value={formatDuration(entry.duration_min)} />
        <MetricCol label="Pace" value={formatPace(entry.avg_pace_min_km)} />
        <MetricCol label="Steps" value={entry.steps != null ? entry.steps.toLocaleString() : '—'} primary />
      </div>
      <div className="flex gap-2">
        <Link
          to="/routes/track"
          className="flex-1 bg-hud-primary text-white py-2.5 rounded-xl text-xs font-display font-semibold flex items-center justify-center gap-1.5"
        >
          <MaterialIcon name="play_arrow" className="text-[16px]" /> Run again
        </Link>
      </div>
    </div>
  )
}

function MetricCol({ label, value, primary }: { label: string; value: string; primary?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-hud-on-variant uppercase">{label}</span>
      <span className={`font-display text-sm font-bold ${primary ? 'text-hud-primary' : 'text-hud-on'}`}>{value}</span>
    </div>
  )
}

function CompactRouteRow({
  entry,
  active,
  onClick
}: {
  entry: RouteEntry
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-hud-container-lowest rounded-2xl p-4 shadow-sm border transition-colors ${
        active ? 'border-hud-primary/40' : 'border-hud-outline-variant/20'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-hud-container-high flex items-center justify-center text-hud-primary shrink-0">
            <MaterialIcon name={entry.activity_type === 'run' ? 'timer' : 'hiking'} className="text-[18px]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-hud-on truncate">{entry.name}</h4>
            <span className="text-[11px] text-hud-on-variant">{formatDate(entry.recorded_at)}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 text-xs font-display">
        <span>{entry.distance_km.toFixed(2)} km</span>
        <span>{formatDuration(entry.duration_min)}</span>
        <span className="text-hud-primary">{formatPace(entry.avg_pace_min_km)} /km</span>
      </div>
    </button>
  )
}
