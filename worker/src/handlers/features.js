const WEEKDAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function mondayOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dayNum = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dayNum}`
}

export function emptyWeekDays() {
  return WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    isRest: false,
    workoutName: null,
    workoutType: null,
    durationMin: null,
    intensity: null,
    planId: null,
    exercises: null,
    reminderTime: null
  }))
}

export function normalizeDays(days) {
  const base = emptyWeekDays()
  if (!Array.isArray(days)) return base
  return base.map((d, i) => {
    const incoming = days.find((x) => x?.weekday === i) ?? days[i]
    if (!incoming || typeof incoming !== 'object') return d
    return {
      weekday: i,
      label: WEEKDAY_LABELS[i],
      isRest: Boolean(incoming.isRest),
      workoutName: incoming.workoutName?.trim() || null,
      workoutType: incoming.workoutType?.trim() || null,
      durationMin: incoming.durationMin != null ? Number(incoming.durationMin) : null,
      intensity: incoming.intensity?.trim() || null,
      planId: incoming.planId?.trim() || null,
      exercises: incoming.exercises ?? null,
      reminderTime: typeof incoming.reminderTime === 'string' && incoming.reminderTime.trim() ? incoming.reminderTime.trim() : null
    }
  })
}

export async function handleGetWeeklyPlan(env, userId, request, url) {
  const weekStart = url.searchParams.get('week') || mondayOfWeek()
  const supabase = env.createSupabaseAdmin()
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('id, week_start, days, updated_at')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse(
    {
      weekStart,
      plan: data
        ? { id: data.id, weekStart: data.week_start, days: normalizeDays(data.days), updatedAt: data.updated_at }
        : { id: null, weekStart, days: emptyWeekDays(), updatedAt: null }
    },
    { status: 200 },
    request,
    env.ctx
  )
}

export async function handleSaveWeeklyPlan(request, env, userId) {
  const body = await env.readJson(request)
  if (!body?.weekStart) return env.errorResponse('weekStart is required', 400, request, env.ctx)
  const days = normalizeDays(body.days)
  const supabase = env.createSupabaseAdmin()
  const { data, error } = await supabase
    .from('weekly_plans')
    .upsert(
      {
        user_id: userId,
        week_start: body.weekStart,
        days,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,week_start' }
    )
    .select('id, week_start, days, updated_at')
    .single()
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse(
    { id: data.id, weekStart: data.week_start, days: normalizeDays(data.days), updatedAt: data.updated_at },
    { status: 200 },
    request,
    env.ctx
  )
}

function pairIds(userA, userB) {
  return userA < userB ? [userA, userB] : [userB, userA]
}

export async function getBuddyPair(supabase, userId) {
  const { data } = await supabase
    .from('buddy_pairs')
    .select('id, user_a_id, user_b_id, created_at')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .maybeSingle()
  return data
}

export async function getBuddyUserId(pair, userId) {
  if (!pair) return null
  return pair.user_a_id === userId ? pair.user_b_id : pair.user_a_id
}

async function profileBrief(supabase, id) {
  const { data } = await supabase.from('profiles').select('id, email, name').eq('id', id).maybeSingle()
  return data
}

export async function handleBuddyDashboard(env, userId, request) {
  const supabase = env.createSupabaseAdmin()
  const pair = await getBuddyPair(supabase, userId)
  const { data: profile } = await supabase
    .from('profiles')
    .select('buddy_privacy, reminder_preferences')
    .eq('id', userId)
    .single()

  const { data: incoming } = await supabase
    .from('buddy_requests')
    .select('id, from_user_id, status, created_at')
    .eq('to_user_id', userId)
    .eq('status', 'pending')

  const { data: outgoing } = await supabase
    .from('buddy_requests')
    .select('id, to_user_id, status, created_at')
    .eq('from_user_id', userId)
    .eq('status', 'pending')

  let buddy = null
  let activities = []
  let challenges = []
  let nudges = []
  let buddyStats = null

  if (pair) {
    const buddyId = await getBuddyUserId(pair, userId)
    buddy = await profileBrief(supabase, buddyId)

    const { data: acts } = await supabase
      .from('buddy_activities')
      .select('id, user_id, activity_type, message, metadata, created_at')
      .eq('pair_id', pair.id)
      .order('created_at', { ascending: false })
      .limit(30)
    activities = acts ?? []

    const { data: ch } = await supabase
      .from('buddy_challenges')
      .select('id, created_by, name, goal_type, goal_value, start_date, end_date, status, created_at')
      .eq('pair_id', pair.id)
      .order('created_at', { ascending: false })
    challenges = ch ?? []

    if (challenges.length) {
      const ids = challenges.map((c) => c.id)
      const { data: prog } = await supabase
        .from('buddy_challenge_progress')
        .select('challenge_id, user_id, progress_value')
        .in('challenge_id', ids)
      for (const c of challenges) {
        c.progress = (prog ?? []).filter((p) => p.challenge_id === c.id)
      }
    }

    const { data: ndg } = await supabase
      .from('buddy_nudges')
      .select('id, from_user_id, message, read_at, created_at')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    nudges = ndg ?? []

    buddyStats = await computeBuddyStats(supabase, buddyId, pair.id)
  }

  const myStats = await computeBuddyStats(supabase, userId, pair?.id)

  return env.jsonResponse(
    {
      pair: pair ? { id: pair.id, since: pair.created_at } : null,
      buddy,
      privacy: profile?.buddy_privacy ?? {},
      reminderPreferences: profile?.reminder_preferences ?? { enabled: false, time: '08:00' },
      incomingRequests: incoming ?? [],
      outgoingRequests: outgoing ?? [],
      activities,
      challenges,
      nudges,
      myStats,
      buddyStats
    },
    { status: 200 },
    request,
    env.ctx
  )
}

async function computeBuddyStats(supabase, userId, pairId) {
  const since = new Date()
  since.setDate(since.getDate() - 7)
  const sinceIso = since.toISOString()

  const [{ count: workoutsWeek }, { data: workouts }, { data: profile }] = await Promise.all([
    supabase.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('recorded_at', sinceIso),
    supabase.from('workouts').select('recorded_at').eq('user_id', userId).order('recorded_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('name, email').eq('id', userId).maybeSingle()
  ])

  const dates = [...new Set((workouts ?? []).map((w) => w.recorded_at.slice(0, 10)))]
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (dates.includes(key)) streak++
    else if (i > 0) break
  }

  return {
    userId,
    name: profile?.name ?? profile?.email ?? 'Athlete',
    workoutsThisWeek: workoutsWeek ?? 0,
    currentStreak: streak,
    totalWorkouts: workouts?.length ?? 0
  }
}

export async function handleBuddyInvite(request, env, userId) {
  const body = await env.readJson(request)
  const email = body?.email?.trim()?.toLowerCase()
  if (!email) return env.errorResponse('Email is required', 400, request, env.ctx)

  const supabase = env.createSupabaseAdmin()
  const existingPair = await getBuddyPair(supabase, userId)
  if (existingPair) return env.errorResponse('You already have a buddy. Remove them first.', 400, request, env.ctx)

  const { data: target } = await supabase.from('profiles').select('id, email, name').eq('email', email).maybeSingle()
  if (!target) return env.errorResponse('No user found with that email', 404, request, env.ctx)
  if (target.id === userId) return env.errorResponse('You cannot invite yourself', 400, request, env.ctx)

  const { data, error } = await supabase
    .from('buddy_requests')
    .upsert({ from_user_id: userId, to_user_id: target.id, status: 'pending' }, { onConflict: 'from_user_id,to_user_id' })
    .select('id')
    .single()
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ id: data.id, to: target }, { status: 201 }, request, env.ctx)
}

export async function handleBuddyRespond(request, env, userId) {
  const body = await env.readJson(request)
  if (!body?.requestId || !['accepted', 'declined'].includes(body.action)) {
    return env.errorResponse('Invalid request', 400, request, env.ctx)
  }
  const supabase = env.createSupabaseAdmin()
  const { data: req } = await supabase
    .from('buddy_requests')
    .select('id, from_user_id, to_user_id, status')
    .eq('id', body.requestId)
    .eq('to_user_id', userId)
    .maybeSingle()
  if (!req || req.status !== 'pending') return env.errorResponse('Request not found', 404, request, env.ctx)

  await supabase.from('buddy_requests').update({ status: body.action }).eq('id', req.id)

  if (body.action === 'accepted') {
    const [userA, userB] = pairIds(req.from_user_id, req.to_user_id)
    await supabase.from('buddy_pairs').upsert({ user_a_id: userA, user_b_id: userB }, { onConflict: 'user_a_id,user_b_id' })
    await supabase.from('buddy_requests').delete().neq('id', req.id).or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
  }
  return env.jsonResponse({ ok: true }, { status: 200 }, request, env.ctx)
}

export async function handleBuddyRemove(env, userId, request) {
  const supabase = env.createSupabaseAdmin()
  const pair = await getBuddyPair(supabase, userId)
  if (!pair) return env.errorResponse('No buddy to remove', 404, request, env.ctx)
  await supabase.from('buddy_pairs').delete().eq('id', pair.id)
  return env.jsonResponse({ ok: true }, { status: 200 }, request, env.ctx)
}

export async function handleBuddyPrivacy(request, env, userId) {
  const body = await env.readJson(request)
  if (!body) return env.errorResponse('Invalid body', 400, request, env.ctx)
  const supabase = env.createSupabaseAdmin()
  const { error } = await supabase.from('profiles').update({ buddy_privacy: body }).eq('id', userId)
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ privacy: body }, { status: 200 }, request, env.ctx)
}

export async function handleBuddyActivity(request, env, userId) {
  const body = await env.readJson(request)
  if (!body?.activityType || !body?.message?.trim()) {
    return env.errorResponse('activityType and message are required', 400, request, env.ctx)
  }
  const supabase = env.createSupabaseAdmin()
  const pair = await getBuddyPair(supabase, userId)
  if (!pair) return env.errorResponse('No buddy connected', 400, request, env.ctx)

  const { data, error } = await supabase
    .from('buddy_activities')
    .insert({
      user_id: userId,
      pair_id: pair.id,
      activity_type: body.activityType,
      message: body.message.trim(),
      metadata: body.metadata ?? {}
    })
    .select('id, created_at')
    .single()
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ id: data.id, createdAt: data.created_at }, { status: 201 }, request, env.ctx)
}

export async function handleBuddyNudge(request, env, userId) {
  const body = await env.readJson(request)
  const message = body?.message?.trim()
  if (!message) return env.errorResponse('Message is required', 400, request, env.ctx)

  const supabase = env.createSupabaseAdmin()
  const pair = await getBuddyPair(supabase, userId)
  if (!pair) return env.errorResponse('No buddy connected', 400, request, env.ctx)
  const buddyId = await getBuddyUserId(pair, userId)

  const { data, error } = await supabase
    .from('buddy_nudges')
    .insert({ from_user_id: userId, to_user_id: buddyId, message })
    .select('id, created_at')
    .single()
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ id: data.id, createdAt: data.created_at }, { status: 201 }, request, env.ctx)
}

export async function handleBuddyNudgeRead(request, env, userId) {
  const body = await env.readJson(request)
  const supabase = env.createSupabaseAdmin()
  if (body?.nudgeId) {
    await supabase.from('buddy_nudges').update({ read_at: new Date().toISOString() }).eq('id', body.nudgeId).eq('to_user_id', userId)
  } else {
    await supabase.from('buddy_nudges').update({ read_at: new Date().toISOString() }).eq('to_user_id', userId).is('read_at', null)
  }
  return env.jsonResponse({ ok: true }, { status: 200 }, request, env.ctx)
}

export async function handleBuddyChallengeCreate(request, env, userId) {
  const body = await env.readJson(request)
  if (!body?.name?.trim() || !body?.goalType || body?.goalValue == null || !body?.startDate || !body?.endDate) {
    return env.errorResponse('Missing challenge fields', 400, request, env.ctx)
  }
  const supabase = env.createSupabaseAdmin()
  const pair = await getBuddyPair(supabase, userId)
  if (!pair) return env.errorResponse('No buddy connected', 400, request, env.ctx)

  const { data: ch, error } = await supabase
    .from('buddy_challenges')
    .insert({
      pair_id: pair.id,
      created_by: userId,
      name: body.name.trim(),
      goal_type: body.goalType,
      goal_value: body.goalValue,
      start_date: body.startDate,
      end_date: body.endDate
    })
    .select('id')
    .single()
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)

  await supabase.from('buddy_challenge_progress').insert([
    { challenge_id: ch.id, user_id: pair.user_a_id, progress_value: 0 },
    { challenge_id: ch.id, user_id: pair.user_b_id, progress_value: 0 }
  ])

  return env.jsonResponse({ id: ch.id }, { status: 201 }, request, env.ctx)
}

export async function handleBuddyChallengeProgress(request, env, userId) {
  const body = await env.readJson(request)
  if (!body?.challengeId || body?.progressValue == null) {
    return env.errorResponse('challengeId and progressValue required', 400, request, env.ctx)
  }
  const supabase = env.createSupabaseAdmin()
  const { error } = await supabase
    .from('buddy_challenge_progress')
    .upsert(
      { challenge_id: body.challengeId, user_id: userId, progress_value: body.progressValue, updated_at: new Date().toISOString() },
      { onConflict: 'challenge_id,user_id' }
    )
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ ok: true }, { status: 200 }, request, env.ctx)
}

export async function handleSearchUsers(env, userId, request, url) {
  const q = url.searchParams.get('q')?.trim()?.toLowerCase()
  if (!q || q.length < 2) return env.jsonResponse({ users: [] }, { status: 200 }, request, env.ctx)
  const supabase = env.createSupabaseAdmin()
  const { data } = await supabase
    .from('profiles')
    .select('id, email, name')
    .or(`email.ilike.%${q}%,name.ilike.%${q}%`)
    .neq('id', userId)
    .limit(8)
  return env.jsonResponse({ users: data ?? [] }, { status: 200 }, request, env.ctx)
}

export async function handleSearchWorkouts(env, userId, request, url) {
  const q = url.searchParams.get('q')?.trim()?.toLowerCase()
  if (!q) return env.jsonResponse({ workouts: [] }, { status: 200 }, request, env.ctx)
  const supabase = env.createSupabaseAdmin()
  const { data } = await supabase
    .from('workouts')
    .select('id, name, recorded_at, duration_min, plan_type')
    .eq('user_id', userId)
    .ilike('name', `%${q}%`)
    .order('recorded_at', { ascending: false })
    .limit(10)
  return env.jsonResponse({ workouts: data ?? [] }, { status: 200 }, request, env.ctx)
}

export async function postWorkoutBuddyActivity(env, userId, workoutName) {
  try {
    const supabase = env.createSupabaseAdmin()
    const { data: profile } = await supabase.from('profiles').select('buddy_privacy').eq('id', userId).maybeSingle()
    if (!profile?.buddy_privacy?.workouts) return
    const pair = await getBuddyPair(supabase, userId)
    if (!pair) return
    await supabase.from('buddy_activities').insert({
      user_id: userId,
      pair_id: pair.id,
      activity_type: 'workout_completed',
      message: `I completed today's workout 💪 — ${workoutName}`,
      metadata: { workoutName }
    })
  } catch (e) {
    console.error('buddy activity post failed', e)
  }
}

