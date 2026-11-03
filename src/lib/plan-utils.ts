import { WORKOUT_PLANS, type PlanExercise, type WorkoutPlan } from '@/data/workout-plans'
import type { SavedPlan } from '@/types/field-log'

export type AnyWorkoutPlan = WorkoutPlan | SavedPlan

export function isSavedPlan(plan: AnyWorkoutPlan): plan is SavedPlan {
  return 'isCustom' in plan && plan.isCustom === true
}

export function getBuiltinPlan(id: string): WorkoutPlan | undefined {
  return WORKOUT_PLANS.find((p) => p.id === id)
}

export function resolvePlan(id: string, savedPlans: SavedPlan[]): AnyWorkoutPlan | undefined {
  return getBuiltinPlan(id) ?? savedPlans.find((p) => p.id === id)
}

export function allPlans(savedPlans: SavedPlan[]): AnyWorkoutPlan[] {
  return [...WORKOUT_PLANS, ...savedPlans.map((p) => ({ ...p, isCustom: true as const }))]
}

export function planExercises(plan: AnyWorkoutPlan): PlanExercise[] {
  return plan.exercises as PlanExercise[]
}
