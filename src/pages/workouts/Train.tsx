import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import PageShell from '@/components/PageShell'
import EmptyState from '@/components/ui/EmptyState'
import { FieldLabel, PrimaryButton, TextField } from '@/components/ui/FieldInput'
import Panel from '@/components/ui/Panel'
import { useWorkoutSession } from '@/context/WorkoutSessionContext'
import { getExercise, resolveExerciseVideoId } from '@/data/exercises'
import { getNoEquipmentPlans } from '@/data/workout-plans'
import CircularTimer from '@/components/ui/CircularTimer'
import { useAutoSteps } from '@/components/activity/AutoStepTrackerRunner'
import ExerciseVideo from '@/components/workouts/ExerciseVideo'
import { useWorkoutVoiceCoach } from '@/hooks/useWorkoutVoiceCoach'
import { isVoiceCoachEnabled, setVoiceCoachEnabled, speak } from '@/lib/voice-coach'

export default function WorkoutTrain() {
  const { session, setSession, workoutTimer, restTimer, finishWorkout, saving, beginWorkout, preparePlan } =
    useWorkoutSession()
  const { stepsToday } = useAutoSteps()
  const [setReps, setSetReps] = useState('10')
  const [setWeight, setSetWeight] = useState('20')
  const [voiceOn, setVoiceOn] = useState(() => isVoiceCoachEnabled())

  const currentTrain = session ? session.exercises[session.currentIndex] : null
  const currentMeta = currentTrain ? getExercise(currentTrain.exerciseId) : null
  const prevSets = currentTrain?.sets ?? []
  const videoId = currentMeta ? resolveExerciseVideoId(currentMeta) : null

  useWorkoutVoiceCoach({
    enabled: voiceOn,
    targetReps: currentTrain?.targetReps ?? '10',
    setNumber: prevSets.length + 1,
    totalSets: currentTrain?.targetSets ?? 1,
    restRunning: restTimer.running,
    restSecondsLeft: restTimer.secondsLeft,
    exerciseName: currentMeta?.name ?? 'Exercise',
    guidedActive: voiceOn
  })

  useEffect(() => {
    if (!voiceOn || !currentMeta || !currentTrain || prevSets.length > 0 || restTimer.running) return
    speak(`Set 1. ${currentMeta.name}. Begin when ready.`)
  }, [voiceOn, currentMeta?.id, session?.currentIndex])

  const logSet = useCallback(() => {
    if (!session || !currentTrain) return
    const reps = Number(setReps)
    const weightKg = Number(setWeight)
    if (!reps || reps <= 0) return
    const updated = { ...session }
    const ex = { ...updated.exercises[session.currentIndex] }
    ex.sets = [...ex.sets, { reps, weightKg }]
    updated.exercises = [...updated.exercises]
    updated.exercises[session.currentIndex] = ex
    setSession(updated)
    if (voiceOn) speak('Set logged. Rest.')
    restTimer.start(ex.restSec)
    if (ex.sets.length >= ex.targetSets && session.currentIndex < session.exercises.length - 1) {
      updated.currentIndex = session.currentIndex + 1
      setSession(updated)
    }
  }, [session, currentTrain, setReps, setWeight, restTimer, setSession, voiceOn])

  function toggleVoice() {
    const next = !voiceOn
    setVoiceOn(next)
    setVoiceCoachEnabled(next)
  }

  return (
    <>
      <PageHeader
        title="Train"
        action={
          <button
            type="button"
            onClick={toggleVoice}
            className={`rounded-xl border px-3 py-2 text-xs font-medium min-h-[44px] ${
              voiceOn ? 'border-primary text-primary bg-primary/10' : 'border-line text-fog'
            }`}
          >
            Voice coach {voiceOn ? 'on' : 'off'}
          </button>
        }
      />
      <PageShell>
        {session && !session.live ? (
          <div className="space-y-4 max-w-lg">
            <Panel title="Ready to start?" variant="raised">
              <p className="text-bone font-display text-xl font-bold mb-2">{session.name}</p>
              <ul className="text-fog text-sm space-y-1 mb-4 max-h-48 overflow-y-auto">
                {session.exercises.map((ex, i) => {
                  const meta = getExercise(ex.exerciseId)
                  return (
                    <li key={`${ex.exerciseId}-${i}`}>
                      {meta?.name ?? ex.exerciseId} — {ex.targetSets}×{ex.targetReps}
                    </li>
                  )
                })}
              </ul>
              <button
                type="button"
                onClick={() => beginWorkout()}
                className="w-full rounded-xl bg-primary text-basalt font-bold py-3.5 min-h-[52px] shadow-lg shadow-primary/30"
              >
                Start session
              </button>
              <Link to="/workouts" className="block text-center mt-3 text-primary text-sm hover:underline">
                ← Choose another workout
              </Link>
            </Panel>
          </div>
        ) : session ? (
          <div className="space-y-5 max-w-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line/50 bg-basalt2/80 p-4 shadow-lg shadow-black/15">
              <CircularTimer
                progress={(workoutTimer.elapsedSec % 180) / 180}
                label={workoutTimer.label}
                caption="Session time"
                subtitle={`Exercise ${session.currentIndex + 1} of ${session.exercises.length}`}
                color="#4ade80"
                size={120}
              />
              <div className="flex flex-col items-end gap-2">
                <h2 className="text-bone font-display font-semibold text-lg text-right leading-snug">{session.name}</h2>
                <p className="text-fog text-xs tabular-nums">{stepsToday.toLocaleString()} steps today</p>
                <PrimaryButton loading={saving} onClick={finishWorkout}>
                  Finish
                </PrimaryButton>
              </div>
            </div>

            {currentMeta ? (
              <>
                <Panel title="Form guide" variant="raised">
                  <ExerciseVideo videoId={videoId} title={currentMeta.name} />
                  <p className="text-fog text-sm mt-3 leading-relaxed">{currentMeta.instructions[0]}</p>
                </Panel>

                <Panel title={`Set ${prevSets.length + 1} of ${currentTrain?.targetSets}`} variant="raised">
                  <p className="text-fog text-sm mb-3">
                    Target {currentTrain?.targetSets} × {currentTrain?.targetReps} · Rest {currentTrain?.restSec}s
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <FieldLabel>Reps</FieldLabel>
                      <TextField value={setReps} onChange={(e) => setSetReps(e.target.value)} type="number" />
                    </div>
                    <div>
                      <FieldLabel>Weight (kg)</FieldLabel>
                      <TextField value={setWeight} onChange={(e) => setSetWeight(e.target.value)} type="number" />
                    </div>
                  </div>
                  {prevSets.length > 0 ? (
                    <p className="text-fog text-xs mb-3">
                      Logged: {prevSets.map((s) => `${s.weightKg}×${s.reps}`).join(', ')}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={logSet}
                    className="w-full rounded-xl bg-primary text-basalt font-semibold py-3.5 text-base"
                  >
                    Complete set
                  </button>
                </Panel>
              </>
            ) : null}

            <Panel title="Rest">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <CircularTimer
                  progress={restTimer.running ? restTimer.progress : 0}
                  label={restTimer.running ? restTimer.label : '—'}
                  caption="Rest"
                  color="#7c5cff"
                  size={100}
                />
                {restTimer.running ? (
                  <button type="button" onClick={restTimer.skip} className="text-accent text-sm font-medium">
                    Skip rest
                  </button>
                ) : (
                  <p className="text-fog text-sm text-center sm:text-left leading-relaxed">
                    Voice coach counts rest down (5–1), then calls each rep. No voice when the session clock starts.
                  </p>
                )}
              </div>
            </Panel>
          </div>
        ) : (
          <div className="space-y-4 max-w-lg">
            <EmptyState title="No workout selected" hint="Go back and pick a plan first." />
            <Panel title="Quick pick" variant="raised">
              <div className="flex flex-wrap gap-2">
                {getNoEquipmentPlans()
                  .slice(0, 3)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => preparePlan(p.id)}
                      className="rounded-lg border px-3 py-2.5 text-sm font-medium min-h-[44px] hover:brightness-110 shadow-md shadow-black/10"
                      style={{ borderColor: `${p.color}55`, color: p.color, background: `${p.color}12` }}
                    >
                      {p.name}
                    </button>
                  ))}
              </div>
              <Link to="/workouts" className="inline-block mt-4 text-primary text-sm hover:underline">
                Full workout picker →
              </Link>
            </Panel>
          </div>
        )}
      </PageShell>
    </>
  )
}
