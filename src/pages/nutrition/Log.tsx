import { useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import { FieldLabel, PrimaryButton, TextField } from '@/components/ui/FieldInput'
import Modal from '@/components/ui/Modal'
import Panel from '@/components/ui/Panel'
import {
  FOOD_CATEGORIES,
  FOOD_CATEGORY_COLORS,
  macrosForFood,
  searchFoods,
  suggestLowerCalorieAlternative,
  type FoodItem
} from '@/data/food-database'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'

export default function NutritionLog() {
  const { reload } = useAsyncData(() => api.nutrition.list())
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [servings, setServings] = useState('1')
  const [water, setWater] = useState('')
  const [saving, setSaving] = useState(false)

  const foods = useMemo(() => searchFoods(search, category ?? undefined), [search, category])
  const preview = selected ? macrosForFood(selected, Number(servings) || 1) : null
  const alternative = selected ? suggestLowerCalorieAlternative(selected) : null

  async function handleLogFood() {
    if (!selected) return
    setSaving(true)
    const s = Number(servings) || 1
    const macros = macrosForFood(selected, s)
    try {
      await api.nutrition.create({
        meal: `${selected.name} × ${s} (${selected.servingLabel})`,
        calories: macros.calories,
        protein_g: macros.protein_g,
        carbs_g: macros.carbs_g,
        fat_g: macros.fat_g,
        water_ml: water ? Number(water) : undefined
      })
      setSelected(null)
      await reload()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Log food" />
      <PageShell>
        <Panel title="Food database" variant="raised">
          <div className="space-y-3">
            <TextField placeholder="Search foods…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategory(null)}
                className={`rounded-lg px-3 py-1 text-xs font-medium border ${
                  !category ? 'border-primary text-primary bg-primary/10' : 'border-line text-fog'
                }`}
              >
                All
              </button>
              {FOOD_CATEGORIES.map((cat) => {
                const c = FOOD_CATEGORY_COLORS[cat] ?? FOOD_CATEGORY_COLORS.Protein
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(category === cat ? null : cat)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium border ${
                      category === cat ? `${c.border} ${c.bg} ${c.text}` : 'border-line text-fog'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {foods.map((food) => {
                const m = macrosForFood(food, 1)
                const c = FOOD_CATEGORY_COLORS[food.category] ?? FOOD_CATEGORY_COLORS.Protein
                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => {
                      setSelected(food)
                      setServings('1')
                      setWater('')
                    }}
                    className={`text-left rounded-xl border p-3 transition-all hover:scale-[1.01] ${c.border} ${c.bg}`}
                  >
                    <p className={`text-sm font-semibold leading-tight ${c.text}`}>{food.name}</p>
                    <p className="text-fog text-[10px] mt-0.5">{food.servingLabel}</p>
                    <p className="font-display text-sm font-bold tabular-nums mt-1" style={{ color: c.dot }}>
                      {m.calories} kcal
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </Panel>
      </PageShell>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? 'Log food'} wide>
        {selected && preview ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Servings</FieldLabel>
                <TextField type="number" step="0.5" min="0.5" value={servings} onChange={(e) => setServings(e.target.value)} autoFocus />
              </div>
              <div>
                <FieldLabel>Water (ml)</FieldLabel>
                <TextField type="number" value={water} onChange={(e) => setWater(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Protein', value: `${preview.protein_g}g`, color: '#4ade80' },
                { label: 'Carbs', value: `${preview.carbs_g}g`, color: '#22D3EE' },
                { label: 'Fat', value: `${preview.fat_g}g`, color: '#F472B6' },
                { label: 'Calories', value: `${preview.calories}`, color: '#FF6B6B' }
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-line/60 p-3 text-center">
                  <p className="text-fog text-[10px]">{m.label}</p>
                  <p className="font-display text-lg font-bold tabular-nums" style={{ color: m.color }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
            {alternative ? (
              <p className="text-fog text-sm">
                Lighter swap:{' '}
                <button type="button" onClick={() => setSelected(alternative)} className="text-primary underline">
                  {alternative.name}
                </button>
              </p>
            ) : null}
            <PrimaryButton loading={saving} onClick={handleLogFood} className="w-full">
              Log food
            </PrimaryButton>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
