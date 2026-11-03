import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate } from '@/components/ui/FieldInput'
import LoadingState from '@/components/ui/LoadingState'
import Panel from '@/components/ui/Panel'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'

export default function NutritionMeals() {
  const { data, loading, error } = useAsyncData(() => api.nutrition.list())
  const entries = data?.entries ?? []

  if (loading) return <LoadingState />

  return (
    <>
      <PageHeader title="Today's meals" />
      <PageShell>
        {error ? <div className="text-alert text-sm">{error}</div> : null}

        <Panel title="Logged today" variant="raised">
          {entries.length === 0 ? (
            <EmptyState title="Nothing logged yet" hint="Add food from the Log food page." />
          ) : (
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="rounded-lg border border-line/60 bg-basalt/40 px-4 py-3">
                  <p className="text-sm font-medium">{e.meal}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {e.calories != null ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent">{e.calories} kcal</span>
                    ) : null}
                    {e.protein_g != null ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">{e.protein_g}g P</span>
                    ) : null}
                    {e.carbs_g != null ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan/15 text-cyan">{e.carbs_g}g C</span>
                    ) : null}
                    {e.fat_g != null ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink/15 text-pink">{e.fat_g}g F</span>
                    ) : null}
                  </div>
                  <p className="text-fog text-[10px] mt-1.5">{formatDate(e.recorded_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </PageShell>
    </>
  )
}