export async function handleReminderPreferences(request, env, userId) {
  const body = await env.readJson(request)
  if (!body) return env.errorResponse('Invalid body', 400, request, env.ctx)
  const prefs = {
    enabled: Boolean(body.enabled),
    time: typeof body.time === 'string' ? body.time : '08:00'
  }
  const supabase = env.createSupabaseAdmin()
  const { error } = await supabase.from('profiles').update({ reminder_preferences: prefs }).eq('id', userId)
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ reminderPreferences: prefs }, { status: 200 }, request, env.ctx)
}

function mapSavedPlan(row, author) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    durationMin: row.duration_min,
    color: row.color,
    exercises: row.exercises ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isCustom: true,
    isPublic: Boolean(row.is_public),
    authorName: author?.name ?? author?.email ?? null
  }
}

export async function handleListSavedPlans(env, userId, request) {
  const supabase = env.createSupabaseAdmin()
  const { data, error } = await supabase
    .from('saved_plans')
    .select('id, name, description, category, duration_min, color, exercises, created_at, updated_at, is_public')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ plans: (data ?? []).map((r) => mapSavedPlan(r)) }, { status: 200 }, request, env.ctx)
}

export async function handleDiscoverPlans(env, userId, request, url) {
  const q = url.searchParams.get('q')?.trim()?.toLowerCase()
  const supabase = env.createSupabaseAdmin()
  let query = supabase
    .from('saved_plans')
    .select('id, name, description, category, duration_min, color, exercises, created_at, updated_at, is_public, user_id')
    .eq('is_public', true)
    .neq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(24)
  if (q) query = query.ilike('name', `%${q}%`)
  const { data, error } = await query
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  const authorIds = [...new Set((data ?? []).map((r) => r.user_id))]
  const authors = new Map()
  if (authorIds.length) {
    const { data: profiles } = await supabase.from('profiles').select('id, name, email').in('id', authorIds)
    for (const p of profiles ?? []) authors.set(p.id, p)
  }
  return env.jsonResponse(
    {
      plans: (data ?? []).map((r) => {
        const { user_id, ...rest } = r
        return mapSavedPlan(rest, authors.get(user_id))
      })
    },
    { status: 200 },
    request,
    env.ctx
  )
}

