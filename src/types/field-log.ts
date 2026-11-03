export type User = {
  id: string
  email: string
  name?: string | null
  avatar_url?: string | null
}

export type AuthResponse = {
  token: string
  refreshToken?: string
  user: User
}

export type TrendPoint = { label: string; value: number }

export type ActivityRing = {
  label: string
  current: number
  goal: number
  color: string
  unit: string
}

export type DashboardData = {
  latestWeight: number | null
  workoutsThisWeek: number
  avgSleepHours: number | null
  caloriesToday: number
  weightTrend: TrendPoint[]
  rings: ActivityRing[]
  stepsToday: number
  distanceTodayKm: number
}

export type BodyEntry = {
  id: string
  recorded_at: string
  weight_kg: number | null
  body_fat_pct: number | null
  waist_cm: number | null
  notes: string | null
}

export type WorkoutSetLog = {
  reps: number
  weightKg: number
  isPr?: boolean
}

export type WorkoutExerciseLog = {
  exerciseId: string
  targetSets: number
  targetReps: string
  restSec: number
  sets: WorkoutSetLog[]
}

export type WorkoutEntry = {
  id: string
  recorded_at: string
  name: string
  duration_min: number | null
  volume_kg: number | null
  notes: string | null
  exercises?: WorkoutExerciseLog[] | null
  calories_burned?: number | null
  exercises_completed?: number | null
  plan_type?: string | null
}

export type WorkoutSummary = {
  todayWorkout: string | null
  durationTodayMin: number
  exercisesCompletedToday: number
  caloriesToday: number
  currentStreak: number
  longestStreak: number
  weeklyWorkouts: number
  totalVolumeWeek: number
  xp: number
}

export type WorkoutData = {
  summary: WorkoutSummary
  entries: WorkoutEntry[]
  prs: { exerciseId: string; exerciseName: string; weightKg: number; reps: number; date: string }[]
  volumeTrend: TrendPoint[]
  strengthTrend: TrendPoint[]
}

export type RoutePathPoint = { lat: number; lng: number }

export type RouteEntry = {
  id: string
  recorded_at: string
  name: string
  distance_km: number
  elevation_m: number | null
  duration_min: number | null
  activity_type?: string | null
  path?: RoutePathPoint[] | null
  steps?: number | null
  avg_pace_min_km?: number | null
  started_at?: string | null
  ended_at?: string | null
}

export type NutritionEntry = {
  id: string
  recorded_at: string
  meal: string
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  water_ml: number | null
}

export type NutritionData = {
  entries: NutritionEntry[]
  totals: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    water_ml: number
  }
}

export type SleepEntry = {
  id: string
  recorded_at: string
  duration_h: number
  quality: number | null
  notes: string | null
  source?: string | null
  started_at?: string | null
  ended_at?: string | null
}

export type SleepData = {
  entries: SleepEntry[]
  trend: TrendPoint[]
}

export type ProfileData = {
  id: string
  email: string
  name: string | null
  avatar_url?: string | null
  created_at: string
  fitness_goal?: string | null
  experience_level?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  training_days?: number[] | null
  equipment?: string[] | null
  preferred_duration_min?: number | null
  ring_goals?: { move: number; train: number; distance: number } | null
  habit_targets?: HabitTargets | null
  reminder_preferences?: ReminderPreferences | null
  buddy_privacy?: BuddyPrivacy | null
  stats: {
    bodyEntries: number
    workouts: number
    routes: number
    nutritionEntries: number
    sleepEntries: number
  }
}

export type ReminderPreferences = {
  enabled: boolean
  time: string
}

export type BuddyPrivacy = {
  workouts: boolean
  progress: boolean
  achievements: boolean
  streaks: boolean
  challenges: boolean
}

