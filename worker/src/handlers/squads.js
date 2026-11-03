function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

async function squadMemberIds(supabase, userId) {
  const { data: membership } = await supabase
    .from('squad_members')
    .select('squad_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  if (!membership) return { squadId: null, memberIds: [] }
  const { data: members } = await supabase.from('squad_members').select('user_id').eq('squad_id', membership.squad_id)
  return { squadId: membership.squad_id, memberIds: (members ?? []).map((m) => m.user_id) }
}

async function profileMap(supabase, ids) {
  const map = new Map()
  if (ids.length === 0) return map
  const { data: profiles } = await supabase.from('profiles').select('id, email, name, avatar_url').in('id', ids)
  for (const p of profiles ?? []) {
    map.set(p.id, {
      name: p.name ?? p.email ?? 'Member',
      avatarUrl: p.avatar_url ?? null
    })
  }
  return map
}

async function fetchSquadActivityItems(supabase, memberIds) {
  if (memberIds.length === 0) return []
  const since = daysAgoIso(60)
  const [workoutsRes, routesRes] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, user_id, name, recorded_at, duration_min, volume_kg')
      .in('user_id', memberIds)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false })
      .limit(80),
    supabase
      .from('routes')
      .select('id, user_id, name, recorded_at, distance_km, duration_min, activity_type')
      .in('user_id', memberIds)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: false })
      .limit(80)
  ])

  const profiles = await profileMap(supabase, memberIds)
  const items = []

  for (const w of workoutsRes.data ?? []) {
    const prof = profiles.get(w.user_id)
    items.push({
      id: `workout-${w.id}`,
      userId: w.user_id,
      userName: prof?.name ?? 'Member',
      avatarUrl: prof?.avatarUrl ?? null,
      type: 'workout',
      title: w.name ?? 'Workout',
      detail: `${w.duration_min ?? '—'} min · ${w.volume_kg ?? 0} kg volume`,
      recordedAt: w.recorded_at
    })
  }
  for (const r of routesRes.data ?? []) {
    const prof = profiles.get(r.user_id)
    items.push({
      id: `route-${r.id}`,
      userId: r.user_id,
      userName: prof?.name ?? 'Member',
      avatarUrl: prof?.avatarUrl ?? null,
      type: 'route',
      title: r.name ?? 'Outdoor route',
      detail: `${Number(r.distance_km).toFixed(2)} km · ${r.activity_type ?? 'move'}`,
      recordedAt: r.recorded_at
    })
  }

  items.sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1))
  return items
}

export async function handleSquadActivity(request, env, userId) {
  const supabase = env.createSupabaseAdmin()
  const url = new URL(request.url)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '30', 10)))
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10))

  const { squadId, memberIds } = await squadMemberIds(supabase, userId)
  if (!squadId) {
    return env.jsonResponse({ items: [], total: 0 }, { status: 200 }, request, env.ctx)
  }

  const items = await fetchSquadActivityItems(supabase, memberIds)
  const total = items.length
  const slice = items.slice(offset, offset + limit)

  return env.jsonResponse({ items: slice, total, squadId }, { status: 200 }, request, env.ctx)
}

function daysAgoIso(days) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

