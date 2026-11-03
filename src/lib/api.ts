import { getApiBaseUrl } from '@/lib/config'
import { refreshAccessToken, logoutLocal } from '@/lib/auth-refresh'
import { getStoredToken } from '@/lib/session'
import type {
  AuthResponse,
  BodyEntry,
  BuddyDashboard,
  BuddyPrivacy,
  DashboardData,
  NutritionData,
  ProfileData,
  ReminderPreferences,
  RouteEntry,
  SearchUser,
  SavedPlan,
  SavedPlanExercise,
  SleepData,
  User,
  WeeklyPlan,
  WeeklyPlanDay,
  WorkoutData,
  WorkoutEntry,
  ReadinessData,
  WeeklyReviewData,
  HabitsData,
  HabitTargets,
  SquadDashboard,
  SquadActivityItem,
  AutomationSuggestions
} from '@/types/field-log'
import { ApiError } from '@/types/field-log'

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getStoredToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers })

  if (res.status === 204) return undefined as T

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  const skipRefresh =
    path === '/auth/refresh' || path === '/auth/signin' || path === '/auth/signup'
  if (res.status === 401 && !retried && !skipRefresh) {
    const newToken = await refreshAccessToken()
    if (newToken) return request<T>(path, init, true)
    logoutLocal()
  }

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: string }).error)
        : res.statusText || 'Request failed'
    throw new ApiError(message, res.status)
  }

  return payload as T
}

