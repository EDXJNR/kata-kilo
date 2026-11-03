const DEFAULT_KEYS = ['walk', 'stretch', 'protein']

export async function handleGetHabits(env, userId, request, url) {
  const supabase = env.createSupabaseAdmin()
  const from = url.searchParams.get('from') || daysAgo(14)
  const to = url.searchParams.get('to') || todayDate()

  const [{ data: profile }, { data: logs, error }] = await Promise.all([
    supabase.from('profiles').select('habit_targets').eq('id', userId).maybeSingle(),
    supabase
      .from('habit_logs')
      .select('habit_key, log_date, completed, value')
      .eq('user_id', userId)
      .gte('log_date', from)
      .lte('log_date', to)
      .order('log_date', { ascending: false })
  ])

  if (error) return env.errorResponse(error.message, 500, request, env.ctx)

  const targets = profile?.habit_targets ?? { walk_min: 20, stretch_min: 5, protein_g: 120 }
  const today = todayDate()
  const todayLogs = (logs ?? []).filter((l) => l.log_date === today)

  const streaks = computeStreaks(logs ?? [], DEFAULT_KEYS)

  return env.jsonResponse(
    {
      targets,
      today: todayLogs,
      logs: logs ?? [],
      streaks
    },
    { status: 200 },
    request,
    env.ctx
  )
}

export async function handleLogHabit(request, env, userId) {
  const body = await env.readJson(request)
  const habitKey = body?.habitKey?.trim()
  if (!habitKey) return env.errorResponse('habitKey is required', 400, request, env.ctx)
  const logDate = body?.logDate || todayDate()
  const completed = body?.completed !== false
  const value = body?.value != null ? Number(body.value) : null

  const supabase = env.createSupabaseAdmin()
  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(
      {
        user_id: userId,
        habit_key: habitKey,
        log_date: logDate,
        completed,
        value
      },
      { onConflict: 'user_id,habit_key,log_date' }
    )
    .select('habit_key, log_date, completed, value')
    .single()

  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ log: data }, { status: 200 }, request, env.ctx)
}

export async function handleUpdateHabitTargets(request, env, userId) {
  const body = await env.readJson(request)
  if (!body) return env.errorResponse('Invalid body', 400, request, env.ctx)
  const targets = {
    walk_min: Number(body.walk_min ?? body.walkMin) || 20,
    stretch_min: Number(body.stretch_min ?? body.stretchMin) || 5,
    protein_g: Number(body.protein_g ?? body.proteinG) || 120
  }
  const supabase = env.createSupabaseAdmin()
  const { error } = await supabase.from('profiles').update({ habit_targets: targets }).eq('id', userId)
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ targets }, { status: 200 }, request, env.ctx)
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgo(n) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

function computeStreaks(logs, keys) {
  const byKey = new Map()
  for (const k of keys) byKey.set(k, new Set())
  for (const row of logs) {
    if (row.completed) byKey.get(row.habit_key)?.add(row.log_date)
  }
  const streaks = {}
  for (const key of keys) {
    const dates = byKey.get(key) ?? new Set()
    streaks[key] = countStreakFromToday(dates)
  }
  return streaks
}

function countStreakFromToday(completedDates) {
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10)
    if (!completedDates.has(key)) break
    streak++
    d.setUTCDate(d.getUTCDate() - 1)
  }
  return streak
}
