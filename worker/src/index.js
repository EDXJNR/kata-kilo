import { createClient } from '@supabase/supabase-js'
import {
  handleBuddyActivity,
  handleBuddyChallengeCreate,
  handleBuddyChallengeProgress,
  handleBuddyDashboard,
  handleBuddyInvite,
  handleBuddyNudge,
  handleBuddyNudgeRead,
  handleBuddyPrivacy,
  handleBuddyRemove,
  handleBuddyRespond,
  handleGetWeeklyPlan,
  handleReminderPreferences,
  handleSaveWeeklyPlan,
  handleSearchUsers,
  handleSearchWorkouts,
  handleListSavedPlans,
  handleCreateSavedPlan,
  handleUpdateSavedPlan,
  handleDeleteSavedPlan,
  handleImportSharedPlan,
  handleShareWeeklyPlan,
  handleShareSavedPlan,
  handleDiscoverPlans,
  handlePublishSavedPlan,
  postWorkoutBuddyActivity
} from './handlers/features.js'
import { handleReadiness, handleWeeklyReview } from './handlers/story.js'
import { handleGetHabits, handleLogHabit, handleUpdateHabitTargets } from './handlers/habits.js'
import {
  handleSquadDashboard,
  handleCreateSquad,
  handleJoinSquad,
  handleLeaveSquad,
  handleSquadActivity
} from './handlers/squads.js'
import {
  handleAutomationSuggestions,
  handlePlannerCheckin,
  handleListCheckins,
  handleHealthImport,
  handleSyncDailySteps,
  handleGetStepWeek,
  handleGetActivityHistory
} from './handlers/automation.js'
import { handleScanPlate } from './handlers/meals.js'

function createSupabaseAdmin(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function createSupabaseAuth(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

function readBearerToken(request) {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7).trim() || null
}

async function getSessionUser(env, token) {
  if (!token) return null
  const supabase = createSupabaseAdmin(env)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user?.email) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', data.user.id)
    .maybeSingle()
  const metaName = typeof data.user.user_metadata?.name === 'string' ? data.user.user_metadata.name : null
  return {
    id: data.user.id,
    email: data.user.email,
    name: profile?.name ?? metaName,
    avatar_url: profile?.avatar_url ?? null
  }
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = env.ALLOWED_ORIGIN?.split(',').map((v) => v.trim()) ?? ['*']
  const allowOrigin = allowed.includes('*') ? '*' : allowed.includes(origin) ? origin : allowed[0] ?? '*'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
}

function jsonResponse(data, init, request, env) {
  const headers = new Headers(init.headers)
  for (const [key, value] of Object.entries(corsHeaders(request, env))) headers.set(key, value)
  headers.set('Content-Type', 'application/json')
  return new Response(JSON.stringify(data), { ...init, headers })
}

function errorResponse(message, status, request, env) {
  return jsonResponse({ error: message }, { status }, request, env)
}

async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function isoNow() {
  return new Date().toISOString()
}

function dayKey(iso) {
  return iso.slice(0, 10)
}

function daysAgoIso(days) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

function weekdayLabel(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short' })
}

function todayStartIso() {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

function weekStartIso() {
  return daysAgoIso(7)
}

function mapSupabaseError(msg) {
  if (msg.includes('already registered')) return 'Email already registered'
  if (msg.includes('Invalid login credentials')) return 'Invalid credentials'
  return msg
}

async function requireUser(request, env) {
  const user = await getSessionUser(env, readBearerToken(request))
  if (!user) return errorResponse('Unauthorized', 401, request, env)
  return user
}

async function handleSignUp(request, env) {
  const body = await readJson(request)
  if (!body?.email || !body.password) return errorResponse('Email and password are required', 400, request, env)
  const email = body.email.trim().toLowerCase()
  if (email.length < 3 || body.password.length < 6) {
    return errorResponse('Invalid email or password (min 6 chars)', 400, request, env)
  }
  const name = body.name?.trim() || null
  const admin = createSupabaseAdmin(env)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: body.password,
    email_confirm: true,
    user_metadata: name ? { name } : undefined
  })
  if (error || !data.user) return errorResponse(mapSupabaseError(error?.message ?? 'Sign up failed'), 400, request, env)
  await admin.from('profiles').upsert({ id: data.user.id, email, name })
  const auth = createSupabaseAuth(env)
  const signIn = await auth.auth.signInWithPassword({ email, password: body.password })
  if (signIn.error || !signIn.data.session) return errorResponse('Account created but sign-in failed', 500, request, env)
  return jsonResponse(
    {
      token: signIn.data.session.access_token,
      refreshToken: signIn.data.session.refresh_token,
      user: { id: data.user.id, email, name, avatar_url: null }
    },
    { status: 201 },
    request,
    env
  )
}