export type WeeklyPlanDay = {
  weekday: number
  label: string
  isRest: boolean
  workoutName: string | null
  workoutType: string | null
  durationMin: number | null
  intensity: string | null
  planId: string | null
  exercises: unknown[] | null
  /** HH:mm — reminder for this workout day; falls back to profile default if null */
  reminderTime: string | null
}

export type WeeklyPlan = {
  id: string | null
  weekStart: string
  days: WeeklyPlanDay[]
  updatedAt: string | null
}

export type BuddyUser = {
  id: string
  email: string
  name: string | null
}

export type BuddyStats = {
  userId: string
  name: string
  workoutsThisWeek: number
  currentStreak: number
  totalWorkouts: number
}

export type BuddyActivity = {
  id: string
  user_id: string
  activity_type: string
  message: string
  metadata: Record<string, unknown>
  created_at: string
}

export type BuddyChallenge = {
  id: string
  created_by: string
  name: string
  goal_type: string
  goal_value: number
  start_date: string
  end_date: string
  status: string
  created_at: string
  progress?: { challenge_id: string; user_id: string; progress_value: number }[]
}

export type BuddyNudge = {
  id: string
  from_user_id: string
  message: string
  read_at: string | null
  created_at: string
}

export type BuddyDashboard = {
  pair: { id: string; since: string } | null
  buddy: BuddyUser | null
  privacy: BuddyPrivacy
  reminderPreferences: ReminderPreferences
  incomingRequests: { id: string; from_user_id: string; status: string; created_at: string }[]
  outgoingRequests: { id: string; to_user_id: string; status: string; created_at: string }[]
  activities: BuddyActivity[]
  challenges: BuddyChallenge[]
  nudges: BuddyNudge[]
  myStats: BuddyStats
  buddyStats: BuddyStats | null
}

export type SearchUser = {
  id: string
  email: string
  name: string | null
}

export type SavedPlanExercise = {
  exerciseId: string
  sets: number
  reps: string
  restSec: number
  weight?: string
}

export type SavedPlan = {
  id: string
  name: string
  description: string | null
  category: string
  durationMin: number
  color: string
  exercises: SavedPlanExercise[]
  createdAt: string
  updatedAt: string
  isCustom?: boolean
  isPublic?: boolean
  authorName?: string | null
}

export type ReadinessData = {
  score: number
  recommendation: 'rest' | 'moderate' | 'train'
  factors: { label: string; impact: string; detail: string }[]
  hints: { proteinTargetG: number; proteinTodayG: number; lastSleepHours: number | null }
}

export type WeeklyReviewData = {
  weekStart: string
  workoutsCompleted: number
  plannerCheckins: number
  weightDeltaKg: number | null
  habitCompletions: number
  activeChallenges: number
  summaryLines: string[]
}

export type HabitTargets = { walk_min: number; stretch_min: number; protein_g: number }

export type HabitLog = {
  habit_key: string
  log_date: string
  completed: boolean
  value: number | null
}

export type HabitsData = {
  targets: HabitTargets
  today: HabitLog[]
  logs: HabitLog[]
  streaks: Record<string, number>
}

export type SquadActivityItem = {
  id: string
  userId: string
  userName: string
  avatarUrl: string | null
  type: 'workout' | 'route'
  title: string
  detail: string
  recordedAt: string
}

export type SquadDashboard = {
  squad: {
    id: string
    name: string
    inviteCode: string
    weeklyGoal: { workouts: number; steps: number }
    createdAt: string
  } | null
  members: { userId: string; name: string; avatarUrl?: string | null; workoutsThisWeek: number }[]
  progress: { teamWorkouts: number; workoutGoal: number } | null
  activityPreview?: SquadActivityItem[]
}

export type AutomationSuggestions = {
  nutrition: { proteinTargetG: number; proteinTodayG: number; note: string }
  progressiveOverload: {
    exerciseId: string
    lastWeightKg: number
    lastReps: number
    suggestion: string
  }[]
  plannerHint: { trainingDays: number[]; preferredDurationMin: number }
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
