import { api } from '@/lib/api'
import { emptyWeekDays, mondayOfWeek, todayWeekdayIndex } from '@/lib/week-utils'
import type { SessionExercise, WorkoutSessionState } from '@/lib/workout-session'
import type { WeeklyPlanDay } from '@/types/field-log'

function sessionToPlannerExercises(exercises: SessionExercise[]) {
  return exercises.map((ex) => ({
    exerciseId: ex.exerciseId,
    sets: ex.targetSets,
    reps: ex.targetReps,
    restSec: ex.restSec
  }))
}

/** After a workout, mark today's planner slot with what you actually did */
export async function prefillWeeklyPlannerFromSession(
  session: WorkoutSessionState,
  durationMin: number
): Promise<void> {
  const weekStart = mondayOfWeek()
  const weekday = todayWeekdayIndex()
  let days: WeeklyPlanDay[] = emptyWeekDays()

  try {
    const { plan } = await api.workouts.getWeekly(weekStart)
    if (plan?.days?.length) days = plan.days as WeeklyPlanDay[]
  } catch {
    /* start from empty week */
  }

  const updated: WeeklyPlanDay[] = days.map((day) => {
    if (day.weekday !== weekday) return day
    return {
      ...day,
      isRest: false,
      workoutName: session.name,
      workoutType: day.workoutType ?? 'Training',
      durationMin: Math.max(1, durationMin),
      intensity: day.intensity ?? 'Moderate',
      planId: session.planId ?? day.planId,
      exercises: sessionToPlannerExercises(session.exercises)
    }
  })

  await api.workouts.saveWeekly({ weekStart, days: updated })
}
