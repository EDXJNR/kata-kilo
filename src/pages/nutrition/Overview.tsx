import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import LoadingState from '@/components/ui/LoadingState'
import MacroRingCard from '@/components/ui/MacroRingCard'
import MacroBar from '@/components/ui/MacroBar'
import Panel from '@/components/ui/Panel'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'

export default function NutritionOverview() {
  const { data, loading, error } = useAsyncData(() => api.nutrition.list())

  const totals = data?.totals ?? { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, water_ml: 0 }
  const goals = { calories: 2500, protein_g: 180, carbs_g: 250, fat_g: 90, water_ml: 2500 }
  const overGoal = totals.calories > goals.calories

  if (loading) return <LoadingState />

  return (
    <>
      <PageHeader
        title="Overview"
        action={
          <div
            className={`rounded-full px-4 py-1.5 text-sm font-semibold tabular-nums border ${
              overGoal ? 'border-accent/50 bg-accent/10 text-accent' : 'border-primary/50 bg-primary/10 text-primary'
            }`}
          >
            {totals.calories} / {goals.calories} kcal
          </div>
        }
      />
      <PageShell>
        {error ? <div className="text-alert text-sm">{error}</div> : null}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MacroRingCard label="Calories" value={totals.calories} max={goals.calories} unit="kcal" accent="coral" />
          <MacroRingCard label="Protein" value={totals.protein_g} max={goals.protein_g} unit="g" accent="gold" />
          <MacroRingCard label="Carbs" value={totals.carbs_g} max={goals.carbs_g} unit="g" accent="cyan" />
          <MacroRingCard label="Fat" value={totals.fat_g} max={goals.fat_g} unit="g" accent="pink" />
        </div>

        <Panel title="Macro breakdown" variant="raised">
          <div className="space-y-4 max-w-xl">
            <MacroBar label="Calories" value={totals.calories} unit=" kcal" max={goals.calories} accent="accent" />
            <MacroBar label="Protein" value={totals.protein_g} unit=" g" max={goals.protein_g} accent="primary" />
            <MacroBar label="Carbs" value={totals.carbs_g} unit=" g" max={goals.carbs_g} accent="cyan" />
            <MacroBar label="Fat" value={totals.fat_g} unit=" g" max={goals.fat_g} accent="pink" />
            <MacroBar label="Water" value={totals.water_ml} unit=" ml" max={goals.water_ml} accent="cyan" />
          </div>
          <p className="text-fog text-xs mt-3">Calories = (protein × 4) + (carbs × 4) + (fat × 9)</p>
        </Panel>
      </PageShell>
    </>
  )
}
