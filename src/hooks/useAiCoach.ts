import { useCallback, useEffect, useState } from 'react'
import type { ProfileData, WorkoutSummary } from '@/types/field-log'
import { EXERCISES } from '@/data/exercises'
import { WORKOUT_PLANS } from '@/data/workout-plans'
import {
  getActiveSession,
  updateSessionMessages,
  createSession,
  listSessions,
  setActiveSession,
  type CoachSession
} from '@/lib/coach-history'

export type CoachMessage = { role: 'user' | 'coach'; text: string; at?: string }

const PROMPTS = [
  'What should I train today?',
  'What weight should I use?',
  'Why am I not progressing?',
  'Create me a 4-day program.'
]

function pickTodayPlan(profile: ProfileData | null, _summary: WorkoutSummary | null) {
  const goal = profile?.fitness_goal ?? 'general'
  const equipment = profile?.equipment ?? []
  const hasGym = equipment.includes('gym') || equipment.includes('barbell')
  const day = new Date().getDay()

  if (goal === 'weight_loss') return WORKOUT_PLANS.find((p) => p.id === 'weight-loss-circuit')
  if (goal === 'strength') return WORKOUT_PLANS.find((p) => p.id === 'strength-5x5')
  if (!hasGym) return WORKOUT_PLANS.find((p) => p.id === 'home-no-equip')

  const rotation = ['gym-push', 'gym-pull', 'gym-legs', 'beginner-full']
  const id = rotation[day % rotation.length]
  return WORKOUT_PLANS.find((p) => p.id === id || p.id === 'muscle-push')
}

export function generateCoachReply(
  question: string,
  profile: ProfileData | null,
  summary: WorkoutSummary | null
): string {
  const q = question.toLowerCase()
  const level = profile?.experience_level ?? 'beginner'
  const streak = summary?.currentStreak ?? 0

  if (q.includes('train today') || q.includes('what should')) {
    const plan = pickTodayPlan(profile, summary)
    if (!plan) return 'Start with the Beginner Full Body plan — 35 min, 4 exercises.'
    return `Based on your ${profile?.fitness_goal ?? 'general'} goal: **${plan.name}** (${plan.durationMin} min). ${plan.description} Hit ${plan.exercises.length} exercises and aim for ${level === 'beginner' ? 'moderate' : 'challenging'} effort.`
  }

  if (q.includes('weight')) {
    const ex = EXERCISES.find((e) => e.id === 'bench-press')
    return level === 'beginner'
      ? `For ${ex?.name ?? 'compounds'}: start with an empty bar (20 kg) or light dumbbells. Add 2.5 kg when you hit all reps with good form for 2 sessions in a row.`
      : `Use ~75–85% of your recent top set. If last bench was 80 kg × 5, try 77.5–82.5 kg today. RPE 7–8 — 2 reps left in the tank.`
  }

  if (q.includes('not progressing') || q.includes('progress')) {
    if (streak < 2) return 'Consistency is the bottleneck — you need 3+ sessions/week for 4 weeks before judging progress. Schedule fixed training days.'
    return 'Check: (1) sleeping 7+ h, (2) protein ~1.6 g/kg, (3) deload every 4–6 weeks. If all good, add 1 set per exercise or swap a variation (e.g. RDL → deadlift).'
  }

  if (q.includes('4-day') || q.includes('program')) {
    return `**4-Day Split** (adjust to ${profile?.training_days?.length ?? 4} days):\n• Day 1: Push (bench, shoulder press, dips)\n• Day 2: Pull (deadlift, lat pulldown, curls)\n• Day 3: Rest or light cardio\n• Day 4: Legs (squat, RDL, hip thrust)\n• Day 5: Upper pump (higher reps)\n• Day 6–7: Rest\nUse the Gym Pull / Push / Leg plans in the Plans tab as templates.`
  }

  return `You're on a ${streak}-day streak. Focus on ${profile?.fitness_goal ?? 'balanced'} training at ${profile?.experience_level ?? 'your'} level. Ask about today's workout, weights, or program design.`
}

export function useAiCoach(
  userId: string | undefined,
  profile: ProfileData | null,
  summary: WorkoutSummary | null
) {
  const [session, setSession] = useState<CoachSession | null>(null)
  const [sessions, setSessions] = useState<CoachSession[]>([])
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    if (!userId) return
    const active = getActiveSession(userId)
    setSession(active)
    setSessions(listSessions(userId))
  }, [userId])

  const persist = useCallback(
    (sessionId: string, messages: CoachMessage[]) => {
      if (!userId) return
      updateSessionMessages(userId, sessionId, messages)
      setSessions(listSessions(userId))
    },
    [userId]
  )

  const ask = useCallback(
    (question: string) => {
      if (!session || !userId) return
      const withUser: CoachMessage[] = [
        ...session.messages,
        { role: 'user', text: question, at: new Date().toISOString() }
      ]
      setSession({ ...session, messages: withUser })
      persist(session.id, withUser)
      setThinking(true)
      window.setTimeout(() => {
        const reply = generateCoachReply(question, profile, summary)
        const complete: CoachMessage[] = [
          ...withUser,
          { role: 'coach', text: reply, at: new Date().toISOString() }
        ]
        setSession((s) => (s ? { ...s, messages: complete } : s))
        persist(session.id, complete)
        setThinking(false)
      }, 600)
    },
    [session, userId, profile, summary, persist]
  )

  const startNewChat = useCallback(() => {
    if (!userId) return
    const next = createSession(userId)
    setSession(next)
    setSessions(listSessions(userId))
  }, [userId])

  const openSession = useCallback(
    (sessionId: string) => {
      if (!userId) return
      setActiveSession(userId, sessionId)
      const found = listSessions(userId).find((s) => s.id === sessionId)
      if (found) setSession(found)
      setSessions(listSessions(userId))
    },
    [userId]
  )

  return {
    messages: session?.messages ?? [],
    sessionId: session?.id,
    sessions,
    thinking,
    ask,
    prompts: PROMPTS,
    startNewChat,
    openSession
  }
}