async function handleSignIn(request, env) {
  const body = await readJson(request)
  if (!body?.email || !body.password) return errorResponse('Email and password are required', 400, request, env)
  const email = body.email.trim().toLowerCase()
  const auth = createSupabaseAuth(env)
  const { data, error } = await auth.auth.signInWithPassword({ email, password: body.password })
  if (error || !data.session || !data.user.email) {
    return errorResponse(mapSupabaseError(error?.message ?? 'Invalid credentials'), 401, request, env)
  }
  const admin = createSupabaseAdmin(env)
  const { data: profile } = await admin.from('profiles').select('name, avatar_url').eq('id', data.user.id).maybeSingle()
  const metaName = typeof data.user.user_metadata?.name === 'string' ? data.user.user_metadata.name : null
  return jsonResponse(
    {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name ?? metaName,
        avatar_url: profile?.avatar_url ?? null
      }
    },
    { status: 200 },
    request,
    env
  )
}

async function handleRefresh(request, env) {
  const body = await readJson(request)
  const refreshToken = body?.refreshToken?.trim()
  if (!refreshToken) return errorResponse('refreshToken is required', 400, request, env)
  const auth = createSupabaseAuth(env)
  const { data, error } = await auth.auth.refreshSession({ refresh_token: refreshToken })
  if (error || !data.session?.access_token) {
    return errorResponse('Session expired — sign in again', 401, request, env)
  }
  const admin = createSupabaseAdmin(env)
  const userId = data.user?.id
  let name = null
  let avatar_url = null
  if (userId) {
    const { data: profile } = await admin.from('profiles').select('name, avatar_url').eq('id', userId).maybeSingle()
    name = profile?.name ?? data.user?.user_metadata?.name ?? null
    avatar_url = profile?.avatar_url ?? null
  }
  return jsonResponse(
    {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user?.email
        ? { id: data.user.id, email: data.user.email, name, avatar_url }
        : undefined
    },
    { status: 200 },
    request,
    env
  )
}

async function handleSignOut(request, env) {
  return jsonResponse({ ok: true }, { status: 200 }, request, env)
}

async function handleMe(request, env) {
  const user = await requireUser(request, env)
  if (user instanceof Response) return user
  return jsonResponse({ user }, { status: 200 }, request, env)
}