export async function handlePublishSavedPlan(request, env, userId, planId) {
  const body = await env.readJson(request)
  const isPublic = Boolean(body?.isPublic)
  const supabase = env.createSupabaseAdmin()
  const { data, error } = await supabase
    .from('saved_plans')
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('id', planId)
    .eq('user_id', userId)
    .select('id, name, description, category, duration_min, color, exercises, created_at, updated_at, is_public')
    .single()
  if (error || !data) return env.errorResponse('Plan not found', 404, request, env.ctx)
  return env.jsonResponse(mapSavedPlan(data), { status: 200 }, request, env.ctx)
}

export async function handleCreateSavedPlan(request, env, userId) {
  const body = await env.readJson(request)
  if (!body?.name?.trim()) return env.errorResponse('Plan name is required', 400, request, env.ctx)
  if (!Array.isArray(body.exercises) || body.exercises.length === 0) {
    return env.errorResponse('Add at least one exercise', 400, request, env.ctx)
  }
  const supabase = env.createSupabaseAdmin()
  const { data, error } = await supabase
    .from('saved_plans')
    .insert({
      user_id: userId,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      category: body.category ?? 'custom',
      duration_min: body.durationMin ?? 45,
      color: body.color ?? '#D4AF37',
      exercises: body.exercises
    })
    .select('id, name, description, category, duration_min, color, exercises, created_at, updated_at')
    .single()
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse(mapSavedPlan(data), { status: 201 }, request, env.ctx)
}

