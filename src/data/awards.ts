import { getStepGoal } from '@/lib/daily-steps'

export type AwardCategory = 'Move' | 'Train' | 'Explore' | 'Fuel & rest' | 'Consistency' | 'Milestones'

export type AwardDef = {
  id: string
  category: AwardCategory
  title: string
  detail: string
  emoji: string
  earned: (ctx: AwardContext) => boolean
  progress?: (ctx: AwardContext) => string
}

export type AwardContext = {
  workouts: number
  routes: number
  bodyEntries: number
  nutritionEntries: number
  sleepEntries: number
  stepsToday: number
  workoutsWeek: number
  caloriesToday: number
  avgSleepHours: number | null
  distanceTodayKm: number
}

const stepGoal = () => getStepGoal()

export const AWARD_CATALOG: AwardDef[] = [
  // Move
  {
    id: 'steps-3k',
    category: 'Move',
    title: 'Morning mover',
    detail: '3,000 steps in a day',
    emoji: '🌄',
    earned: (c) => c.stepsToday >= 3000
  },
  {
    id: 'steps-5k',
    category: 'Move',
    title: 'Streak starter',
    detail: '5,000 steps in a day',
    emoji: '👟',
    earned: (c) => c.stepsToday >= 5000
  },
  {
    id: 'steps-8k',
    category: 'Move',
    title: 'City explorer',
    detail: '8,000 steps in a day',
    emoji: '🏙️',
    earned: (c) => c.stepsToday >= 8000
  },
  {
    id: 'steps-10k',
    category: 'Move',
    title: '10K club',
    detail: 'Hit 10,000 steps',
    emoji: '🏅',
    earned: (c) => c.stepsToday >= 10000
  },
  {
    id: 'steps-goal-50',
    category: 'Move',
    title: 'Halfway there',
    detail: '50% of your step goal',
    emoji: '🚶',
    earned: (c) => c.stepsToday >= stepGoal() * 0.5,
    progress: (c) => `${Math.min(100, Math.round((c.stepsToday / stepGoal()) * 100))}% today`
  },
  {
    id: 'steps-goal-80',
    category: 'Move',
    title: 'Close your rings',
    detail: '80% of your step goal',
    emoji: '🔥',
    earned: (c) => c.stepsToday >= stepGoal() * 0.8,
    progress: (c) => `${Math.min(100, Math.round((c.stepsToday / stepGoal()) * 100))}% today`
  },
  {
    id: 'steps-goal-100',
    category: 'Move',
    title: 'Move goal crushed',
    detail: '100% of daily step goal',
    emoji: '🎉',
    earned: (c) => c.stepsToday >= stepGoal()
  },
  {
    id: 'distance-3',
    category: 'Move',
    title: '3K day',
    detail: '3 km moved today',
    emoji: '🛤️',
    earned: (c) => c.distanceTodayKm >= 3
  },
  {
    id: 'distance-5',
    category: 'Move',
    title: 'Five K flyer',
    detail: '5 km moved today',
    emoji: '🏃‍♂️',
    earned: (c) => c.distanceTodayKm >= 5
  },
  // Train
  {
    id: 'first-workout',
    category: 'Train',
    title: 'First rep',
    detail: 'Log any workout',
    emoji: '🏋️‍♂️',
    earned: (c) => c.workouts >= 1
  },
  {
    id: 'workouts-5',
    category: 'Train',
    title: 'Getting serious',
    detail: '5 workouts logged',
    emoji: '💪',
    earned: (c) => c.workouts >= 5
  },
  {
    id: 'workouts-10',
    category: 'Train',
    title: 'Double digits',
    detail: '10 workouts logged',
    emoji: '🔢',
    earned: (c) => c.workouts >= 10
  },
  {
    id: 'workouts-25',
    category: 'Train',
    title: 'Quarter century',
    detail: '25 workouts logged',
    emoji: '🏆',
    earned: (c) => c.workouts >= 25
  },
  {
    id: 'workouts-50',
    category: 'Train',
    title: 'Iron habit',
    detail: '50 workouts logged',
    emoji: '🛡️',
    earned: (c) => c.workouts >= 50
  },
  {
    id: 'workouts-100',
    category: 'Train',
    title: 'Century club',
    detail: '100 workouts logged',
    emoji: '💯',
    earned: (c) => c.workouts >= 100
  },
  {
    id: 'week-2',
    category: 'Train',
    title: 'Active week',
    detail: '2+ workouts this week',
    emoji: '📅',
    earned: (c) => c.workoutsWeek >= 2
  },
  {
    id: 'week-warrior',
    category: 'Train',
    title: 'Week warrior',
    detail: '3+ workouts this week',
    emoji: '🔥',
    earned: (c) => c.workoutsWeek >= 3
  },
  {
    id: 'perfect-week',
    category: 'Train',
    title: 'Perfect week',
    detail: '5 workouts in 7 days',
    emoji: '⭐',
    earned: (c) => c.workoutsWeek >= 5
  },
  {
    id: 'beast-week',
    category: 'Train',
    title: 'Beast week',
    detail: '6+ workouts this week',
    emoji: '🦁',
    earned: (c) => c.workoutsWeek >= 6
  },
  // Explore
  {
    id: 'first-route',
    category: 'Explore',
    title: 'Trail blazer',
    detail: 'Save your first GPS route',
    emoji: '🗺️',
    earned: (c) => c.routes >= 1
  },
  {
    id: 'routes-5',
    category: 'Explore',
    title: 'Path finder',
    detail: '5 routes saved',
    emoji: '🧭',
    earned: (c) => c.routes >= 5
  },
  {
    id: 'routes-10',
    category: 'Explore',
    title: 'Cartographer',
    detail: '10 routes saved',
    emoji: '🗺️',
    earned: (c) => c.routes >= 10
  },
  {
    id: 'routes-25',
    category: 'Explore',
    title: 'Expedition',
    detail: '25 routes saved',
    emoji: '🏔️',
    earned: (c) => c.routes >= 25
  },
  // Fuel & rest
  {
    id: 'first-meal',
    category: 'Fuel & rest',
    title: 'Fuel logged',
    detail: 'Log nutrition once',
    emoji: '🥗',
    earned: (c) => c.nutritionEntries >= 1
  },
  {
    id: 'meals-10',
    category: 'Fuel & rest',
    title: 'Macro tracker',
    detail: '10 nutrition entries',
    emoji: '🍽️',
    earned: (c) => c.nutritionEntries >= 10
  },
  {
    id: 'calories-today',
    category: 'Fuel & rest',
    title: 'Fueled up',
    detail: 'Log calories today',
    emoji: '🔋',
    earned: (c) => c.caloriesToday > 0
  },
  {
    id: 'first-sleep',
    category: 'Fuel & rest',
    title: 'Rest counted',
    detail: 'Log sleep once',
    emoji: '😴',
    earned: (c) => c.sleepEntries >= 1
  },
  {
    id: 'sleep-7',
    category: 'Fuel & rest',
    title: 'Well rested',
    detail: '7+ avg sleep hours (recent)',
    emoji: '🌙',
    earned: (c) => (c.avgSleepHours ?? 0) >= 7
  },
  // Consistency
  {
    id: 'body-first',
    category: 'Consistency',
    title: 'Measured',
    detail: 'First body check-in',
    emoji: '📏',
    earned: (c) => c.bodyEntries >= 1
  },
  {
    id: 'body-10',
    category: 'Consistency',
    title: 'Trend watcher',
    detail: '10 body entries',
    emoji: '📈',
    earned: (c) => c.bodyEntries >= 10
  },
  {
    id: 'body-30',
    category: 'Consistency',
    title: 'Data driven',
    detail: '30 body entries',
    emoji: '📊',
    earned: (c) => c.bodyEntries >= 30
  },
  // Milestones
  {
    id: 'triple-threat',
    category: 'Milestones',
    title: 'Triple threat',
    detail: 'Workout, route, and body logged',
    emoji: '🎖️',
    earned: (c) => c.workouts >= 1 && c.routes >= 1 && c.bodyEntries >= 1
  },
  {
    id: 'full-stack',
    category: 'Milestones',
    title: 'Full stack athlete',
    detail: 'Workout, meal, sleep, and route',
    emoji: '✨',
    earned: (c) =>
      c.workouts >= 1 && c.nutritionEntries >= 1 && c.sleepEntries >= 1 && c.routes >= 1
  },
  {
    id: 'volume-king',
    category: 'Milestones',
    title: 'Volume king',
    detail: '50+ workouts and 10+ routes',
    emoji: '👑',
    earned: (c) => c.workouts >= 50 && c.routes >= 10
  }
]

export const AWARD_CATEGORIES: AwardCategory[] = [
  'Move',
  'Train',
  'Explore',
  'Fuel & rest',
  'Consistency',
  'Milestones'
]

export function buildAwardsFromContext(ctx: AwardContext) {
  return AWARD_CATALOG.map((def) => ({
    id: def.id,
    category: def.category,
    title: def.title,
    detail: def.progress?.(ctx) ?? def.detail,
    emoji: def.emoji,
    earned: def.earned(ctx)
  }))
}