async function handleDashboard(env, userId, request) {
  const supabase = createSupabaseAdmin(env)
  const since = weekStartIso()
  const today = todayStartIso()

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('ring_goals')
    .eq('id', userId)
    .maybeSingle()

  const ringGoals = profileRow?.ring_goals ?? { move: 500, train: 30, distance: 5 }
  const moveGoal = Number(ringGoals.move) || 500
  const trainGoal = Number(ringGoals.train) || 30
  const distanceGoal = Number(ringGoals.distance) || 5

  const [weightRes, latestRes, workoutsRes, sleepRes, nutritionRes, routesTodayRes, workoutsTodayRes] =
    await Promise.all([
    supabase
      .from('body_entries')
      .select('recorded_at, weight_kg')
      .eq('user_id', userId)
      .gte('recorded_at', since)
      .not('weight_kg', 'is', null)
      .order('recorded_at', { ascending: true }),
    supabase
      .from('body_entries')
      .select('weight_kg')
      .eq('user_id', userId)
      .not('weight_kg', 'is', null)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('recorded_at', since),
    supabase.from('sleep_entries').select('duration_h').eq('user_id', userId).gte('recorded_at', since),
    supabase.from('nutrition_entries').select('calories').eq('user_id', userId).gte('recorded_at', today),
    supabase
      .from('routes')
      .select('distance_km, duration_min, steps')
      .eq('user_id', userId)
      .gte('recorded_at', today),
    supabase
      .from('workouts')
      .select('duration_min')
      .eq('user_id', userId)
      .gte('recorded_at', today)
  ])
  const byDay = new Map()
  for (const row of weightRes.data ?? []) {
    if (row.weight_kg != null) byDay.set(dayKey(row.recorded_at), Number(row.weight_kg))
  }
  const sleepValues = (sleepRes.data ?? []).map((r) => Number(r.duration_h))
  const avgSleepHours =
    sleepValues.length > 0
      ? Math.round((sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length) * 10) / 10
      : null

  const todayKeyStr = today.slice(0, 10)
  let dailyStepsRow = null
  const dailyStepsRes = await supabase
    .from('daily_steps')
    .select('steps, distance_km')
    .eq('user_id', userId)
    .eq('log_date', todayKeyStr)
    .maybeSingle()
  if (!dailyStepsRes.error) dailyStepsRow = dailyStepsRes.data

  const routesToday = routesTodayRes.data ?? []
  const routeDistance = routesToday.reduce((s, r) => s + Number(r.distance_km ?? 0), 0)
  const routeSteps = routesToday.reduce((s, r) => s + (r.steps ?? 0), 0)
  const autoSteps = dailyStepsRow?.steps ?? 0
  const autoDist = dailyStepsRow?.distance_km != null ? Number(dailyStepsRow.distance_km) : 0
  const distanceTodayKm = Math.round(Math.max(routeDistance, autoDist) * 10) / 10
  const stepsToday = Math.max(routeSteps, autoSteps)
  const routeMinutes = routesToday.reduce((s, r) => s + (r.duration_min ?? 0), 0)
  const workoutMinutes = (workoutsTodayRes.data ?? []).reduce((s, r) => s + (r.duration_min ?? 0), 0)
  const trainMinutes = routeMinutes + workoutMinutes
  const nutritionCalories = (nutritionRes.data ?? []).reduce((sum, r) => sum + (r.calories ?? 0), 0)
  const activityCalories = Math.round(distanceTodayKm * 60 + trainMinutes * 5)
  const moveCalories = nutritionCalories + activityCalories

  const rings = [
    { label: 'Move', current: moveCalories, goal: moveGoal, color: '#ff6b6b', unit: 'kcal' },
    { label: 'Train', current: trainMinutes, goal: trainGoal, color: '#7c5cff', unit: 'min' },
    { label: 'Distance', current: distanceTodayKm, goal: distanceGoal, color: '#22d3ee', unit: 'km' }
  ]

  return jsonResponse(
    {
      latestWeight: latestRes.data?.weight_kg != null ? Number(latestRes.data.weight_kg) : null,
      workoutsThisWeek: workoutsRes.count ?? 0,
      avgSleepHours,
      caloriesToday: nutritionCalories,
      weightTrend: [...byDay.entries()].map(([day, value]) => ({
        label: weekdayLabel(`${day}T12:00:00.000Z`),
        value
      })),
      rings,
      stepsToday,
      distanceTodayKm
    },
    { status: 200 },
    request,
    env
  )
}

async function handleListBody(env, userId, request) {
  const { data, error } = await createSupabaseAdmin(env)
    .from('body_entries')
    .select('id, recorded_at, weight_kg, body_fat_pct, waist_cm, notes')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(50)
  if (error) return errorResponse(error.message, 500, request, env)
  return jsonResponse({ entries: data ?? [] }, { status: 200 }, request, env)
}

async function handleCreateBody(request, env, userId) {
  const body = await readJson(request)
  if (!body || (body.weight_kg == null && body.body_fat_pct == null && body.waist_cm == null)) {
    return errorResponse('At least one body metric is required', 400, request, env)
  }
  const { data, error } = await createSupabaseAdmin(env)
    .from('body_entries')
    .insert({
      user_id: userId,
      recorded_at: body.recorded_at ?? isoNow(),
      weight_kg: body.weight_kg ?? null,
      body_fat_pct: body.body_fat_pct ?? null,
      waist_cm: body.waist_cm ?? null,
      notes: body.notes?.trim() || null
    })
    .select('id')
    .single()
  if (error) return errorResponse(error.message, 500, request, env)
  return jsonResponse({ id: data.id }, { status: 201 }, request, env)
}

