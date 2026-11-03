import { useEffect, useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import Panel from '@/components/ui/Panel'
import Modal from '@/components/ui/Modal'
import LoadingState from '@/components/ui/LoadingState'
import EmptyState from '@/components/ui/EmptyState'
import { FieldLabel, PrimaryButton, TextField } from '@/components/ui/FieldInput'
import { useWorkoutSession } from '@/context/WorkoutSessionContext'
import { useSavedPlans, invalidateSavedPlansCache } from '@/hooks/useSavedPlans'
import { EXERCISES } from '@/data/exercises'
import { PLAN_CATEGORIES, WORKOUT_PLANS, type PlanCategory } from '@/data/workout-plans'
import { api } from '@/lib/api'
import type { SavedPlanExercise } from '@/types/field-log'

type DraftExercise = SavedPlanExercise

function emptyExercise(): DraftExercise {
  return { exerciseId: 'push-up', sets: 3, reps: '10', restSec: 60 }
}

export default function WorkoutPlans() {
  const { startPlan } = useWorkoutSession()
  const { plans: savedPlans, loading, reload } = useSavedPlans()
  const [planFilter, setPlanFilter] = useState<PlanCategory | 'all' | 'my' | 'discover'>('my')
  const [discoverPlans, setDiscoverPlans] = useState<Awaited<ReturnType<typeof api.plans.discover>>['plans']>([])
  const [discoverQ, setDiscoverQ] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [durationMin, setDurationMin] = useState(45)
  const [exercises, setExercises] = useState<DraftExercise[]>([emptyExercise(), emptyExercise()])

  const filteredBuiltin = useMemo(
    () => WORKOUT_PLANS.filter((p) => planFilter === 'all' || planFilter === 'my' ? false : p.category === planFilter),
    [planFilter]
  )

  const showBuiltin = planFilter !== 'my' && planFilter !== 'discover'
  const showMy = planFilter === 'my' || planFilter === 'all'
  const showDiscover = planFilter === 'discover'

  useEffect(() => {
    if (!showDiscover) return
    void api.plans.discover(discoverQ || undefined).then((r) => setDiscoverPlans(r.plans)).catch(() => setDiscoverPlans([]))
  }, [showDiscover, discoverQ])

  async function togglePublish(planId: string, isPublic: boolean) {
    await api.plans.publish(planId, isPublic)
    invalidateSavedPlansCache()
    await reload()
  }

  async function importDiscover(plan: (typeof discoverPlans)[0]) {
    await api.plans.importShared({
      name: plan.name,
      description: plan.description,
      category: plan.category,
      durationMin: plan.durationMin,
      color: plan.color,
      exercises: plan.exercises
    })
    invalidateSavedPlansCache()
    await reload()
    setPlanFilter('my')
  }

  async function saveNewPlan() {
    if (!name.trim() || exercises.length === 0) return
    setSaving(true)
    try {
      await api.plans.create({
        name: name.trim(),
        description: description.trim() || undefined,
        durationMin,
        exercises
      })
      invalidateSavedPlansCache()
      await reload()
      setEditorOpen(false)
      setName('')
      setDescription('')
      setExercises([emptyExercise(), emptyExercise()])
      setPlanFilter('my')
    } finally {
      setSaving(false)
    }
  }

  async function deletePlan(id: string) {
    if (!confirm('Delete this plan?')) return
    await api.plans.delete(id)
    invalidateSavedPlansCache()
    await reload()
  }

  if (loading) return <LoadingState />

  return (
    <>
      <PageHeader
        title="Plans"
        action={
          <PrimaryButton onClick={() => setEditorOpen(true)}>Create plan</PrimaryButton>
        }
      />
      <PageShell>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPlanFilter('my')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
              planFilter === 'my' ? 'border-primary text-primary bg-primary/10' : 'border-line text-fog'
            }`}
          >
            My plans ({savedPlans.length})
          </button>
          <button
            type="button"
            onClick={() => setPlanFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
              planFilter === 'all' ? 'border-primary text-primary bg-primary/10' : 'border-line text-fog'
            }`}
          >
            All built-in
          </button>
          <button
            type="button"
            onClick={() => setPlanFilter('discover')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
              planFilter === 'discover' ? 'border-primary text-primary bg-primary/10' : 'border-line text-fog'
            }`}
          >
            Discover
          </button>
          {PLAN_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setPlanFilter(c.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                planFilter === c.id ? '' : 'border-line text-fog opacity-70'
              }`}
              style={planFilter === c.id ? { borderColor: c.color, color: c.color, background: `${c.color}12` } : undefined}
            >
              {c.label}
            </button>
          ))}
        </div>

        {showMy ? (
          <Panel variant="quiet" title="My saved plans">
            {savedPlans.length === 0 ? (
              <EmptyState title="No saved plans yet" hint="Create a plan to use it in your weekly planner." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {savedPlans.map((plan) => (
                  <Panel key={plan.id} variant="raised">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-bone font-display font-semibold">{plan.name}</h3>
                      <span className="text-xs font-medium tabular-nums text-primary">{plan.durationMin} min</span>
                    </div>
                    {plan.description ? <p className="text-fog text-sm mb-2">{plan.description}</p> : null}
                    <p className="text-fog text-xs mb-3">{plan.exercises.length} exercises · Custom</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startPlan(plan.id)}
                        className="flex-1 min-h-[44px] rounded-lg bg-primary text-obsidian text-sm font-semibold"
                      >
                        Start
                      </button>
                      <button
                        type="button"
                        onClick={() => void togglePublish(plan.id, !plan.isPublic)}
                        className="min-h-[44px] px-3 rounded-lg border border-line text-fog text-xs hover:text-primary"
                      >
                        {plan.isPublic ? 'Unpublish' : 'Share publicly'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deletePlan(plan.id)}
                        className="min-h-[44px] px-3 rounded-lg border border-line text-fog text-sm hover:text-alert"
                      >
                        Delete
                      </button>
                    </div>
                  </Panel>
                ))}
              </div>
            )}
          </Panel>
        ) : null}

        {showDiscover ? (
          <Panel variant="quiet" title="Community plans">
            <TextField
              value={discoverQ}
              onChange={(e) => setDiscoverQ(e.target.value)}
              placeholder="Search public plans…"
              className="mb-3"
            />
            {discoverPlans.length === 0 ? (
              <EmptyState title="No public plans yet" hint="Publish one of your plans or check back later." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {discoverPlans.map((plan) => (
                  <Panel key={plan.id} variant="raised">
                    <h3 className="text-bone font-display font-semibold">{plan.name}</h3>
                    <p className="text-fog text-xs mt-1">by {plan.authorName ?? 'Athlete'}</p>
                    {plan.description ? <p className="text-fog text-sm mt-2">{plan.description}</p> : null}
                    <button
                      type="button"
                      onClick={() => void importDiscover(plan)}
                      className="mt-3 w-full min-h-[44px] rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10"
                    >
                      Add to my plans
                    </button>
                  </Panel>
                ))}
              </div>
            )}
          </Panel>
        ) : null}

        {showBuiltin ? (
          <Panel variant="quiet" title={planFilter === 'all' ? 'Built-in plans' : 'Plans'}>
            <div className="grid sm:grid-cols-2 gap-3">
              {(planFilter === 'all' ? WORKOUT_PLANS : filteredBuiltin).map((plan) => (
                <Panel key={plan.id} variant="raised">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-bone font-display font-semibold">{plan.name}</h3>
                    <span className="text-xs font-medium tabular-nums" style={{ color: plan.color }}>
                      {plan.durationMin} min
                    </span>
                  </div>
                  <p className="text-fog text-sm mb-2">{plan.description}</p>
                  <p className="text-fog text-xs mb-3">{plan.exercises.length} exercises</p>
                  <button
                    type="button"
                    onClick={() => startPlan(plan.id)}
                    className="w-full rounded-lg text-sm font-semibold py-2.5 text-basalt min-h-[44px]"
                    style={{ background: plan.color }}
                  >
                    Start plan
                  </button>
                </Panel>
              ))}
            </div>
          </Panel>
        ) : null}
      </PageShell>

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title="Create training plan" wide>
        <div className="space-y-4">
          <div>
            <FieldLabel>Plan name</FieldLabel>
            <TextField value={name} onChange={(e) => setName(e.target.value)} placeholder="Upper Body Strength" />
          </div>
          <div>
            <FieldLabel>Description (optional)</FieldLabel>
            <TextField value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Focus on chest and back" />
          </div>
          <div>
            <FieldLabel>Duration (minutes)</FieldLabel>
            <TextField type="number" min={5} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
          </div>
          <div>
            <FieldLabel>Exercises</FieldLabel>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {exercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center rounded-lg border border-line p-2">
                  <select
                    value={ex.exerciseId}
                    onChange={(e) => {
                      const next = [...exercises]
                      next[i] = { ...ex, exerciseId: e.target.value }
                      setExercises(next)
                    }}
                    className="rounded border border-line bg-basalt px-2 py-1.5 text-xs text-bone min-h-[40px]"
                  >
                    {EXERCISES.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={ex.sets}
                    onChange={(e) => {
                      const next = [...exercises]
                      next[i] = { ...ex, sets: Number(e.target.value) }
                      setExercises(next)
                    }}
                    className="w-14 rounded border border-line bg-basalt px-2 py-1 text-xs text-bone"
                    title="Sets"
                  />
                  <input
                    value={ex.reps}
                    onChange={(e) => {
                      const next = [...exercises]
                      next[i] = { ...ex, reps: e.target.value }
                      setExercises(next)
                    }}
                    className="w-16 rounded border border-line bg-basalt px-2 py-1 text-xs text-bone"
                    placeholder="reps"
                  />
                  <button
                    type="button"
                    onClick={() => setExercises(exercises.filter((_, j) => j !== i))}
                    className="text-fog hover:text-alert px-1 min-h-[40px]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setExercises([...exercises, emptyExercise()])}
              className="mt-2 text-primary text-sm font-medium hover:underline"
            >
              + Add exercise
            </button>
          </div>
          <PrimaryButton disabled={saving || !name.trim() || exercises.length === 0} loading={saving} onClick={() => void saveNewPlan()}>
            Save plan
          </PrimaryButton>
        </div>
      </Modal>
    </>
  )
}
