import { useMemo, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { HudIntroBlock, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import ExerciseCard, { ExerciseDetailModal } from '@/components/workouts/ExerciseCard'
import { TextField } from '@/components/ui/FieldInput'
import { EXERCISES, isNoEquipment, type Exercise } from '@/data/exercises'

function muscleMatch(muscle: string, filter: string) {
  const m = muscle.toLowerCase()
  if (filter === 'Chest') return m.includes('chest')
  if (filter === 'Back') return m.includes('back') || m.includes('lat')
  if (filter === 'Legs') return m.includes('quad') || m.includes('glute') || m.includes('hamstring') || m.includes('leg')
  if (filter === 'Core') return m.includes('core')
  if (filter === 'Arms') return m.includes('bicep') || m.includes('tricep') || m.includes('arm')
  return true
}

const MUSCLE_FILTERS = [
  { id: 'all', label: 'All', count: EXERCISES.length },
  { id: 'Chest', label: 'Chest', count: EXERCISES.filter((e) => muscleMatch(e.muscle, 'Chest')).length },
  { id: 'Back', label: 'Back', count: EXERCISES.filter((e) => muscleMatch(e.muscle, 'Back')).length },
  { id: 'Legs', label: 'Legs', count: EXERCISES.filter((e) => muscleMatch(e.muscle, 'Legs')).length },
  { id: 'Core', label: 'Core', count: EXERCISES.filter((e) => muscleMatch(e.muscle, 'Core')).length },
  { id: 'Arms', label: 'Arms', count: EXERCISES.filter((e) => muscleMatch(e.muscle, 'Arms')).length }
] as const

export default function WorkoutLibrary() {
  const [libraryFilter, setLibraryFilter] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<(typeof MUSCLE_FILTERS)[number]['id']>('all')
  const [noEquipOnly, setNoEquipOnly] = useState(false)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)

  const filteredExercises = useMemo(() => {
    const q = libraryFilter.toLowerCase()
    return EXERCISES.filter((e) => {
      if (noEquipOnly && !isNoEquipment(e)) return false
      if (muscleFilter !== 'all' && !muscleMatch(e.muscle, muscleFilter)) return false
      return (
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.muscle.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q)
      )
    })
  }, [libraryFilter, muscleFilter, noEquipOnly])

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Exercise library" />
      </div>
      <HudSubpageShell className="gap-4 pb-12">
        <HudIntroBlock
          eyebrow="Train studio"
          title="Exercise library"
          description="120+ movements with form cues and tempo guides."
        />

        <div className="relative">
          <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-hud-on-variant text-[18px]" />
          <TextField
            placeholder="Search exercises, muscles, equipment…"
            value={libraryFilter}
            onChange={(e) => setLibraryFilter(e.target.value)}
            className="pl-10 rounded-2xl bg-hud-container-lowest border-hud-outline-variant/40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {MUSCLE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setMuscleFilter(f.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-display font-semibold shadow-sm flex items-center gap-1.5 ${
                muscleFilter === f.id ? 'bg-hud-primary text-white' : 'bg-hud-container-lowest text-hud-on border border-hud-outline-variant/40'
              }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${muscleFilter === f.id ? 'bg-white/20' : 'bg-hud-container-high'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setNoEquipOnly((v) => !v)}
          className={`self-start text-xs font-display font-semibold px-3 py-1 rounded-full border ${
            noEquipOnly ? 'border-hud-primary text-hud-primary bg-hud-primary/10' : 'border-hud-outline-variant/50 text-hud-on-variant'
          }`}
        >
          No equipment only
        </button>

        <div className="grid gap-4">
          {filteredExercises.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} onSelect={() => setDetailExercise(ex)} />
          ))}
        </div>
      </HudSubpageShell>

      {detailExercise ? (
        <ExerciseDetailModal exercise={detailExercise} onClose={() => setDetailExercise(null)} />
      ) : null}
    </>
  )
}
