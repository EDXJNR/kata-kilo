import { useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import Panel from '@/components/ui/Panel'
import Modal from '@/components/ui/Modal'
import { MEAL_PLANS, type MealPlan } from '@/data/meal-plans'
import { Link } from 'react-router-dom'

const FILTERS = [
  { id: 'all', label: 'All plans' },
  { id: 'keto', label: 'Keto' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'low-fat', label: 'Low-fat' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'high-protein', label: 'High protein' }
] as const

export default function MealPlansPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [selected, setSelected] = useState<MealPlan | null>(null)

  const plans = useMemo(
    () => (filter === 'all' ? MEAL_PLANS : MEAL_PLANS.filter((p) => p.category === filter)),
    [filter]
  )

  return (
    <>
      <PageHeader
        title="Meal plans"
        action={
          <Link
            to="/meals/scan"
            className="rounded-xl bg-primary text-basalt text-sm font-semibold px-4 py-2.5 min-h-[44px] inline-flex items-center"
          >
            AI calorie scan
          </Link>
        }
      />
      <PageShell>
        <p className="text-fog text-sm leading-relaxed mb-4">
          Healthy prep ideas with photos — pick a plan and cook. No manual food logging required.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                filter === f.id ? 'border-primary text-primary bg-primary/10' : 'border-line text-fog'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan)}
              className="rounded-2xl overflow-hidden border border-line/60 bg-basalt2 text-left shadow-lg shadow-black/20 hover:border-primary/40 transition-colors"
            >
              <div className="aspect-[4/3] bg-basalt overflow-hidden">
                <img src={plan.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <h3 className="text-bone font-display font-semibold text-lg">{plan.name}</h3>
                <p className="text-fog text-sm mt-1">{plan.tagline}</p>
                <p className="text-xs text-primary mt-2 tabular-nums">
                  {plan.calories} kcal · {plan.proteinG}g protein · {plan.prepMin} min
                </p>
              </div>
            </button>
          ))}
        </div>

        <Panel title="Tip" variant="quiet" className="mt-6">
          <p className="text-sm text-fog">
            Use <strong className="text-bone font-medium">AI calorie scan</strong> to estimate calories from a photo of
            your plate (camera on your phone works best).
          </p>
        </Panel>
      </PageShell>

      <Modal open={selected != null} onClose={() => setSelected(null)} title={selected?.name ?? ''} wide>
        {selected ? (
          <div className="space-y-4">
            <img src={selected.imageUrl} alt="" className="w-full rounded-2xl aspect-video object-cover" />
            <p className="text-fog text-sm">{selected.tagline}</p>
            <div>
              <h4 className="text-xs uppercase tracking-wide text-fog mb-2">Ingredients</h4>
              <ul className="text-sm text-bone list-disc pl-5 space-y-1">
                {selected.ingredients.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wide text-fog mb-2">Steps</h4>
              <ol className="text-sm text-bone list-decimal pl-5 space-y-2">
                {selected.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