async function computeStreak(dates) {
  if (!dates.length) return { current: 0, longest: 0 }
  const days = [...new Set(dates.map((d) => dayKey(d)))].sort()
  const today = dayKey(isoNow())
  let current = 0
  let longest = 0
  let run = 0
  let prev = null
  for (const d of days) {
    if (!prev) run = 1
    else {
      const diff = (new Date(d) - new Date(prev)) / 86400000
      run = diff === 1 ? run + 1 : 1
    }
    longest = Math.max(longest, run)
    prev = d
  }
  const last = days[days.length - 1]
  const diffFromToday = (new Date(today) - new Date(last)) / 86400000
  if (diffFromToday <= 1) {
    current = 1
    for (let i = days.length - 2; i >= 0; i--) {
      const gap = (new Date(days[i + 1]) - new Date(days[i])) / 86400000
      if (gap === 1) current++
      else break
    }
  }
  return { current, longest }
}

async function handleListWorkouts(env, userId, request) {
  const supabase = createSupabaseAdmin(env)
  const since = weekStartIso()
  const today = todayStartIso()
  const { data, error } = await supabase
    .from('workouts')
    .select(
      'id, recorded_at, name, duration_min, volume_kg, notes, exercises, calories_burned, exercises_completed, plan_type'
    )
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(50)
  if (error) return errorResponse(error.message, 500, request, env)
  const entries = data ?? []
  const streak = await computeStreak(entries.map((e) => e.recorded_at))
  const todayEntries = entries.filter((e) => e.recorded_at >= today)
  const weekEntries = entries.filter((e) => e.recorded_at >= since)
  const durationTodayMin = todayEntries.reduce((s, e) => s + (e.duration_min ?? 0), 0)
  const exercisesCompletedToday = todayEntries.reduce((s, e) => s + (e.exercises_completed ?? 0), 0)
  const caloriesToday = todayEntries.reduce((s, e) => s + (e.calories_burned ?? 0), 0)
  const totalVolumeWeek = weekEntries.reduce((s, e) => s + Number(e.volume_kg ?? 0), 0)
  const xp = entries.length * 50 + streak.current * 25

  const prs = []
  const best = new Map()
  for (const entry of entries) {
    for (const ex of entry.exercises ?? []) {
      for (const set of ex.sets ?? []) {
        const score = (set.weightKg ?? 0) * (1 + (set.reps ?? 0) / 30)
        const prev = best.get(ex.exerciseId)
        if (!prev || score > prev.score) {
          best.set(ex.exerciseId, {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseId,
            weightKg: set.weightKg,
            reps: set.reps,
            date: entry.recorded_at,
            score
          })
        }
      }
    }
  }
  for (const v of best.values()) prs.push({ exerciseId: v.exerciseId, exerciseName: v.exerciseName, weightKg: v.weightKg, reps: v.reps, date: v.date })

  const volumeByDay = new Map()
  for (const e of weekEntries) {
    const k = dayKey(e.recorded_at)
    volumeByDay.set(k, (volumeByDay.get(k) ?? 0) + Number(e.volume_kg ?? 0))
  }
  const volumeTrend = [...volumeByDay.entries()].map(([day, value]) => ({
    label: weekdayLabel(`${day}T12:00:00.000Z`),
    value: Math.round(value)
  }))

  const strengthByDay = new Map()
  for (const e of weekEntries) {
    let max = 0
    for (const ex of e.exercises ?? []) {
      for (const set of ex.sets ?? []) {
        max = Math.max(max, set.weightKg ?? 0)
      }
    }
    if (max > 0) {
      const k = dayKey(e.recorded_at)
      strengthByDay.set(k, Math.max(strengthByDay.get(k) ?? 0, max))
    }
  }
  const strengthTrend = [...strengthByDay.entries()].map(([day, value]) => ({
    label: weekdayLabel(`${day}T12:00:00.000Z`),
    value
  }))

  const latest = entries[0]

  return jsonResponse(
    {
      summary: {
        todayWorkout: latest?.name ?? null,
        durationTodayMin,
        exercisesCompletedToday,
        caloriesToday,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        weeklyWorkouts: weekEntries.length,
        totalVolumeWeek: Math.round(totalVolumeWeek),
        xp
      },
      entries,
      prs,
      volumeTrend,
      strengthTrend
    },
    { status: 200 },
    request,
    env
  )
}