export async function handleUpdateSavedPlan(request, env, userId, planId) {
  const body = await env.readJson(request)
  if (!body) return env.errorResponse('Invalid body', 400, request, env.ctx)
  const supabase = env.createSupabaseAdmin()
  const patch = {
    name: body.name?.trim() ?? undefined,
    description: body.description?.trim() ?? undefined,
    category: body.category ?? undefined,
    duration_min: body.durationMin ?? undefined,
    color: body.color ?? undefined,
    exercises: body.exercises ?? undefined,
    updated_at: new Date().toISOString()
  }
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k])
  const { data, error } = await supabase
    .from('saved_plans')
    .update(patch)
    .eq('id', planId)
    .eq('user_id', userId)
    .select('id, name, description, category, duration_min, color, exercises, created_at, updated_at')
    .single()
  if (error || !data) return env.errorResponse('Plan not found', 404, request, env.ctx)
  return env.jsonResponse(mapSavedPlan(data), { status: 200 }, request, env.ctx)
}

export async function handleDeleteSavedPlan(env, userId, request, planId) {
  const supabase = env.createSupabaseAdmin()
  const { error } = await supabase.from('saved_plans').delete().eq('id', planId).eq('user_id', userId)
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ ok: true }, { status: 200 }, request, env.ctx)
}

