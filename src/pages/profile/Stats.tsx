import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { HudIntroBlock, HudStatCard, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import LoadingState from '@/components/ui/LoadingState'
import { FieldLabel, PrimaryButton, TextField } from '@/components/ui/FieldInput'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'

export default function ProfileStats() {
  const { data, loading, error } = useAsyncData(() => api.profile.get())
  const { data: routes } = useAsyncData(() => api.routes.list())
  const [steps, setSteps] = useState('')
  const [sleepH, setSleepH] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)

  if (loading) return <LoadingState />

  const stats = data?.stats
  const totalKm = routes?.entries.reduce((s, e) => s + e.distance_km, 0) ?? 0
  const activeDays =
    (stats?.workouts ?? 0) + (stats?.routes ?? 0) + (stats?.sleepEntries ?? 0) + (stats?.nutritionEntries ?? 0)

  async function importHealth() {
    setImporting(true)
    setImportMsg(null)
    try {
      const payload: { steps?: number; sleep?: { duration_h: number } } = {}
      if (steps.trim()) payload.steps = Number(steps)
      if (sleepH.trim()) payload.sleep = { duration_h: Number(sleepH) }
      const res = await api.health.importManual(payload)
      setImportMsg(`Imported ${res.imported.steps ?? 0} steps · sleep ${res.imported.sleep ?? 0}`)
      setSteps('')
      setSleepH('')
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Lifetime stats" />
      </div>
      <HudSubpageShell className="gap-5">
        <HudIntroBlock
          eyebrow="Verified telemetry"
          title="Lifetime trajectory"
          description="Aggregate athletic output across training, movement, and recovery."
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <section className="col-span-2 bg-hud-container-lowest p-4 rounded-xl shadow-sm border border-hud-outline-variant/30">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Active footprint</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-display text-3xl font-bold text-hud-on">{activeDays}</span>
                <span className="text-hud-primary font-semibold">logs</span>
              </div>
            </div>
            <MaterialIcon name="local_fire_department" className="text-hud-primary text-[28px]" filled />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <HudStatCard label="Workouts" value={stats?.workouts ?? 0} hint="Sessions logged" icon="fitness_center" />
          <HudStatCard label="Distance" value={Math.round(totalKm * 10) / 10} unit="km" hint="Outdoor routes" icon="directions_run" />
          <HudStatCard label="Meals" value={stats?.nutritionEntries ?? 0} hint="Nutrition logs" icon="restaurant" />
          <HudStatCard label="Sleep" value={stats?.sleepEntries ?? 0} hint="Nights logged" icon="bedtime" />
        </div>

        <section>
          <h3 className="font-display font-semibold text-hud-on mb-2">Activity ledger</h3>
          <div className="flex flex-col gap-2">
            {[
              { icon: 'monitor_weight', title: 'Body composition', sub: 'Weight & measurements', stat: `${stats?.bodyEntries ?? 0} logs` },
              { icon: 'exercise', title: 'Strength & splits', sub: 'Workout sessions', stat: `${stats?.workouts ?? 0} sessions` },
              { icon: 'map', title: 'Outdoor routes', sub: 'GPS-calibrated', stat: `${stats?.routes ?? 0} trails` },
              { icon: 'nutrition', title: 'Nutrition', sub: 'Meals & macros', stat: `${stats?.nutritionEntries ?? 0} meals` },
              { icon: 'bedtime', title: 'Sleep', sub: 'Duration logs', stat: `${stats?.sleepEntries ?? 0} nights` }
            ].map((row) => (
              <div
                key={row.title}
                className="bg-hud-container-lowest p-3.5 rounded-xl shadow-sm border border-hud-outline-variant/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-hud-container-low flex items-center justify-center text-hud-primary shrink-0">
                    <MaterialIcon name={row.icon} className="text-[20px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-hud-on">{row.title}</p>
                    <p className="text-xs text-hud-on-variant truncate">{row.sub}</p>
                  </div>
                </div>
                <span className="text-xs font-display font-semibold text-hud-on shrink-0">{row.stat}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-hud-container-lowest rounded-xl p-4 border border-hud-outline-variant/30 space-y-3">
          <h3 className="font-display text-sm font-semibold text-hud-on">Manual health import</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Steps</FieldLabel>
              <TextField value={steps} onChange={(e) => setSteps(e.target.value)} type="number" />
            </div>
            <div>
              <FieldLabel>Sleep (h)</FieldLabel>
              <TextField value={sleepH} onChange={(e) => setSleepH(e.target.value)} type="number" />
            </div>
          </div>
          <PrimaryButton loading={importing} onClick={() => void importHealth()}>
            Import snapshot
          </PrimaryButton>
          {importMsg ? <p className="text-xs text-hud-on-variant">{importMsg}</p> : null}
        </section>
      </HudSubpageShell>
    </>
  )
}
