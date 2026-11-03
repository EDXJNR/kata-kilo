function dayKey(iso) {
  return iso.slice(0, 10)
}

function daysAgoIso(days) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

function weekStartIso() {
  return daysAgoIso(7)
}

function mondayOfWeekIso() {
  const d = new Date()
  const day = d.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().slice(0, 10)
}

export async function handleReadiness(env, userId, request) {
  const supabase = env.createSupabaseAdmin()
  const sinceWeek = weekStartIso()
  const since2d = daysAgoIso(2)
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: profile }, { data: sleepRows }, { data: workoutsRecent }, { data: nutritionToday }, { data: habitToday }] =
    await Promise.all([
      supabase.from('profiles').select('habit_targets, weight_kg').eq('id', userId).maybeSingle(),
      supabase
        .from('sleep_entries')
        .select('duration_h, recorded_at')
        .eq('user_id', userId)
        .gte('recorded_at', daysAgoIso(3))
        .order('recorded_at', { ascending: false })
        .limit(3),
      supabase.from('workouts').select('recorded_at, duration_min').eq('user_id', userId).gte('recorded_at', since2d),
      supabase
        .from('nutrition_entries')
        .select('protein_g')
        .eq('user_id', userId)
        .gte('recorded_at', `${today}T00:00:00.000Z`),
      supabase
        .from('habit_logs')
        .select('habit_key, completed')
        .eq('user_id', userId)
        .eq('log_date', today)
    ])

  const targets = profile?.habit_targets ?? { walk_min: 20, stretch_min: 5, protein_g: 120 }
  const lastSleep = sleepRows?.[0]?.duration_h != null ? Number(sleepRows[0].duration_h) : null
  const proteinToday = (nutritionToday ?? []).reduce((s, r) => s + (Number(r.protein_g) || 0), 0)
  const proteinTarget = Number(targets.protein_g) || 120
  const recentSessions = workoutsRecent?.length ?? 0
  const recentMinutes = (workoutsRecent ?? []).reduce((s, r) => s + (r.duration_min ?? 0), 0)

  let score = 72
  const factors = []

  if (lastSleep == null) {
    score -= 8
    factors.push({ label: 'Sleep', impact: 'neutral', detail: 'No recent sleep log' })
  } else if (lastSleep < 6) {
    score -= 18
    factors.push({ label: 'Sleep', impact: 'low', detail: `${lastSleep}h — prioritize rest` })
  } else if (lastSleep >= 7 && lastSleep <= 9) {
    score += 10
    factors.push({ label: 'Sleep', impact: 'good', detail: `${lastSleep}h — well recovered` })
  } else {
    factors.push({ label: 'Sleep', impact: 'neutral', detail: `${lastSleep}h logged` })
  }

  if (recentSessions >= 2 && recentMinutes >= 90) {
    score -= 12
    factors.push({ label: 'Training load', impact: 'low', detail: 'Heavy last 48h — consider lighter work' })
  } else if (recentSessions === 0) {
    score += 4
    factors.push({ label: 'Training load', impact: 'good', detail: 'Fresh for a quality session' })
  } else {
    factors.push({ label: 'Training load', impact: 'neutral', detail: `${recentSessions} session(s) in 48h` })
  }

  const proteinRatio = proteinTarget > 0 ? proteinToday / proteinTarget : 0
  if (proteinRatio >= 0.8) {
    score += 8
    factors.push({ label: 'Protein', impact: 'good', detail: `${Math.round(proteinToday)}g / ${proteinTarget}g` })
  } else if (proteinRatio > 0) {
    factors.push({ label: 'Protein', impact: 'neutral', detail: `${Math.round(proteinToday)}g / ${proteinTarget}g` })
  } else {
    score -= 4
    factors.push({ label: 'Protein', impact: 'low', detail: 'Log meals to fuel recovery' })
  }

  const habitsDone = (habitToday ?? []).filter((h) => h.completed).length
  if (habitsDone >= 2) score += 6

  score = Math.max(0, Math.min(100, Math.round(score)))
  let recommendation = 'moderate'
  if (score < 45 || (lastSleep != null && lastSleep < 6)) recommendation = 'rest'
  else if (score >= 75 && recentSessions < 2) recommendation = 'train'

  return env.jsonResponse(
    {
      score,
      recommendation,
      factors,
      hints: {
        proteinTargetG: proteinTarget,
        proteinTodayG: Math.round(proteinToday),
        lastSleepHours: lastSleep
      }
    },
    { status: 200 },
    request,
    env.ctx
  )
}

export async function handleWeeklyReview(env, userId, request, url) {
  const supabase = env.createSupabaseAdmin()
  const weekStart = url.searchParams.get('week') || mondayOfWeekIso()
  const since = weekStartIso()

  const [
    { count: workoutsWeek },
    { data: weightStart },
    { data: weightEnd },
    { data: checkins },
    { data: habits },
    { data: challenges }
  ] = await Promise.all([
    supabase.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('recorded_at', since),
    supabase
      .from('body_entries')
      .select('weight_kg')
      .eq('user_id', userId)
      .gte('recorded_at', since)
      .not('weight_kg', 'is', null)
      .order('recorded_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('body_entries')
      .select('weight_kg')
      .eq('user_id', userId)
      .not('weight_kg', 'is', null)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('planner_checkins').select('weekday').eq('user_id', userId).eq('week_start', weekStart),
    supabase.from('habit_logs').select('habit_key, log_date, completed').eq('user_id', userId).gte('log_date', since.slice(0, 10)),
    supabase.from('buddy_challenges').select('id, name, status, goal_type, goal_value').eq('created_by', userId).eq('status', 'active')
  ])

  const w0 = weightStart?.weight_kg != null ? Number(weightStart.weight_kg) : null
  const w1 = weightEnd?.weight_kg != null ? Number(weightEnd.weight_kg) : null
  const weightDelta = w0 != null && w1 != null ? Math.round((w1 - w0) * 10) / 10 : null

  const habitStreaks = {}
  for (const row of habits ?? []) {
    if (!row.completed) continue
    habitStreaks[row.habit_key] = (habitStreaks[row.habit_key] ?? 0) + 1
  }

  return env.jsonResponse(
    {
      weekStart,
      workoutsCompleted: workoutsWeek ?? 0,
      plannerCheckins: checkins?.length ?? 0,
      weightDeltaKg: weightDelta,
      habitCompletions: habits?.filter((h) => h.completed).length ?? 0,
      activeChallenges: challenges?.length ?? 0,
      summaryLines: [
        `${workoutsWeek ?? 0} workouts logged this week`,
        `${checkins?.length ?? 0} planned days checked in`,
        weightDelta != null ? `Weight change: ${weightDelta > 0 ? '+' : ''}${weightDelta} kg` : 'Log body weight for trend insight'
      ]
    },
    { status: 200 },
    request,
    env.ctx
  )
}
