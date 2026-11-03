import type { Exercise } from '@/data/exercises'
import { isNoEquipment, resolveExerciseVideoId } from '@/data/exercises'
import ExerciseVideo, { DifficultyBadge, MuscleTag } from '@/components/workouts/ExerciseVideo'
import Panel from '@/components/ui/Panel'

export default function ExerciseCard({
  exercise,
  onSelect,
  compact = false
}: {
  exercise: Exercise
  onSelect?: () => void
  compact?: boolean
}) {
  return (
    <article
      className={`rounded-lg border border-line bg-basalt2 overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/5 ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
      onKeyDown={onSelect ? (e) => e.key === 'Enter' && onSelect() : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {!compact ? <ExerciseVideo videoId={resolveExerciseVideoId(exercise)} title={exercise.name} /> : null}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-bone text-sm font-semibold font-display">{exercise.name}</h3>
          <div className="flex gap-1 shrink-0">
            {isNoEquipment(exercise) ? (
              <MuscleTag label="No equipment" color="#f472b6" />
            ) : null}
            <DifficultyBadge level={exercise.difficulty} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <MuscleTag label={exercise.muscle} color="#7c5cff" />
          <MuscleTag label={exercise.equipment} color="#22d3ee" />
        </div>
        {!compact ? (
          <>
            <div>
              <p className="text-fog text-[10px] font-mono uppercase tracking-widest mb-1">Instructions</p>
              <ol className="text-fog text-xs space-y-1 list-decimal list-inside">
                {exercise.instructions.slice(0, 2).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-accent text-[10px] font-mono uppercase tracking-widest mb-1">Avoid</p>
              <p className="text-fog text-xs">{exercise.mistakes.join(' · ')}</p>
            </div>
          </>
        ) : null}
      </div>
    </article>
  )
}

export function ExerciseDetailModal({
  exercise,
  onClose,
  onAdd
}: {
  exercise: Exercise
  onClose: () => void
  onAdd?: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Panel className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-bone text-lg font-display font-semibold">{exercise.name}</h2>
            <div className="flex gap-2 mt-2">
              <DifficultyBadge level={exercise.difficulty} />
              <MuscleTag label={exercise.muscle} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-fog hover:text-bone text-xl leading-none">
            ×
          </button>
        </div>
        <ExerciseVideo videoId={resolveExerciseVideoId(exercise)} title={exercise.name} />
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-primary text-[10px] font-mono uppercase tracking-widest mb-2">How to</p>
            <ol className="text-fog text-sm space-y-2 list-decimal list-inside">
              {exercise.instructions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-accent text-[10px] font-mono uppercase tracking-widest mb-2">Common mistakes</p>
            <ul className="text-fog text-sm space-y-2 list-disc list-inside">
              {exercise.mistakes.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 w-full rounded-md bg-primary text-white text-sm font-semibold py-2.5"
          >
            Add to workout
          </button>
        ) : null}
      </Panel>
    </div>
  )
}
