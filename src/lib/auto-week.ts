import { WORKOUT_PLANS } from '@/data/workout-plans'
import type { SavedPlan, WeeklyPlanDay } from '@/types/field-log'
import { emptyWeekDays } from '@/lib/week-utils'

const ROTATION = ['beginner-full', 'gym-push', 'gym-pull', 'gym-legs', 'beginner-full']

export function buildAutoWeekDays(options: {
  trainingDays: number[]
  preferredDurationMin: number
  savedPlans: SavedPlan[]
  defaultReminderTime?: string
}): WeeklyPlanDay[] {
  const days = emptyWeekDays()
  const reminder = options.defaultReminderTime ?? '08:00'
  const trainDays = options.trainingDays.length ? [...options.trainingDays].sort((a, b) => a - b) : [1, 3, 5]

  let planIndex = 0
  return days.map((day) => {
    if (!trainDays.includes(day.weekday)) {
      return { ...day, isRest: true, reminderTime: null }
    }
    const planId = pickPlanId(planIndex++, options.savedPlans)
    const plan = WORKOUT_PLANS.find((p) => p.id === planId) ?? options.savedPlans.find((p) => p.id === planId)
    if (!plan) {
      return {
        ...day,
        isRest: false,
        workoutName: 'Training session',
        workoutType: 'Full Body',
        durationMin: options.preferredDurationMin,
        intensity: 'Moderate',
        planId: null,
        exercises: null,
        reminderTime: reminder
      }
    }
    return {
      ...day,
      isRest: false,
      workoutName: plan.name,
      workoutType: 'category' in plan && plan.category ? plan.category : 'Custom',
      durationMin: plan.durationMin ?? options.preferredDurationMin,
      intensity: 'Moderate',
      planId: plan.id,
      exercises: plan.exercises,
      reminderTime: reminder
    }
  })
}

function pickPlanId(index: number, saved: SavedPlan[]) {
  if (saved.length > 0 && index % 2 === 0) return saved[index % saved.length].id
  return ROTATION[index % ROTATION.length]
}
