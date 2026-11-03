export async function handleAutomationSuggestions(env, userId, request) {
  const supabase = env.createSupabaseAdmin()
  const since = daysAgoIso(14)

  const [{ data: profile }, { data: workouts }, { data: nutritionToday }] = await Promise.all([
    supabase.from('profiles').select('weight_kg, habit_targets, training_days, preferred_duration_min').eq('id', userId).maybeSingle(),
    supabase
      .from('workouts')
      .select('name, exercises, recorded_at, duration_min')
      .eq('user_id', userId)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false })
      .limit(20),
    supabase
      .from('nutrition_entries')
      .select('protein_g')
      .eq('user_id', userId)
      .gte('recorded_at', `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`)
  ])

  const weight = profile?.weight_kg != null ? Number(profile.weight_kg) : 70
  const proteinTarget = Number(profile?.habit_targets?.protein_g) || Math.round(weight * 1.6)
  const proteinToday = (nutritionToday ?? []).reduce((s, r) => s + (Number(r.protein_g) || 0), 0)

  const overload = []
  for (const w of workouts ?? []) {
    const exercises = w.exercises
    if (!Array.isArray(exercises)) continue
    for (const ex of exercises) {
      if (!ex?.exerciseId || !Array.isArray(ex.sets) || ex.sets.length === 0) continue
      const top = ex.sets.reduce((best, set) => {
        const vol = (set.weightKg ?? 0) * (set.reps ?? 0)
        return vol > best.vol ? { vol, weightKg: set.weightKg, reps: set.reps } : best
      }, { vol: 0, weightKg: 0, reps: 0 })
      if (top.weightKg > 0) {
        overload.push({
          exerciseId: ex.exerciseId,
          lastWeightKg: top.weightKg,
          lastReps: top.reps,
          suggestion: `Try ${top.weightKg} kg × ${top.reps + 1} or ${top.weightKg + 2.5} kg × ${top.reps}`
        })
      }
    }
    if (overload.length >= 5) break
  }

  return env.jsonResponse(
    {
      nutrition: {
        proteinTargetG: proteinTarget,
        proteinTodayG: Math.round(proteinToday),
        note:
          proteinToday < proteinTarget * 0.5
            ? 'Add a protein-rich meal or snack to hit your recovery target.'
            : 'Protein on track for today.'
      },
      progressiveOverload: overload.slice(0, 5),
      plannerHint: {
        trainingDays: profile?.training_days ?? [1, 3, 5],
        preferredDurationMin: profile?.preferred_duration_min ?? 45
      }
    },
    { status: 200 },
    request,
    env.ctx
  )
}

export async function handlePlannerCheckin(request, env, userId) {
  const body = await env.readJson(request)
  if (!body?.weekStart || body.weekday == null) {
    return env.errorResponse('weekStart and weekday are required', 400, request, env.ctx)
  }
  const supabase = env.createSupabaseAdmin()
  const { data, error } = await supabase
    .from('planner_checkins')
    .upsert(
      {
        user_id: userId,
        week_start: body.weekStart,
        weekday: Number(body.weekday),
        checked_in_at: new Date().toISOString()
      },
      { onConflict: 'user_id,week_start,weekday' }
    )
    .select('week_start, weekday, checked_in_at')
    .single()
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ checkin: data }, { status: 200 }, request, env.ctx)
}

export async function handleListCheckins(env, userId, request, url) {
  const weekStart = url.searchParams.get('week')
  if (!weekStart) return env.errorResponse('week query required', 400, request, env.ctx)
  const supabase = env.createSupabaseAdmin()
  const { data, error } = await supabase
    .from('planner_checkins')
    .select('weekday, checked_in_at')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ checkins: data ?? [] }, { status: 200 }, request, env.ctx)
}