export async function handleImportSharedPlan(request, env, userId) {
  const body = await env.readJson(request)
  const plan = body?.plan
  if (!plan?.name || !Array.isArray(plan.exercises)) {
    return env.errorResponse('Invalid plan data', 400, request, env.ctx)
  }
  const supabase = env.createSupabaseAdmin()
  const { data, error } = await supabase
    .from('saved_plans')
    .insert({
      user_id: userId,
      name: `${plan.name} (from buddy)`,
      description: plan.description ?? 'Shared by your buddy',
      category: plan.category ?? 'custom',
      duration_min: plan.durationMin ?? plan.duration_min ?? 45,
      color: plan.color ?? '#D4AF37',
      exercises: plan.exercises
    })
    .select('id, name, description, category, duration_min, color, exercises, created_at, updated_at')
    .single()
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse(mapSavedPlan(data), { status: 201 }, request, env.ctx)
}

async function insertBuddyShare(supabase, userId, activityType, message, metadata) {
  const pair = await getBuddyPair(supabase, userId)
  if (!pair) return { error: 'No buddy connected' }
  const { data, error } = await supabase
    .from('buddy_activities')
    .insert({
      user_id: userId,
      pair_id: pair.id,
      activity_type: activityType,
      message,
      metadata
    })
    .select('id, created_at')
    .single()
  if (error) return { error: error.message }
  return { data }
}

