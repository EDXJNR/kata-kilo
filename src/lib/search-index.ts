import { EXERCISES } from '@/data/exercises'
import { WORKOUT_PLANS } from '@/data/workout-plans'

export type SearchResult = {
  id: string
  category: 'exercise' | 'plan' | 'page'
  title: string
  subtitle?: string
  to: string
}

const PAGES: SearchResult[] = [
  { id: 'page-home', category: 'page', title: 'Today', to: '/' },
  { id: 'page-rings', category: 'page', title: 'Activity history', to: '/activity/rings' },
  { id: 'page-more', category: 'page', title: 'More', to: '/more' },
  { id: 'page-body', category: 'page', title: 'Body overview', to: '/body' },
  { id: 'page-workouts', category: 'page', title: 'Train', to: '/workouts/train' },
  { id: 'page-planner', category: 'page', title: 'Weekly planner', to: '/workouts/planner' },
  { id: 'page-habits', category: 'page', title: 'Daily wins', to: '/habits' },
  { id: 'page-meals', category: 'page', title: 'Meal plans', to: '/meals' },
  { id: 'page-scan', category: 'page', title: 'AI calorie scan', to: '/meals/scan' },
  { id: 'page-awards', category: 'page', title: 'Awards', to: '/awards' },
  { id: 'page-library', category: 'page', title: 'Exercise library', to: '/workouts/library' },
  { id: 'page-plans', category: 'page', title: 'Workout plans', to: '/workouts/plans' },
  { id: 'page-train', category: 'page', title: 'Train', to: '/workouts/train' },
  { id: 'page-coach', category: 'page', title: 'AI Coach', to: '/workouts/coach' },
  { id: 'page-buddy', category: 'page', title: 'Kata Kilo Buddy', to: '/buddy' },
  { id: 'page-nutrition', category: 'page', title: 'Nutrition', to: '/nutrition' },
  { id: 'page-sleep', category: 'page', title: 'Sleep', to: '/sleep/track' },
  { id: 'page-profile', category: 'page', title: 'Profile', to: '/profile' }
]

export function searchLocal(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results: SearchResult[] = []

  for (const page of PAGES) {
    if (page.title.toLowerCase().includes(q)) results.push(page)
  }

  for (const ex of EXERCISES) {
    if (
      ex.name.toLowerCase().includes(q) ||
      ex.muscle.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q)
    ) {
      results.push({
        id: `ex-${ex.id}`,
        category: 'exercise',
        title: ex.name,
        subtitle: `${ex.muscle} · ${ex.equipment}`,
        to: '/workouts/library'
      })
    }
  }

  for (const plan of WORKOUT_PLANS) {
    if (plan.name.toLowerCase().includes(q) || plan.description.toLowerCase().includes(q)) {
      results.push({
        id: `plan-${plan.id}`,
        category: 'plan',
        title: plan.name,
        subtitle: `${plan.durationMin} min · ${plan.exercises.length} exercises`,
        to: '/workouts/plans'
      })
    }
  }

  return results.slice(0, 12)
}

export const SEARCH_CATEGORY_LABELS: Record<SearchResult['category'], string> = {
  exercise: 'Exercises',
  plan: 'Plans',
  page: 'Pages'
}