export async function handleHealthImport(request, env, userId) {
  const body = await env.readJson(request)
  const provider = body?.provider?.trim()
  const payload = body?.payload
  if (!provider || !payload) return env.errorResponse('provider and payload required', 400, request, env.ctx)

  const supabase = env.createSupabaseAdmin()
  await supabase.from('health_imports').insert({ user_id: userId, provider, payload })

  let imported = { sleep: 0, steps: 0, routes: 0 }

  if (provider === 'manual' && typeof payload === 'object') {
    if (payload.sleep?.duration_h != null) {
      const { error } = await supabase.from('sleep_entries').insert({
        user_id: userId,
        duration_h: Number(payload.sleep.duration_h),
        quality: payload.sleep.quality != null ? Number(payload.sleep.quality) : null,
        notes: payload.sleep.notes ?? 'Health import',
        source: 'health_import'
      })
      if (!error) imported.sleep += 1
    }
    if (payload.steps != null && Number(payload.steps) > 0) {
      const km = Math.round((Number(payload.steps) / 1300) * 10) / 10
      const { error } = await supabase.from('routes').insert({
        user_id: userId,
        name: 'Imported walk',
        distance_km: km,
        duration_min: payload.walk_min != null ? Number(payload.walk_min) : Math.round(km * 12),
        steps: Number(payload.steps),
        activity_type: 'walk'
      })
      if (!error) imported.routes += 1
      imported.steps = Number(payload.steps)
    }
  }

  return env.jsonResponse({ ok: true, imported }, { status: 200 }, request, env.ctx)
}

function daysAgoIso(days) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

function todayDateUtc() {
  return new Date().toISOString().slice(0, 10)
}

export async function handleSyncDailySteps(request, env, userId) {
  const body = await env.readJson(request)
  const logDate = body?.date || todayDateUtc()
  const steps = Math.max(0, Math.round(Number(body?.steps) || 0))
  const distanceKm = body?.distanceKm != null ? Number(body.distanceKm) : null
  if (steps === 0) return env.errorResponse('steps required', 400, request, env.ctx)

  const supabase = env.createSupabaseAdmin()
  const { data: existing } = await supabase
    .from('daily_steps')
    .select('steps')
    .eq('user_id', userId)
    .eq('log_date', logDate)
    .maybeSingle()

  const mergedSteps = Math.max(existing?.steps ?? 0, steps)
  const { error } = await supabase.from('daily_steps').upsert(
    {
      user_id: userId,
      log_date: logDate,
      steps: mergedSteps,
      distance_km: distanceKm,
      source: 'auto',
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id,log_date' }
  )
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ steps: mergedSteps, date: logDate }, { status: 200 }, request, env.ctx)
}

export async function handleGetStepWeek(env, userId, request) {
  const supabase = env.createSupabaseAdmin()
  const since = daysAgoIso(6).slice(0, 10)
  const { data, error } = await supabase
    .from('daily_steps')
    .select('log_date, steps')
    .eq('user_id', userId)
    .gte('log_date', since)
    .order('log_date', { ascending: true })
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ days: data ?? [] }, { status: 200 }, request, env.ctx)
}

export async function handleGetActivityHistory(env, userId, request, url) {
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  if (!from || !to) return env.errorResponse('from and to query params required (YYYY-MM-DD)', 400, request, env.ctx)

  const supabase = env.createSupabaseAdmin()
  const [{ data: stepsRows, error: stepsErr }, { data: workouts, error: wErr }] = await Promise.all([
    supabase
      .from('daily_steps')
      .select('log_date, steps, distance_km')
      .eq('user_id', userId)
      .gte('log_date', from)
      .lte('log_date', to)
      .order('log_date', { ascending: true }),
    supabase
      .from('workouts')
      .select('recorded_at, duration_min')
      .eq('user_id', userId)
      .gte('recorded_at', `${from}T00:00:00.000Z`)
      .lte('recorded_at', `${to}T23:59:59.999Z`)
  ])
  if (stepsErr) return env.errorResponse(stepsErr.message, 500, request, env.ctx)
  if (wErr) return env.errorResponse(wErr.message, 500, request, env.ctx)

  const byDate = new Map()
  for (const row of stepsRows ?? []) {
    byDate.set(row.log_date, {
      date: row.log_date,
      steps: row.steps ?? 0,
      distanceKm: row.distance_km != null ? Number(row.distance_km) : 0,
      trainMin: 0
    })
  }
  for (const w of workouts ?? []) {
    const date = typeof w.recorded_at === 'string' ? w.recorded_at.slice(0, 10) : null
    if (!date) continue
    const cur = byDate.get(date) ?? { date, steps: 0, distanceKm: 0, trainMin: 0 }
    cur.trainMin += Number(w.duration_min) || 0
    byDate.set(date, cur)
  }

  const days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  return env.jsonResponse({ days }, { status: 200 }, request, env.ctx)
}