export async function handleShareWeeklyPlan(request, env, userId) {
  const body = await env.readJson(request)
  const weekStart = body?.weekStart || mondayOfWeek()
  const supabase = env.createSupabaseAdmin()
  const { data: weekly } = await supabase
    .from('weekly_plans')
    .select('week_start, days')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()
  const days = normalizeDays(weekly?.days ?? [])
  const summary = days
    .map((d) => (d.isRest ? `${d.label}: Rest` : d.workoutName ? `${d.label}: ${d.workoutName}` : null))
    .filter(Boolean)
    .join(' · ')
  const result = await insertBuddyShare(supabase, userId, 'weekly_plan_shared', `Shared my weekly plan 📅 — ${summary || 'This week'}`, {
    weekStart,
    days
  })
  if (result.error) return env.errorResponse(result.error, 400, request, env.ctx)
  return env.jsonResponse({ id: result.data.id }, { status: 201 }, request, env.ctx)
}

export async function handleShareSavedPlan(request, env, userId) {
  const body = await env.readJson(request)
  if (!body?.planId) return env.errorResponse('planId is required', 400, request, env.ctx)
  const supabase = env.createSupabaseAdmin()
  const { data: plan } = await supabase
    .from('saved_plans')
    .select('id, name, description, category, duration_min, color, exercises')
    .eq('id', body.planId)
    .eq('user_id', userId)
    .maybeSingle()
  if (!plan) return env.errorResponse('Plan not found', 404, request, env.ctx)
  const snapshot = mapSavedPlan(plan)
  const result = await insertBuddyShare(
    supabase,
    userId,
    'training_plan_shared',
    `Shared a training plan for you to try 💪 — ${plan.name}`,
    { plan: snapshot }
  )
  if (result.error) return env.errorResponse(result.error, 400, request, env.ctx)
  return env.jsonResponse({ id: result.data.id }, { status: 201 }, request, env.ctx)
}