export async function handleSquadDashboard(env, userId, request) {
  const supabase = env.createSupabaseAdmin()
  const { data: membership } = await supabase
    .from('squad_members')
    .select('squad_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (!membership) {
    return env.jsonResponse({ squad: null, members: [], progress: null }, { status: 200 }, request, env.ctx)
  }

  const { data: squad } = await supabase.from('squads').select('*').eq('id', membership.squad_id).single()
  const { data: members } = await supabase.from('squad_members').select('user_id, joined_at').eq('squad_id', membership.squad_id)

  const memberIds = (members ?? []).map((m) => m.user_id)
  const since = weekStartIso()
  const memberBriefs = []
  for (const id of memberIds) {
    const { data: profile } = await supabase.from('profiles').select('id, email, name, avatar_url').eq('id', id).maybeSingle()
    const { count: workouts } = await supabase
      .from('workouts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id)
      .gte('recorded_at', since)
    memberBriefs.push({
      userId: id,
      name: profile?.name ?? profile?.email ?? 'Member',
      avatarUrl: profile?.avatar_url ?? null,
      workoutsThisWeek: workouts ?? 0
    })
  }

  const goal = squad?.weekly_goal ?? { workouts: 3, steps: 30000 }
  const teamWorkouts = memberBriefs.reduce((s, m) => s + m.workoutsThisWeek, 0)

  const activityPreview = squad ? (await fetchSquadActivityItems(supabase, memberIds)).slice(0, 5) : []

  return env.jsonResponse(
    {
      squad: squad
        ? {
            id: squad.id,
            name: squad.name,
            inviteCode: squad.invite_code,
            weeklyGoal: goal,
            createdAt: squad.created_at
          }
        : null,
      members: memberBriefs,
      progress: {
        teamWorkouts,
        workoutGoal: Number(goal.workouts) * memberBriefs.length || 3
      },
      activityPreview
    },
    { status: 200 },
    request,
    env.ctx
  )
}

export async function handleCreateSquad(request, env, userId) {
  const body = await env.readJson(request)
  const name = body?.name?.trim()
  if (!name) return env.errorResponse('Squad name is required', 400, request, env.ctx)

  const supabase = env.createSupabaseAdmin()
  const { data: existing } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle()
  if (existing) return env.errorResponse('Leave your current squad first', 400, request, env.ctx)

  let inviteCode = randomCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: squad, error } = await supabase
      .from('squads')
      .insert({
        name,
        invite_code: inviteCode,
        created_by: userId,
        weekly_goal: body.weeklyGoal ?? { workouts: 3, steps: 30000 }
      })
      .select('id, name, invite_code, weekly_goal, created_at')
      .single()
    if (!error && squad) {
      await supabase.from('squad_members').insert({ squad_id: squad.id, user_id: userId })
      return env.jsonResponse(
        {
          squad: {
            id: squad.id,
            name: squad.name,
            inviteCode: squad.invite_code,
            weeklyGoal: squad.weekly_goal,
            createdAt: squad.created_at
          }
        },
        { status: 201 },
        request,
        env.ctx
      )
    }
    inviteCode = randomCode()
  }
  return env.errorResponse('Could not create squad', 500, request, env.ctx)
}

export async function handleJoinSquad(request, env, userId) {
  const body = await env.readJson(request)
  const code = body?.inviteCode?.trim()?.toUpperCase()
  if (!code) return env.errorResponse('inviteCode is required', 400, request, env.ctx)

  const supabase = env.createSupabaseAdmin()
  const { data: existing } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle()
  if (existing) return env.errorResponse('Already in a squad', 400, request, env.ctx)

  const { data: squad } = await supabase.from('squads').select('id, name').eq('invite_code', code).maybeSingle()
  if (!squad) return env.errorResponse('Invalid invite code', 404, request, env.ctx)

  const { count } = await supabase.from('squad_members').select('user_id', { count: 'exact', head: true }).eq('squad_id', squad.id)
  if ((count ?? 0) >= 5) return env.errorResponse('Squad is full (max 5)', 400, request, env.ctx)

  const { error } = await supabase.from('squad_members').insert({ squad_id: squad.id, user_id: userId })
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ ok: true, squadId: squad.id, name: squad.name }, { status: 200 }, request, env.ctx)
}

export async function handleLeaveSquad(env, userId, request) {
  const supabase = env.createSupabaseAdmin()
  const { error } = await supabase.from('squad_members').delete().eq('user_id', userId)
  if (error) return env.errorResponse(error.message, 500, request, env.ctx)
  return env.jsonResponse({ ok: true }, { status: 200 }, request, env.ctx)
}

function weekStartIso() {
  const d = new Date()
  const day = d.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}