export const api = {
  auth: {
    signUp: (email: string, password: string, name?: string) =>
      request<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      }),
    signIn: (email: string, password: string) =>
      request<AuthResponse>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    signOut: () => request<{ ok: boolean }>('/auth/signout', { method: 'POST' }),
    me: () => request<{ user: User }>('/auth/me')
  },

  dashboard: {
    get: () => request<DashboardData>('/dashboard')
  },

  story: {
    readiness: () => request<ReadinessData>('/story/readiness'),
    weeklyReview: (weekStart?: string) =>
      request<WeeklyReviewData>(`/story/weekly-review${weekStart ? `?week=${weekStart}` : ''}`)
  },

  habits: {
    get: (from?: string, to?: string) =>
      request<HabitsData>(`/habits${from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}` : ''}`),
    log: (data: { habitKey: string; logDate?: string; completed?: boolean; value?: number }) =>
      request<{ log: HabitsData['today'][0] }>('/habits/log', { method: 'POST', body: JSON.stringify(data) }),
    updateTargets: (targets: HabitTargets) =>
      request<{ targets: HabitTargets }>('/habits/targets', { method: 'PATCH', body: JSON.stringify(targets) })
  },

  squads: {
    dashboard: () => request<SquadDashboard>('/squads'),
    create: (name: string, weeklyGoal?: { workouts: number; steps: number }) =>
      request<{ squad: SquadDashboard['squad'] }>('/squads', { method: 'POST', body: JSON.stringify({ name, weeklyGoal }) }),
    join: (inviteCode: string) =>
      request<{ ok: boolean; squadId: string; name: string }>('/squads/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode })
      }),
    leave: () => request<{ ok: boolean }>('/squads/leave', { method: 'POST' }),
    activity: (limit = 30, offset = 0) =>
      request<{ items: SquadActivityItem[]; total: number; squadId?: string }>(
        `/squads/activity?limit=${limit}&offset=${offset}`
      )
  },

  automation: {
    suggestions: () => request<AutomationSuggestions>('/automation/suggestions')
  },

  planner: {
    checkins: (week: string) => request<{ checkins: { weekday: number; checked_in_at: string }[] }>(`/planner/checkins?week=${week}`),
    checkin: (weekStart: string, weekday: number) =>
      request<{ checkin: { week_start: string; weekday: number } }>('/planner/checkin', {
        method: 'POST',
        body: JSON.stringify({ weekStart, weekday })
      })
  },

  activity: {
    syncSteps: (data: { date?: string; steps: number; distanceKm?: number }) =>
      request<{ steps: number; date: string }>('/activity/steps/sync', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    stepWeek: () => request<{ days: { log_date: string; steps: number }[] }>('/activity/steps/week'),
    history: (from: string, to: string) =>
      request<{ days: { date: string; steps: number; distanceKm: number; trainMin: number }[] }>(
        `/activity/history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      )
  },

  health: {
    importManual: (payload: {
      steps?: number
      walk_min?: number
      sleep?: { duration_h: number; quality?: number; notes?: string }
    }) =>
      request<{ ok: boolean; imported: { sleep: number; steps: number; routes: number } }>('/health/import', {
        method: 'POST',
        body: JSON.stringify({ provider: 'manual', payload })
      })
  },

  body: {
    list: () => request<{ entries: BodyEntry[] }>('/body'),
    create: (data: {
      weight_kg?: number
      body_fat_pct?: number
      waist_cm?: number
      notes?: string
    }) => request<{ id: string }>('/body', { method: 'POST', body: JSON.stringify(data) })
  },

  workouts: {
    list: () => request<WorkoutData>('/workouts'),
    create: (data: {
      name: string
      duration_min?: number
      volume_kg?: number
      notes?: string
      exercises?: WorkoutEntry['exercises']
      calories_burned?: number
      exercises_completed?: number
      plan_type?: string
    }) => request<{ id: string }>('/workouts', { method: 'POST', body: JSON.stringify(data) }),
    getWeekly: (weekStart?: string) =>
      request<{ weekStart: string; plan: WeeklyPlan }>(
        `/workouts/weekly${weekStart ? `?week=${weekStart}` : ''}`
      ),
    saveWeekly: (data: { weekStart: string; days: WeeklyPlanDay[] }) =>
      request<WeeklyPlan>('/workouts/weekly', { method: 'PUT', body: JSON.stringify(data) })
  },

  search: {
    users: (q: string) => request<{ users: SearchUser[] }>(`/search/users?q=${encodeURIComponent(q)}`),
    workouts: (q: string) =>
      request<{ workouts: { id: string; name: string; recorded_at: string; duration_min: number | null; plan_type: string | null }[] }>(
        `/search/workouts?q=${encodeURIComponent(q)}`
      )
  },

  buddy: {
    dashboard: () => request<BuddyDashboard>('/buddy'),
    invite: (email: string) =>
      request<{ id: string; to: SearchUser }>('/buddy/invite', { method: 'POST', body: JSON.stringify({ email }) }),
    respond: (requestId: string, action: 'accepted' | 'declined') =>
      request<{ ok: boolean }>('/buddy/respond', { method: 'POST', body: JSON.stringify({ requestId, action }) }),
    remove: () => request<{ ok: boolean }>('/buddy', { method: 'DELETE' }),
    updatePrivacy: (privacy: BuddyPrivacy) =>
      request<{ privacy: BuddyPrivacy }>('/buddy/privacy', { method: 'PATCH', body: JSON.stringify(privacy) }),
    postActivity: (activityType: string, message: string, metadata?: Record<string, unknown>) =>
      request<{ id: string; createdAt: string }>('/buddy/activity', {
        method: 'POST',
        body: JSON.stringify({ activityType, message, metadata })
      }),
    nudge: (message: string) =>
      request<{ id: string; createdAt: string }>('/buddy/nudge', { method: 'POST', body: JSON.stringify({ message }) }),
    markNudgesRead: (nudgeId?: string) =>
      request<{ ok: boolean }>('/buddy/nudge/read', { method: 'POST', body: JSON.stringify({ nudgeId }) }),
    createChallenge: (data: {
      name: string
      goalType: string
      goalValue: number
      startDate: string
      endDate: string
    }) => request<{ id: string }>('/buddy/challenges', { method: 'POST', body: JSON.stringify(data) }),
    updateChallengeProgress: (challengeId: string, progressValue: number) =>
      request<{ ok: boolean }>('/buddy/challenges/progress', {
        method: 'PATCH',
        body: JSON.stringify({ challengeId, progressValue })
      }),
    shareWeeklyPlan: (weekStart?: string) =>
      request<{ id: string }>('/buddy/share/weekly', {
        method: 'POST',
        body: JSON.stringify({ weekStart })
      }),
    sharePlan: (planId: string) =>
      request<{ id: string }>('/buddy/share/plan', { method: 'POST', body: JSON.stringify({ planId }) })
  },

  reminders: {
    update: (prefs: ReminderPreferences) =>
      request<{ reminderPreferences: ReminderPreferences }>('/reminders', {
        method: 'PATCH',
        body: JSON.stringify(prefs)
      })
  },

  plans: {
    list: () => request<{ plans: SavedPlan[] }>('/plans'),
    create: (data: {
      name: string
      description?: string
      category?: string
      durationMin?: number
      color?: string
      exercises: SavedPlanExercise[]
    }) => request<SavedPlan>('/plans', { method: 'POST', body: JSON.stringify(data) }),
    update: (
      id: string,
      data: {
        name?: string
        description?: string
        category?: string
        durationMin?: number
        color?: string
        exercises?: SavedPlanExercise[]
      }
    ) => request<SavedPlan>(`/plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<{ ok: boolean }>(`/plans/${id}`, { method: 'DELETE' }),
    importShared: (plan: Record<string, unknown>) =>
      request<SavedPlan>('/plans/import', { method: 'POST', body: JSON.stringify({ plan }) }),
    discover: (q?: string) =>
      request<{ plans: SavedPlan[] }>(`/plans/discover${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    publish: (id: string, isPublic: boolean) =>
      request<SavedPlan>(`/plans/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ isPublic }) })
  },

  routes: {
    list: () => request<{ entries: RouteEntry[] }>('/routes'),
    create: (data: {
      name: string
      distance_km: number
      activity_type?: string
      path?: { lat: number; lng: number }[]
      steps?: number
      avg_pace_min_km?: number
      started_at?: string
      ended_at?: string
      elevation_m?: number
      duration_min?: number
    }) => request<{ id: string }>('/routes', { method: 'POST', body: JSON.stringify(data) })
  },

  meals: {
    scanPlate: (data: { imageBase64: string; mimeType?: string }) =>
      request<{
        analysis: {
          mealName: string
          calories: number
          proteinG: number
          carbsG: number
          fatG: number
          note?: string
        }
      }>('/meals/scan', { method: 'POST', body: JSON.stringify(data) })
  },

  nutrition: {
    list: () => request<NutritionData>('/nutrition'),
    create: (data: {
      meal: string
      calories?: number
      protein_g?: number
      carbs_g?: number
      fat_g?: number
      water_ml?: number
    }) => request<{ id: string }>('/nutrition', { method: 'POST', body: JSON.stringify(data) })
  },

  sleep: {
    list: () => request<SleepData>('/sleep'),
    create: (data: {
      duration_h: number
      quality?: number
      notes?: string
      source?: string
      started_at?: string
      ended_at?: string
    }) => request<{ id: string }>('/sleep', { method: 'POST', body: JSON.stringify(data) })
  },

  profile: {
    get: () => request<ProfileData>('/profile'),
    update: (data: {
      name?: string
      avatar_url?: string | null
      fitness_goal?: string
      experience_level?: string
      height_cm?: number
      weight_kg?: number
      training_days?: number[]
      equipment?: string[]
      preferred_duration_min?: number
      ring_goals?: { move: number; train: number; distance: number }
      reminder_preferences?: ReminderPreferences
      buddy_privacy?: BuddyPrivacy
    }) => request<{ user: ProfileData }>('/profile', { method: 'PATCH', body: JSON.stringify(data) })
  }
}