async function handleCreateWorkout(request, env, userId) {
  const body = await readJson(request)
  if (!body?.name?.trim()) return errorResponse('Workout name is required', 400, request, env)
  const { data, error } = await createSupabaseAdmin(env)
    .from('workouts')
    .insert({
      user_id: userId,
      recorded_at: body.recorded_at ?? isoNow(),
      name: body.name.trim(),
      duration_min: body.duration_min ?? null,
      volume_kg: body.volume_kg ?? null,
      notes: body.notes?.trim() || null,
      exercises: body.exercises ?? null,
      calories_burned: body.calories_burned ?? null,
      exercises_completed: body.exercises_completed ?? null,
      plan_type: body.plan_type ?? null
    })
    .select('id')
    .single()
  if (error) return errorResponse(error.message, 500, request, env)
  await postWorkoutBuddyActivity(
    { createSupabaseAdmin: () => createSupabaseAdmin(env) },
    userId,
    body.name.trim()
  )
  return jsonResponse({ id: data.id }, { status: 201 }, request, env)
}

async function handleListRoutes(env, userId, request) {
  const { data, error } = await createSupabaseAdmin(env)
    .from('routes')
    .select(
      'id, recorded_at, name, distance_km, elevation_m, duration_min, activity_type, path, steps, avg_pace_min_km, started_at, ended_at'
    )
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(50)
  if (error) return errorResponse(error.message, 500, request, env)
  return jsonResponse({ entries: data ?? [] }, { status: 200 }, request, env)
}

async function handleCreateRoute(request, env, userId) {
  const body = await readJson(request)
  if (body?.distance_km == null || body.distance_km <= 0) {
    return errorResponse('Route distance is required', 400, request, env)
  }
  const name =
    body.name?.trim() ||
    `${body.activity_type === 'walk' ? 'Walk' : body.activity_type === 'hike' ? 'Hike' : 'Run'} ${new Date().toLocaleDateString()}`
  const { data, error } = await createSupabaseAdmin(env)
    .from('routes')
    .insert({
      user_id: userId,
      recorded_at: body.recorded_at ?? body.ended_at ?? isoNow(),
      name,
      distance_km: body.distance_km,
      elevation_m: body.elevation_m ?? null,
      duration_min: body.duration_min ?? null,
      activity_type: body.activity_type ?? 'run',
      path: body.path ?? null,
      steps: body.steps ?? null,
      avg_pace_min_km: body.avg_pace_min_km ?? null,
      started_at: body.started_at ?? null,
      ended_at: body.ended_at ?? null
    })
    .select('id')
    .single()
  if (error) return errorResponse(error.message, 500, request, env)
  return jsonResponse({ id: data.id }, { status: 201 }, request, env)
}

