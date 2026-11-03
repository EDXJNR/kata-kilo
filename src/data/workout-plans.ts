export type PlanCategory =
  | 'beginner'
  | 'muscle'
  | 'weight-loss'
  | 'strength'
  | 'hiit'
  | 'home'
  | 'gym'
  | 'no-equipment'

export type PlanExercise = {
  exerciseId: string
  sets: number
  reps: string
  restSec: number
  weight?: string
}

export type WorkoutPlan = {
  id: string
  name: string
  category: PlanCategory
  durationMin: number
  description: string
  exercises: PlanExercise[]
  color: string
  noEquipment?: boolean
}

export const PLAN_CATEGORIES: { id: PlanCategory; label: string; color: string }[] = [
  { id: 'no-equipment', label: 'No Equipment', color: '#f472b6' },
  { id: 'beginner', label: 'Beginner', color: '#22d3ee' },
  { id: 'muscle', label: 'Muscle Building', color: '#7c5cff' },
  { id: 'weight-loss', label: 'Weight Loss', color: '#ff6b6b' },
  { id: 'strength', label: 'Strength', color: '#fbbf24' },
  { id: 'hiit', label: 'HIIT', color: '#f472b6' },
  { id: 'home', label: 'Home', color: '#a78bfa' },
  { id: 'gym', label: 'Gym', color: '#34d399' }
]

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'no-equip-starter',
    name: 'Zero Gear Starter',
    category: 'no-equipment',
    durationMin: 25,
    description: 'Perfect first session — no weights, no machines, no excuses.',
    color: '#f472b6',
    noEquipment: true,
    exercises: [
      { exerciseId: 'bodyweight-squat', sets: 3, reps: '15', restSec: 45 },
      { exerciseId: 'push-up', sets: 3, reps: '10', restSec: 45 },
      { exerciseId: 'glute-bridge', sets: 3, reps: '15', restSec: 45 },
      { exerciseId: 'plank', sets: 3, reps: '30s', restSec: 30 }
    ]
  },
  {
    id: 'no-equip-cardio',
    name: 'Living Room Cardio',
    category: 'no-equipment',
    durationMin: 20,
    description: 'Elevate heart rate with bodyweight-only moves.',
    color: '#ff6b6b',
    noEquipment: true,
    exercises: [
      { exerciseId: 'jumping-jack', sets: 4, reps: '30s', restSec: 20 },
      { exerciseId: 'burpee', sets: 4, reps: '8', restSec: 40 },
      { exerciseId: 'mountain-climber', sets: 4, reps: '30s', restSec: 20 },
      { exerciseId: 'wall-sit', sets: 3, reps: '30s', restSec: 30 }
    ]
  },
  {
    id: 'no-equip-core',
    name: 'Core & Stability',
    category: 'no-equipment',
    durationMin: 22,
    description: 'Build a strong midsection without any gear.',
    color: '#22d3ee',
    noEquipment: true,
    exercises: [
      { exerciseId: 'plank', sets: 3, reps: '45s', restSec: 30 },
      { exerciseId: 'superman', sets: 3, reps: '12', restSec: 30 },
      { exerciseId: 'glute-bridge', sets: 3, reps: '15', restSec: 30 },
      { exerciseId: 'mountain-climber', sets: 3, reps: '20', restSec: 30 }
    ]
  },
  {
    id: 'no-equip-full',
    name: 'Full Body — No Equipment',
    category: 'no-equipment',
    durationMin: 35,
    description: 'Complete workout using only your bodyweight.',
    color: '#7c5cff',
    noEquipment: true,
    exercises: [
      { exerciseId: 'bodyweight-squat', sets: 4, reps: '15', restSec: 45 },
      { exerciseId: 'push-up', sets: 4, reps: '12', restSec: 45 },
      { exerciseId: 'lunge', sets: 3, reps: '10/leg', restSec: 45 },
      { exerciseId: 'burpee', sets: 3, reps: '8', restSec: 60 },
      { exerciseId: 'plank', sets: 3, reps: '45s', restSec: 30 }
    ]
  },
  {
    id: 'home-no-equip',
    name: 'Home — No Equipment',
    category: 'home',
    durationMin: 30,
    description: 'Full body using bodyweight only.',
    color: '#a78bfa',
    noEquipment: true,
    exercises: [
      { exerciseId: 'push-up', sets: 4, reps: '12', restSec: 60 },
      { exerciseId: 'lunge', sets: 3, reps: '12/leg', restSec: 60 },
      { exerciseId: 'plank', sets: 3, reps: '45s', restSec: 45 },
      { exerciseId: 'burpee', sets: 3, reps: '10', restSec: 60 }
    ]
  },
  {
    id: 'beginner-full',
    name: 'Beginner Full Body',
    category: 'beginner',
    durationMin: 30,
    description: 'Foundation session with bodyweight moves.',
    color: '#22d3ee',
    noEquipment: true,
    exercises: [
      { exerciseId: 'bodyweight-squat', sets: 3, reps: '12', restSec: 60 },
      { exerciseId: 'push-up', sets: 3, reps: '8-12', restSec: 60 },
      { exerciseId: 'glute-bridge', sets: 3, reps: '12', restSec: 60 },
      { exerciseId: 'plank', sets: 3, reps: '30s', restSec: 45 }
    ]
  },
  {
    id: 'weight-loss-circuit',
    name: 'Fat Burn Circuit',
    category: 'weight-loss',
    durationMin: 25,
    description: 'Minimal rest — no equipment needed.',
    color: '#ff6b6b',
    noEquipment: true,
    exercises: [
      { exerciseId: 'burpee', sets: 4, reps: '10', restSec: 30 },
      { exerciseId: 'jumping-jack', sets: 4, reps: '30s', restSec: 20 },
      { exerciseId: 'lunge', sets: 3, reps: '12/leg', restSec: 45 },
      { exerciseId: 'plank', sets: 3, reps: '45s', restSec: 30 }
    ]
  },
  {
    id: 'hiit-blast',
    name: 'HIIT Blast',
    category: 'hiit',
    durationMin: 20,
    description: 'High intensity — bodyweight only.',
    color: '#f472b6',
    noEquipment: true,
    exercises: [
      { exerciseId: 'burpee', sets: 5, reps: '20s', restSec: 10 },
      { exerciseId: 'mountain-climber', sets: 5, reps: '20s', restSec: 10 },
      { exerciseId: 'push-up', sets: 5, reps: '20s', restSec: 10 }
    ]
  },
  {
    id: 'muscle-push',
    name: 'Push Day Hypertrophy',
    category: 'muscle',
    durationMin: 55,
    description: 'Chest, shoulders, triceps — gym equipment.',
    color: '#7c5cff',
    exercises: [
      { exerciseId: 'bench-press', sets: 4, reps: '8-10', restSec: 120 },
      { exerciseId: 'shoulder-press', sets: 3, reps: '10-12', restSec: 90 },
      { exerciseId: 'cable-fly', sets: 3, reps: '12-15', restSec: 60 },
      { exerciseId: 'dip', sets: 3, reps: '8-12', restSec: 90 }
    ]
  },
  {
    id: 'strength-5x5',
    name: 'Strength 5×5',
    category: 'strength',
    durationMin: 60,
    description: 'Heavy compounds — barbell required.',
    color: '#fbbf24',
    exercises: [
      { exerciseId: 'squat', sets: 5, reps: '5', restSec: 180, weight: 'Heavy' },
      { exerciseId: 'bench-press', sets: 5, reps: '5', restSec: 180, weight: 'Heavy' },
      { exerciseId: 'deadlift', sets: 3, reps: '5', restSec: 180, weight: 'Heavy' }
    ]
  },
  {
    id: 'gym-pull',
    name: 'Gym Pull Day',
    category: 'gym',
    durationMin: 50,
    description: 'Back and biceps — machines and free weights.',
    color: '#34d399',
    exercises: [
      { exerciseId: 'deadlift', sets: 4, reps: '6-8', restSec: 150 },
      { exerciseId: 'lat-pulldown', sets: 3, reps: '10-12', restSec: 90 },
      { exerciseId: 'face-pull', sets: 3, reps: '15', restSec: 60 },
      { exerciseId: 'curl', sets: 3, reps: '12', restSec: 60 }
    ]
  },
  {
    id: 'gym-legs',
    name: 'Gym Leg Day',
    category: 'gym',
    durationMin: 55,
    description: 'Quads, hamstrings, glutes — machine + barbell.',
    color: '#34d399',
    exercises: [
      { exerciseId: 'squat', sets: 4, reps: '8', restSec: 120 },
      { exerciseId: 'leg-press', sets: 3, reps: '12', restSec: 90 },
      { exerciseId: 'rdl', sets: 3, reps: '10', restSec: 90 },
      { exerciseId: 'hip-thrust', sets: 3, reps: '12', restSec: 90 }
    ]
  }
]

export function getNoEquipmentPlans() {
  return WORKOUT_PLANS.filter((p) => p.noEquipment)
}
