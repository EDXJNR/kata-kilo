import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { HudIntroBlock, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import TrendChart from '@/components/TrendChart'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/components/ui/FieldInput'
import LoadingState from '@/components/ui/LoadingState'
import { getExercise } from '@/data/exercises'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'

export default function WorkoutProgress() {
  const { data, loading, error } = useAsyncData(() => api.workouts.list())

  if (loading) return <LoadingState />

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Workout history" />
      </div>
      <HudSubpageShell className="gap-5">
        <HudIntroBlock
          eyebrow="Benchmark data"
          title="Workout history"
          description="Volume trends, strength curve, and personal records."
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {data ? (
          <>
            <section className="bg-hud-container-lowest rounded-xl p-4 shadow-sm border border-hud-outline-variant/30">
              <h3 className="font-display font-semibold text-hud-on text-sm mb-2">Volume over time</h3>
              <TrendChart data={data.volumeTrend} accent="cyan" unit="kg" height={140} />
            </section>
            <section className="bg-hud-container-lowest rounded-xl p-4 shadow-sm border border-hud-outline-variant/30">
              <h3 className="font-display font-semibold text-hud-on text-sm mb-2">Strength over time</h3>
              <TrendChart data={data.strengthTrend} accent="primary" unit="kg" height={140} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-hud-on">Personal records</h3>
              </div>
              {data.prs.length === 0 ? (
                <EmptyState title="No PRs yet" hint="Log sets with weight during training." />
              ) : (
                <div className="bg-hud-container-lowest rounded-xl shadow-sm overflow-hidden border border-hud-outline-variant/20">
                  {data.prs.map((pr, idx) => {
                    const name = getExercise(pr.exerciseId)?.name ?? pr.exerciseName
                    return (
                      <div key={pr.exerciseId}>
                        {idx > 0 ? <div className="h-px bg-hud-container-high mx-3" /> : null}
                        <div className="flex items-center justify-between p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-hud-container-high flex items-center justify-center text-hud-primary">
                              <MaterialIcon name={idx === 0 ? 'star' : 'fitness_center'} className="text-[18px]" filled={idx === 0} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-hud-on">{name}</p>
                              <p className="text-[11px] text-hud-on-variant">
                                {pr.reps} reps • {formatDate(pr.date)}
                              </p>
                            </div>
                          </div>
                          <p className="font-display font-bold text-hud-on tabular-nums">
                            {pr.weightKg} <span className="text-xs font-normal text-hud-on-variant">kg</span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section>
              <h3 className="font-display font-semibold text-hud-on mb-2">Recent sessions</h3>
              {data.entries.length === 0 ? (
                <EmptyState title="No sessions logged" />
              ) : (
                <div className="flex flex-col gap-2">
                  {data.entries.slice(0, 8).map((e) => (
                    <div
                      key={e.id}
                      className="bg-hud-container-lowest rounded-xl p-3.5 border border-hud-outline-variant/20 flex justify-between gap-2 text-sm"
                    >
                      <span className="font-semibold text-hud-on">{e.name}</span>
                      <span className="text-hud-on-variant tabular-nums text-xs text-right">
                        {e.duration_min ?? '—'} min · {e.volume_kg ?? 0} kg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </HudSubpageShell>
    </>
  )
}
