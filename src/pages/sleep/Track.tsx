import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import { PrimaryButton } from '@/components/ui/FieldInput'
import Panel from '@/components/ui/Panel'
import { useSleepTracker } from '@/hooks/useSleepTracker'
import { api } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'

function formatElapsed(h: number) {
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return `${hrs}h ${mins}m`
}

export default function SleepTrack() {
  const { reload } = useAsyncData(() => api.sleep.list())
  const tracker = useSleepTracker(reload)

  return (
    <>
      <PageHeader title="Track sleep" />
      <PageShell>
        <Panel title={tracker.isTracking ? 'Sleeping now' : 'Tonight'} variant="raised">
          {tracker.isTracking && tracker.session ? (
            <div className="space-y-4 max-w-md">
              <div className="rounded-xl bg-cyan/10 border border-cyan/30 p-6 text-center">
                <p className="text-fog text-xs font-medium mb-2">Elapsed</p>
                <p className="text-4xl font-display font-bold tabular-nums">{formatElapsed(tracker.elapsedH)}</p>
                <p className="text-fog text-xs mt-2">
                  Started {new Date(tracker.session.startedAt).toLocaleTimeString()}
                </p>
              </div>
              {tracker.error ? <p className="text-alert text-xs">{tracker.error}</p> : null}
              <div className="flex flex-wrap gap-2">
                <PrimaryButton onClick={tracker.finishTracking} loading={tracker.saving}>
                  Wake up & save
                </PrimaryButton>
                <button
                  type="button"
                  onClick={tracker.cancelTracking}
                  className="rounded-lg border border-line text-fog text-sm px-4 py-2.5 hover:text-bone"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-md">
              <p className="text-fog text-sm">
                Tap when you go to bed. When you wake up, tap again — duration saves automatically.
              </p>
              <PrimaryButton onClick={tracker.startTracking}>Start sleep tracking</PrimaryButton>
            </div>
          )}
        </Panel>
      </PageShell>
    </>
  )
}
