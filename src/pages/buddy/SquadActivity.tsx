import PageHeader from '@/components/PageHeader'
import { HudIntroBlock, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import { SquadActivityRow } from '@/components/squads/SquadActivityFeed'
import LoadingState from '@/components/ui/LoadingState'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'

export default function SquadActivityPage() {
  const { data, loading, error } = useAsyncData(() => api.squads.activity(100, 0))

  if (loading) return <LoadingState />

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Squad activity" />
      </div>
      <HudSubpageShell className="gap-4">
        <HudIntroBlock
          eyebrow="Squad feed"
          title="Activity log"
          description="Workouts and outdoor routes logged by everyone in your squad."
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {data && data.total > 0 ? (
          <p className="text-xs text-hud-on-variant font-display -mt-2">
            {data.total} {data.total === 1 ? 'entry' : 'entries'} in the last 60 days
          </p>
        ) : null}
        <ul className="flex flex-col gap-2 pb-8">
          {(data?.items ?? []).map((item) => (
            <SquadActivityRow key={item.id} item={item} />
          ))}
        </ul>
        {data && data.items.length === 0 ? (
          <p className="text-sm text-hud-on-variant">Join or create a squad on the Buddy screen to see shared activity.</p>
        ) : null}
      </HudSubpageShell>
    </>
  )
}