async function handleListNutrition(env, userId, request) {
  const { data, error } = await createSupabaseAdmin(env)
    .from('nutrition_entries')
    .select('id, recorded_at, meal, calories, protein_g, carbs_g, fat_g, water_ml')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(50)
  if (error) return errorResponse(error.message, 500, request, env)
  const entries = data ?? []
  const today = todayStartIso()
  const totals = entries
    .filter((e) => e.recorded_at >= today)
    .reduce(
      (acc, e) => ({
        calories: acc.calories + (e.calories ?? 0),
        protein_g: acc.protein_g + Number(e.protein_g ?? 0),
        carbs_g: acc.carbs_g + Number(e.carbs_g ?? 0),
        fat_g: acc.fat_g + Number(e.fat_g ?? 0),
        water_ml: acc.water_ml + (e.water_ml ?? 0)
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, water_ml: 0 }
    )
  return jsonResponse({ entries, totals }, { status: 200 }, request, env)
}

async function handleCreateNutrition(request, env, userId) {
  const body = await readJson(request)
  if (!body?.meal?.trim()) return errorResponse('Meal name is required', 400, request, env)
  const { data, error } = await createSupabaseAdmin(env)
    .from('nutrition_entries')
    .insert({
      user_id: userId,
      recorded_at: body.recorded_at ?? isoNow(),
      meal: body.meal.trim(),
      calories: body.calories ?? null,
      protein_g: body.protein_g ?? null,
      carbs_g: body.carbs_g ?? null,
      fat_g: body.fat_g ?? null,
      water_ml: body.water_ml ?? 0
    })
    .select('id')
    .single()
  if (error) return errorResponse(error.message, 500, request, env)
  return jsonResponse({ id: data.id }, { status: 201 }, request, env)
}

async function handleListSleep(env, userId, request) {
  const { data, error } = await createSupabaseAdmin(env)
    .from('sleep_entries')
    .select('id, recorded_at, duration_h, quality, notes, source, started_at, ended_at')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(50)
  if (error) return errorResponse(error.message, 500, request, env)
  const entries = data ?? []
  const trend = [...entries].reverse().slice(-7).map((e) => ({
    label: weekdayLabel(e.recorded_at),
    value: Number(e.duration_h)
  }))
  return jsonResponse({ entries, trend }, { status: 200 }, request, env)
}

async function handleCreateSleep(request, env, userId) {
  const body = await readJson(request)
  if (body?.duration_h == null || body.duration_h <= 0) {
    return errorResponse('Sleep duration is required', 400, request, env)
  }
  const { data, error } = await createSupabaseAdmin(env)
    .from('sleep_entries')
    .insert({
      user_id: userId,
      recorded_at: body.recorded_at ?? body.ended_at ?? isoNow(),
      duration_h: body.duration_h,
      quality: body.quality ?? null,
      notes: body.notes?.trim() || null,
      source: body.source ?? 'manual',
      started_at: body.started_at ?? null,
      ended_at: body.ended_at ?? null
    })
    .select('id')
    .single()
  if (error) return errorResponse(error.message, 500, request, env)
  return jsonResponse({ id: data.id }, { status: 201 }, request, env)
}

async function handleGetProfile(env, userId, request) {
  const supabase = createSupabaseAdmin(env)
  const { data: user, error } = await supabase
    .from('profiles')
    .select(
      'id, email, name, avatar_url, created_at, fitness_goal, experience_level, height_cm, weight_kg, training_days, equipment, preferred_duration_min, ring_goals, reminder_preferences, buddy_privacy'
    )
    .eq('id', userId)
    .single()
  if (error || !user) return errorResponse('User not found', 404, request, env)
  const [body, workouts, routes, nutrition, sleep] = await Promise.all([
    supabase.from('body_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('routes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('nutrition_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('sleep_entries').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  ])
  return jsonResponse(
    {
      ...user,
      stats: {
        bodyEntries: body.count ?? 0,
        workouts: workouts.count ?? 0,
        routes: routes.count ?? 0,
        nutritionEntries: nutrition.count ?? 0,
        sleepEntries: sleep.count ?? 0
      }
    },
    { status: 200 },
    request,
    env
  )
}

async function handleUpdateProfile(request, env, userId) {
  const body = await readJson(request)
  if (!body) return errorResponse('Invalid body', 400, request, env)
  const name = body.name?.trim() || null
  const supabase = createSupabaseAdmin(env)
  let avatar_url = body.avatar_url
  if (avatar_url !== undefined && avatar_url !== null) {
    if (typeof avatar_url !== 'string') return errorResponse('avatar_url must be a string', 400, request, env)
    if (avatar_url.length > 600_000) return errorResponse('Avatar image is too large', 400, request, env)
    if (avatar_url && !avatar_url.startsWith('https://') && !avatar_url.startsWith('data:image/')) {
      return errorResponse('Avatar must be HTTPS URL or image data URL', 400, request, env)
    }
    if (avatar_url === '') avatar_url = null
  }

  const patch = {
    name,
    avatar_url: avatar_url ?? undefined,
    fitness_goal: body.fitness_goal ?? undefined,
    experience_level: body.experience_level ?? undefined,
    height_cm: body.height_cm ?? undefined,
    weight_kg: body.weight_kg ?? undefined,
    training_days: body.training_days ?? undefined,
    equipment: body.equipment ?? undefined,
    preferred_duration_min: body.preferred_duration_min ?? undefined,
    ring_goals: body.ring_goals ?? undefined,
    reminder_preferences: body.reminder_preferences ?? undefined,
    buddy_privacy: body.buddy_privacy ?? undefined
  }
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k])
  const { error: profileError } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (profileError) return errorResponse(profileError.message, 500, request, env)
  if (name != null) await supabase.auth.admin.updateUserById(userId, { user_metadata: { name } })
  const { data: user, error } = await supabase
    .from('profiles')
    .select(
      'id, email, name, avatar_url, fitness_goal, experience_level, height_cm, weight_kg, training_days, equipment, preferred_duration_min'
    )
    .eq('id', userId)
    .single()
  if (error || !user) return errorResponse('User not found', 404, request, env)
  return jsonResponse({ user }, { status: 200 }, request, env)
}

export default {
  async fetch(request, env) {
    const featureEnv = {
      ctx: env,
      createSupabaseAdmin: () => createSupabaseAdmin(env),
      jsonResponse,
      errorResponse,
      readJson
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) })
    }
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return errorResponse('Server misconfigured: Supabase env vars missing', 500, request, env)
    }
    const { pathname } = new URL(request.url)
    const method = request.method
    const url = new URL(request.url)
    try {
      if (pathname === '/health' && method === 'GET') {
        return jsonResponse({ ok: true, service: 'kata-kilo-api', database: 'supabase' }, { status: 200 }, request, env)
      }
      if (pathname === '/auth/signup' && method === 'POST') return handleSignUp(request, env)
      if (pathname === '/auth/signin' && method === 'POST') return handleSignIn(request, env)
      if (pathname === '/auth/refresh' && method === 'POST') return handleRefresh(request, env)
      if (pathname === '/auth/signout' && method === 'POST') return handleSignOut(request, env)
      if (pathname === '/auth/me' && method === 'GET') return handleMe(request, env)
      const user = await requireUser(request, env)
      if (user instanceof Response) return user
      if (pathname === '/dashboard' && method === 'GET') return handleDashboard(env, user.id, request)
      if (pathname === '/story/readiness' && method === 'GET') return handleReadiness(featureEnv, user.id, request)
      if (pathname === '/story/weekly-review' && method === 'GET') return handleWeeklyReview(featureEnv, user.id, request, url)
      if (pathname === '/habits' && method === 'GET') return handleGetHabits(featureEnv, user.id, request, url)
      if (pathname === '/habits/log' && method === 'POST') return handleLogHabit(request, featureEnv, user.id)
      if (pathname === '/habits/targets' && method === 'PATCH') return handleUpdateHabitTargets(request, featureEnv, user.id)
      if (pathname === '/squads/activity' && method === 'GET') return handleSquadActivity(request, featureEnv, user.id)
      if (pathname === '/squads' && method === 'GET') return handleSquadDashboard(featureEnv, user.id, request)
      if (pathname === '/squads' && method === 'POST') return handleCreateSquad(request, featureEnv, user.id)
      if (pathname === '/squads/join' && method === 'POST') return handleJoinSquad(request, featureEnv, user.id)
      if (pathname === '/squads/leave' && method === 'POST') return handleLeaveSquad(featureEnv, user.id, request)
      if (pathname === '/automation/suggestions' && method === 'GET') return handleAutomationSuggestions(featureEnv, user.id, request)
      if (pathname === '/planner/checkins' && method === 'GET') return handleListCheckins(featureEnv, user.id, request, url)
      if (pathname === '/planner/checkin' && method === 'POST') return handlePlannerCheckin(request, featureEnv, user.id)
      if (pathname === '/health/import' && method === 'POST') return handleHealthImport(request, featureEnv, user.id)
      if (pathname === '/activity/steps/sync' && method === 'POST') return handleSyncDailySteps(request, featureEnv, user.id)
      if (pathname === '/activity/steps/week' && method === 'GET') return handleGetStepWeek(featureEnv, user.id, request)
      if (pathname === '/activity/history' && method === 'GET') return handleGetActivityHistory(featureEnv, user.id, request, url)
      if (pathname === '/body' && method === 'GET') return handleListBody(env, user.id, request)
      if (pathname === '/body' && method === 'POST') return handleCreateBody(request, env, user.id)
      if (pathname === '/workouts' && method === 'GET') return handleListWorkouts(env, user.id, request)
      if (pathname === '/workouts' && method === 'POST') return handleCreateWorkout(request, env, user.id)
      if (pathname === '/workouts/weekly' && method === 'GET') return handleGetWeeklyPlan(featureEnv, user.id, request, url)
      if (pathname === '/workouts/weekly' && method === 'PUT') return handleSaveWeeklyPlan(request, featureEnv, user.id)
      if (pathname === '/search/users' && method === 'GET') return handleSearchUsers(featureEnv, user.id, request, url)
      if (pathname === '/search/workouts' && method === 'GET') return handleSearchWorkouts(featureEnv, user.id, request, url)
      if (pathname === '/buddy' && method === 'GET') return handleBuddyDashboard(featureEnv, user.id, request)
      if (pathname === '/buddy/invite' && method === 'POST') return handleBuddyInvite(request, featureEnv, user.id)
      if (pathname === '/buddy/respond' && method === 'POST') return handleBuddyRespond(request, featureEnv, user.id)
      if (pathname === '/buddy' && method === 'DELETE') return handleBuddyRemove(featureEnv, user.id, request)
      if (pathname === '/buddy/privacy' && method === 'PATCH') return handleBuddyPrivacy(request, featureEnv, user.id)
      if (pathname === '/buddy/activity' && method === 'POST') return handleBuddyActivity(request, featureEnv, user.id)
      if (pathname === '/buddy/nudge' && method === 'POST') return handleBuddyNudge(request, featureEnv, user.id)
      if (pathname === '/buddy/nudge/read' && method === 'POST') return handleBuddyNudgeRead(request, featureEnv, user.id)
      if (pathname === '/buddy/challenges' && method === 'POST') return handleBuddyChallengeCreate(request, featureEnv, user.id)
      if (pathname === '/buddy/challenges/progress' && method === 'PATCH') return handleBuddyChallengeProgress(request, featureEnv, user.id)
      if (pathname === '/reminders' && method === 'PATCH') return handleReminderPreferences(request, featureEnv, user.id)
      if (pathname === '/plans' && method === 'GET') return handleListSavedPlans(featureEnv, user.id, request)
      if (pathname === '/plans' && method === 'POST') return handleCreateSavedPlan(request, featureEnv, user.id)
      if (pathname === '/plans/import' && method === 'POST') return handleImportSharedPlan(request, featureEnv, user.id)
      if (pathname === '/plans/discover' && method === 'GET') return handleDiscoverPlans(featureEnv, user.id, request, url)
      if (pathname.startsWith('/plans/') && pathname.endsWith('/publish') && method === 'PATCH') {
        const planId = pathname.slice('/plans/'.length, -'/publish'.length)
        return handlePublishSavedPlan(request, featureEnv, user.id, planId)
      }
      if (pathname.startsWith('/plans/') && method === 'PATCH') {
        const planId = pathname.slice('/plans/'.length)
        return handleUpdateSavedPlan(request, featureEnv, user.id, planId)
      }
      if (pathname.startsWith('/plans/') && method === 'DELETE') {
        const planId = pathname.slice('/plans/'.length)
        return handleDeleteSavedPlan(featureEnv, user.id, request, planId)
      }
      if (pathname === '/buddy/share/weekly' && method === 'POST') return handleShareWeeklyPlan(request, featureEnv, user.id)
      if (pathname === '/buddy/share/plan' && method === 'POST') return handleShareSavedPlan(request, featureEnv, user.id)
      if (pathname === '/routes' && method === 'GET') return handleListRoutes(env, user.id, request)
      if (pathname === '/routes' && method === 'POST') return handleCreateRoute(request, env, user.id)
      if (pathname === '/nutrition' && method === 'GET') return handleListNutrition(env, user.id, request)
      if (pathname === '/nutrition' && method === 'POST') return handleCreateNutrition(request, env, user.id)
      if (pathname === '/meals/scan' && method === 'POST') return handleScanPlate(request, featureEnv, user.id)
      if (pathname === '/sleep' && method === 'GET') return handleListSleep(env, user.id, request)
      if (pathname === '/sleep' && method === 'POST') return handleCreateSleep(request, env, user.id)
      if (pathname === '/profile' && method === 'GET') return handleGetProfile(env, user.id, request)
      if (pathname === '/profile' && method === 'PATCH') return handleUpdateProfile(request, env, user.id)
      return errorResponse('Not found', 404, request, env)
    } catch (err) {
      console.error(err)
      return errorResponse('Internal server error', 500, request, env)
    }
  }
}
