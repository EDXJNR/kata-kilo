import { useAsyncData } from '@/hooks/useAsyncData'
import { useWorkoutReminders } from '@/hooks/useWorkoutReminders'
import { api } from '@/lib/api'

/** Loads reminder prefs and runs daily workout notifications. */
export default function WorkoutRemindersRunner() {
  const { data } = useAsyncData(() => api.profile.get(), [])
  useWorkoutReminders(data?.reminder_preferences ?? undefined)
  return null
}
