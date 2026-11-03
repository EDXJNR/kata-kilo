import { useMemo } from 'react'
import { buildAwardsFromContext, type AwardContext } from '@/data/awards'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { getLocalStepsToday } from '@/lib/daily-steps'

export function useAwards() {
  const { data: profile, loading: pLoad } = useAsyncData(() => api.profile.get())
  const { data: dash, loading: dLoad } = useAsyncData(() => api.dashboard.get())

  const stepsToday = Math.max(dash?.stepsToday ?? 0, getLocalStepsToday().steps)

  const ctx: AwardContext = useMemo(
    () => ({
      workouts: profile?.stats.workouts ?? 0,
      routes: profile?.stats.routes ?? 0,
      bodyEntries: profile?.stats.bodyEntries ?? 0,
      nutritionEntries: profile?.stats.nutritionEntries ?? 0,
      sleepEntries: profile?.stats.sleepEntries ?? 0,
      stepsToday,
      workoutsWeek: dash?.workoutsThisWeek ?? 0,
      caloriesToday: dash?.caloriesToday ?? 0,
      avgSleepHours: dash?.avgSleepHours ?? null,
      distanceTodayKm: dash?.distanceTodayKm ?? 0
    }),
    [profile, dash, stepsToday]
  )

  const awards = useMemo(() => buildAwardsFromContext(ctx), [ctx])

  return {
    awards,
    ctx,
    profile,
    dash,
    stepsToday,
    loading: pLoad || dLoad
  }
}
