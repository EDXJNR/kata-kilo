import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { HudIntroBlock, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import { useWorkoutSession } from '@/context/WorkoutSessionContext'
import { getExercise } from '@/data/exercises'
const DISCIPLINES = ['Strength', 'Hypertrophy', 'Calisthenics', 'HIIT', 'Recovery'] as const

export default function WorkoutBuilder() {
  const { builderName, setBuilderName, builderExercises, setBuilderExercises, startBuilder } = useWorkoutSession()

  const totalSets = builderExercises.reduce((s, ex) => s + ex.targetSets, 0)
  const estMin = Math.max(12, builderExercises.length * 12 + totalSets * 2)

  function removeAt(i: number) {
    setBuilderExercises(builderExercises.filter((_, j) => j !== i))
  }

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Workout builder" />
      </div>
      <HudSubpageShell className="gap-5 pb-12">
        <HudIntroBlock
          eyebrow="Session architect"
          title="Workout builder"
          description="Stack exercises, tune sets, and launch with timers."
        />

        <section className="bg-hud-container-lowest rounded-xl p-4 shadow-sm border border-hud-outline-variant/30 flex flex-col gap-4">
          <div>
            <label htmlFor="workoutName" className="text-[10px] text-hud-on-variant uppercase tracking-wider font-semibold block mb-1">
              Workout session name
            </label>
            <div className="relative">
              <input
                id="workoutName"
                className="w-full bg-hud-container-low text-hud-on font-display text-sm rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-hud-primary font-semibold"
                value={builderName}
                onChange={(e) => setBuilderName(e.target.value)}
                placeholder="Name your workout…"
              />
              <MaterialIcon name="edit" className="absolute right-3 top-1/2 -translate-y-1/2 text-hud-on-variant text-[18px] pointer-events-none" />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-hud-on-variant uppercase tracking-wider font-semibold">Discipline / split</span>
            <div className="flex items-center gap-2 overflow-x-auto py-1 mt-1.5 -mx-1 px-1">
              {DISCIPLINES.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-display font-semibold uppercase ${
                    i === 0 ? 'bg-hud-primary text-white shadow-sm' : 'bg-hud-container-low text-hud-on'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-hud-container-low p-2.5 rounded-lg text-center">
              <span className="text-[10px] text-hud-on-variant uppercase">Est. time</span>
              <p className="font-display font-bold text-hud-on text-sm">
                {estMin}
                <span className="text-xs font-normal ml-0.5">min</span>
              </p>
            </div>
            <div className="bg-hud-container-low p-2.5 rounded-lg text-center">
              <span className="text-[10px] text-hud-on-variant uppercase">Exercises</span>
              <p className="font-display font-bold text-hud-on text-sm">{builderExercises.length}</p>
            </div>
            <div className="bg-hud-container-low p-2.5 rounded-lg text-center">
              <span className="text-[10px] text-hud-on-variant uppercase">Intensity</span>
              <p className="font-display font-bold text-hud-on text-sm flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-hud-primary" />
                High
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-hud-on">Sequence</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-hud-primary/10 text-hud-primary">Live routine</span>
          </div>
          <span className="text-xs text-hud-on-variant font-display">{totalSets} total sets</span>
        </div>

        <div className="flex flex-col gap-3">
          {builderExercises.map((ex, i) => {
            const meta = getExercise(ex.exerciseId)
            const isTime = ex.targetReps.includes('sec') || meta?.name.toLowerCase().includes('plank')
            return (
              <div key={`${ex.exerciseId}-${i}`} className="bg-hud-container-lowest rounded-xl p-4 shadow-sm border border-hud-outline-variant/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-hud-container-low text-hud-primary flex items-center justify-center font-display font-bold text-sm">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-hud-on text-sm">{meta?.name ?? ex.exerciseId}</h3>
                      <p className="text-xs text-hud-on-variant">
                        {meta?.muscle ?? '—'} • {meta?.equipment ?? '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-hud-on-variant hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove exercise"
                  >
                    <MaterialIcon name="close" className="text-[18px]" />
                  </button>
                </div>
                <div className="mt-3 pt-3 bg-hud-container-low rounded-lg p-3">
                  <div className="flex items-center justify-between text-[10px] text-hud-on-variant uppercase mb-2">
                    <span>
                      {ex.targetSets} sets × {ex.targetReps} {isTime ? '' : 'reps'}
                    </span>
                    <span className="flex items-center gap-1 text-hud-primary font-semibold">
                      <MaterialIcon name="timer" className="text-[14px]" /> {ex.restSec}s rest
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-hud-on-variant">Target sets</span>
                    <div className="flex items-center gap-1 bg-hud-container-lowest rounded-md p-0.5">
                      <button
                        type="button"
                        className="w-6 h-6 text-xs font-bold"
                        onClick={() => {
                          const next = [...builderExercises]
                          next[i] = { ...ex, targetSets: Math.max(1, ex.targetSets - 1) }
                          setBuilderExercises(next)
                        }}
                      >
                        −
                      </button>
                      <span className="px-2 text-xs font-bold tabular-nums">{ex.targetSets}</span>
                      <button
                        type="button"
                        className="w-6 h-6 text-xs font-bold"
                        onClick={() => {
                          const next = [...builderExercises]
                          next[i] = { ...ex, targetSets: ex.targetSets + 1 }
                          setBuilderExercises(next)
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Link
          to="/workouts/library"
          className="w-full py-3.5 rounded-xl bg-hud-container-lowest border border-hud-outline-variant/30 shadow-sm flex items-center justify-center gap-2 text-hud-primary font-display font-semibold text-sm"
        >
          <MaterialIcon name="add_circle" className="text-[20px]" />
          Add from exercise library
        </Link>

        <div className="bg-hud-container-high/60 rounded-xl p-3.5 flex items-center gap-3 border border-hud-outline-variant/20">
          <div className="w-10 h-10 rounded-full bg-hud-primary/10 flex items-center justify-center text-hud-primary shrink-0">
            <MaterialIcon name="bolt" className="text-[22px]" />
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-hud-on">Kata Kilo momentum engine</p>
            <p className="text-[11px] text-hud-on-variant">Interval timers and rest sync start when you launch.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={startBuilder}
          className="w-full h-14 bg-hud-primary text-white rounded-xl font-display font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
        >
          <MaterialIcon name="play_arrow" className="text-[24px]" />
          Start custom workout
        </button>
      </HudSubpageShell>
    </>
  )
}
