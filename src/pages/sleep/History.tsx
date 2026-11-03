import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import TrendChart from '@/components/TrendChart'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/components/ui/FieldInput'
import LoadingState from '@/components/ui/LoadingState'
import LogRow from '@/components/ui/LogRow'
import Panel from '@/components/ui/Panel'
import SleepStageBar from '@/components/ui/SleepStageBar'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import type { SleepEntry } from '@/types/field-log'

function SleepHistoryCard({ entry }: { entry: SleepEntry }) {
  const tracked = entry.source === 'tracked' && entry.started_at && entry.ended_at
  return (
    <div className="rounded-lg border border-line bg-basalt/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-bone text-sm font-semibold">{entry.duration_h} hours</p>
          <p className="text-fog text-xs">{formatDate(entry.recorded_at)}</p>
        </div>
        <span className="text-[10px] font-medium uppercase text-fog">{entry.source === 'tracked' ? 'tracked' : 'manual'}</span>
      </div>
      {tracked ? (
        <SleepStageBar startedAt={entry.started_at!} endedAt={entry.ended_at!} durationH={entry.duration_h} />
      ) : null}
    </div>
  )
}

export default function SleepHistory() {
  const { data, loading, error } = useAsyncData(() => api.sleep.list())
  const { data: profile } = useAsyncData(() => api.profile.get())

  const entries = data?.entries ?? []
  const trend = data?.trend ?? []
  const avg =
    entries.length > 0
      ? Math.round((entries.reduce((s, e) => s + e.duration_h, 0) / entries.length) * 10) / 10
      : null
  const lastNight = entries[0]
  const trainingDays = profile?.training_days?.length ?? 3
  const sleepGoal = Math.min(9, Math.round((7 + trainingDays * 0.15) * 10) / 10)

  if (loading) return <LoadingState />

  return (
    <>
      <PageHeader title="History" />
      <PageShell>
        {error ? <div className="text-alert text-sm">{error}</div> : null}

        <Panel title="Summary">
          <LogRow
            items={[
              { label: 'Sessions', value: entries.length },
              { label: 'Average', value: avg, unit: 'h' },
              {
                label: 'Last night',
                value: lastNight?.duration_h ?? null,
                unit: 'h',
                status:
                  lastNight?.duration_h != null
                    ? lastNight.duration_h >= sleepGoal
                      ? 'good'
                      : 'attention'
                    : 'neutral'
              },
              { label: `Goal (${trainingDays}d/wk)`, value: sleepGoal, unit: 'h' }
            ]}
          />
        </Panel>

        <div className="grid lg:grid-cols-2 gap-4">
          <Panel title="Duration — 7 days" variant="raised">
            <TrendChart data={trend} accent="cyan" unit="h" height={160} />
          </Panel>
          {lastNight?.started_at && lastNight?.ended_at ? (
            <Panel title="Last night" variant="raised">
              <SleepStageBar startedAt={lastNight.started_at} endedAt={lastNight.ended_at} durationH={lastNight.duration_h} />
            </Panel>
          ) : null}
        </div>

        <Panel title="All sessions">
          {entries.length === 0 ? (
            <EmptyState title="No sleep tracked yet" hint="Start tracking from the Track page." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {entries.map((e) => (
                <SleepHistoryCard key={e.id} entry={e} />
              ))}
            </div>
          )}
        </Panel>
      </PageShell>
    </>
  )
}
