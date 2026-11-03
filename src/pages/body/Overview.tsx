import { useState, type FormEvent } from 'react'
import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import BodySilhouette from '@/components/ui/BodySilhouette'
import { FieldLabel, PrimaryButton, TextField } from '@/components/ui/FieldInput'
import LoadingState from '@/components/ui/LoadingState'
import Modal from '@/components/ui/Modal'
import LogRow from '@/components/ui/LogRow'
import Panel from '@/components/ui/Panel'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import {
  bmi,
  bmiCategory,
  bmiTargetProgress,
  latestMetric,
  weightChange7d,
  weightForBmi
} from '@/lib/body-metrics'

function StatTile({
  label,
  value,
  unit,
  accent
}: {
  label: string
  value: string | number | null
  unit?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-line/80 bg-basalt/60 px-4 py-3 shadow-md shadow-black/20">
      <p className="text-fog text-[10px] font-medium uppercase tracking-widest mb-1">{label}</p>
      <p className="font-display text-xl font-bold tabular-nums" style={accent ? { color: accent } : undefined}>
        {value ?? '—'}
        {value != null && unit ? <span className="text-fog text-sm font-normal ml-1">{unit}</span> : null}
      </p>
    </div>
  )
}

export default function BodyOverview() {
  const { data, loading, error, reload } = useAsyncData(() => api.body.list())
  const { data: profile, reload: reloadProfile } = useAsyncData(() => api.profile.get())
  const [modalOpen, setModalOpen] = useState(false)
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [waist, setWaist] = useState('')
  const [saving, setSaving] = useState(false)

  const entries = data?.entries ?? []
  const heightCm = profile?.height_cm ?? null
  const latestWeight = latestMetric(entries, 'weight_kg') ?? profile?.weight_kg ?? null
  const bmiValue =
    latestWeight != null && heightCm != null && heightCm > 0 ? bmi(latestWeight, heightCm) : null
  const change7d = weightChange7d(entries)
  const cat = bmiValue != null ? bmiCategory(bmiValue) : null
  const targetWeight = heightCm ? weightForBmi(22, heightCm) : null
  const progress = bmiValue != null ? bmiTargetProgress(bmiValue) : null

  function openModal() {
    setWeight(latestWeight != null ? String(latestWeight) : '')
    setHeight(heightCm != null ? String(heightCm) : '')
    setWaist('')
    setModalOpen(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!weight && !waist && !height) return
    setSaving(true)
    try {
      if (height) {
        await api.profile.update({ height_cm: Number(height) })
        await reloadProfile()
      }
      if (weight) {
        await api.body.create({ weight_kg: Number(weight), waist_cm: waist ? Number(waist) : undefined })
        await api.profile.update({ weight_kg: Number(weight) })
        await reloadProfile()
      } else if (waist) {
        await api.body.create({ waist_cm: Number(waist) })
      }
      setModalOpen(false)
      await reload()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <>
      <PageHeader
        title="Overview"
        action={
          <button
            type="button"
            onClick={openModal}
            className="rounded-lg bg-primary text-basalt text-sm font-semibold px-4 py-2 hover:brightness-110 transition-all"
          >
            + Log metrics
          </button>
        }
      />

      <PageShell>
        {error ? <div className="text-alert text-sm">{error}</div> : null}

        {!heightCm ? (
          <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm flex items-center justify-between gap-3">
            <p className="text-primary">Add your height to unlock BMI tracking.</p>
            <button type="button" onClick={openModal} className="text-sm font-semibold underline shrink-0">
              Set height
            </button>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-[220px_1fr] gap-4 items-start">
          <Panel title="Body scan" variant="raised">
            {bmiValue != null && heightCm && latestWeight != null ? (
              <BodySilhouette bmiValue={bmiValue} weightKg={latestWeight} heightCm={heightCm} />
            ) : (
              <div className="py-10 text-center text-fog text-sm">Log weight & height to see your profile.</div>
            )}
          </Panel>

          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Weight" value={latestWeight} unit="kg" accent="#4ade80" />
              <StatTile label="Height" value={heightCm} unit="cm" />
              <StatTile label="BMI" value={bmiValue} accent={cat?.color} />
              <StatTile label="Target" value={targetWeight} unit="kg" accent="#22D3EE" />
            </div>

            {progress && cat ? (
              <div className="rounded-xl border border-line/80 bg-basalt2 px-4 py-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-fog">Progress to healthy BMI</span>
                  <span style={{ color: cat.color }} className="font-semibold tabular-nums">
                    {progress.pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-line/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progress.pct}%`, background: cat.color }}
                  />
                </div>
                {change7d != null ? (
                  <p className="text-fog text-xs mt-2">
                    7-day change:{' '}
                    <span className={change7d <= 0 ? 'text-cyan font-medium' : 'text-accent font-medium'}>
                      {change7d > 0 ? '+' : ''}
                      {change7d} kg
                    </span>
                  </p>
                ) : null}
              </div>
            ) : null}

            <Panel title="Current metrics">
              <LogRow
                items={[
                  { label: 'Weight', value: latestWeight, unit: 'kg' },
                  { label: 'Height', value: heightCm, unit: 'cm' },
                  {
                    label: 'BMI',
                    value: bmiValue,
                    status: cat?.label === 'Healthy' ? 'good' : cat ? 'attention' : 'neutral'
                  },
                  { label: 'Target weight', value: targetWeight, unit: 'kg' }
                ]}
              />
            </Panel>
          </div>
        </div>
      </PageShell>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log body metrics">
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-fog text-sm">BMI = weight (kg) ÷ height (m)²</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <FieldLabel>Weight (kg)</FieldLabel>
              <TextField type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} autoFocus />
            </div>
            <div>
              <FieldLabel>Height (cm)</FieldLabel>
              <TextField type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Waist (cm)</FieldLabel>
              <TextField type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <PrimaryButton type="submit" loading={saving} className="flex-1">
              Save
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-line text-fog text-sm px-4 py-2.5 hover:text-bone"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
