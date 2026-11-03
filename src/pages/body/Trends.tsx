import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { HudIntroBlock, HudStatCard, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import TrendChart from '@/components/TrendChart'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/components/ui/FieldInput'
import LoadingState from '@/components/ui/LoadingState'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { bmi, bmiTrend, metricTrend } from '@/lib/body-metrics'

const HORIZONS = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const

export default function BodyTrends() {
  const { data, loading, error } = useAsyncData(() => api.body.list())
  const { data: profile } = useAsyncData(() => api.profile.get())
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>('3M')

  const entries = data?.entries ?? []
  const heightCm = profile?.height_cm ?? null
  const latest = entries.find((e) => e.weight_kg != null)
  const first = [...entries].reverse().find((e) => e.weight_kg != null)
  const weightDelta =
    latest?.weight_kg != null && first?.weight_kg != null ? Math.round((latest.weight_kg - first.weight_kg) * 10) / 10 : null
  const currentBmi = latest?.weight_kg != null && heightCm ? bmi(latest.weight_kg, heightCm) : null

  if (loading) return <LoadingState />

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Trends & history" />
      </div>
      <HudSubpageShell className="gap-5">
        <HudIntroBlock
          eyebrow="Trends & history"
          title="Body composition"
          description="Weight trajectory and measurement logs."
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="bg-hud-container-low p-1 rounded-xl flex items-center justify-between shadow-sm border border-hud-outline-variant/30">
          {HORIZONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizon(h)}
              className={`flex-1 py-1.5 text-center text-[10px] font-display uppercase rounded-lg ${
                horizon === h ? 'bg-hud-container-lowest text-hud-on font-bold shadow-sm' : 'text-hud-on-variant'
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <HudStatCard
            label="Current weight"
            value={latest?.weight_kg?.toFixed(1) ?? '—'}
            unit="kg"
            hint={weightDelta != null ? `${weightDelta > 0 ? '+' : ''}${weightDelta} kg vs first log` : 'Log weight'}
            hintPrimary={weightDelta != null && weightDelta <= 0}
            icon="monitor_weight"
          />
          <HudStatCard
            label="Body fat est."
            value={latest?.body_fat_pct?.toFixed(1) ?? '—'}
            unit="%"
            hint={latest?.body_fat_pct != null ? 'From your entry' : 'Optional field'}
            icon="accessibility_new"
          />
          <HudStatCard
            label="BMI"
            value={currentBmi?.toFixed(1) ?? '—'}
            unit="pts"
            hint={heightCm ? 'Athletic zone' : 'Set height in profile'}
          />
          <HudStatCard
            label="Waist circ."
            value={latest?.waist_cm?.toFixed(1) ?? '—'}
            unit="cm"
            hint="Latest measurement"
            icon="straighten"
          />
        </div>

        {!heightCm ? (
          <EmptyState title="Height required" hint="Set height in profile to unlock BMI charts." />
        ) : (
          <section className="bg-hud-container-lowest rounded-xl p-4 shadow-sm border border-hud-outline-variant/30">
            <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Trajectory</span>
            <h3 className="font-display font-semibold text-hud-on mb-2">Weight & BMI</h3>
            <TrendChart data={metricTrend(entries, 'weight_kg')} accent="primary" unit="kg" height={140} />
            <div className="mt-3 pt-3 border-t border-hud-outline-variant/40">
              <TrendChart data={bmiTrend(entries, heightCm)} accent="cyan" unit="" height={100} />
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-hud-on">Recent weigh-ins</h3>
          </div>
          <div className="flex flex-col gap-2">
            {entries.slice(0, 6).map((e) => (
              <div
                key={e.id}
                className="bg-hud-container-lowest p-3.5 rounded-xl shadow-sm border border-hud-outline-variant/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-hud-container-low flex items-center justify-center text-hud-primary">
                    <MaterialIcon name="scale" className="text-[20px]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-hud-on">{e.weight_kg ?? '—'} kg</p>
                    <p className="text-xs text-hud-on-variant">
                      {formatDate(e.recorded_at)}
                      {heightCm != null && e.weight_kg != null
                        ? (() => {
                            const v = bmi(e.weight_kg, heightCm)
                            return v != null ? ` · BMI ${v.toFixed(1)}` : ''
                          })()
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {entries.length === 0 ? (
              <EmptyState title="No body logs" hint="Log weight from Body overview." />
            ) : null}
          </div>
        </section>

        <Link
          to="/body"
          className="w-full h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-display text-sm shadow-lg"
        >
          <MaterialIcon name="add_circle" className="text-[20px] text-emerald-300" />
          Log weight & measurements
        </Link>
      </HudSubpageShell>
    </>
  )
}
