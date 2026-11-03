import { useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { todayWeekdayIndex } from '@/lib/week-utils'
import type { ReminderPreferences } from '@/types/field-log'

const LAST_REMINDER_KEY = 'katakilo.reminder.lastDate'
const SNOOZE_UNTIL_KEY = 'katakilo.reminder.snoozeUntil'

function parseTime(time: string): [number, number] {
  const [h, m] = time.split(':').map(Number)
  return [h || 0, m || 0]
}

function isPastReminderTime(now: Date, time: string): boolean {
  const [h, m] = parseTime(time)
  if (now.getHours() > h) return true
  if (now.getHours() === h && now.getMinutes() >= m) return true
  return false
}

function formatReminderTime(time: string): string {
  const [h, m] = parseTime(time)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function snoozed(): boolean {
  const raw = localStorage.getItem(SNOOZE_UNTIL_KEY)
  if (!raw) return false
  return Date.now() < Number(raw)
}

export function snoozeReminders(minutes = 60) {
  localStorage.setItem(SNOOZE_UNTIL_KEY, String(Date.now() + minutes * 60_000))
}

export function useWorkoutReminders(prefs: ReminderPreferences | null | undefined) {
  const checking = useRef(false)

  useEffect(() => {
    if (!prefs?.enabled) return

    async function check() {
      if (checking.current || snoozed()) return
      checking.current = true
      try {
        if (!('Notification' in window)) return
        if (Notification.permission === 'default') {
          await Notification.requestPermission()
        }
        if (Notification.permission !== 'granted') return

        const now = new Date()
        const todayKey = now.toISOString().slice(0, 10)
        if (localStorage.getItem(LAST_REMINDER_KEY) === todayKey) return

        const { plan } = await api.workouts.getWeekly()
        const todayIdx = todayWeekdayIndex()
        const day = plan.days.find((d) => d.weekday === todayIdx)
        if (!day || day.isRest || !day.workoutName) return

        const reminderTime = day.reminderTime ?? prefs?.time ?? '08:00'
        if (!isPastReminderTime(now, reminderTime)) return

        const timeLabel = formatReminderTime(reminderTime)
        const title = "Hey! 💪 You've got a workout today"
        const body = `${day.workoutName} · ${timeLabel}. Tap to open — snooze or check in from the app banner.`

        const notification = new Notification(title, { body, tag: 'katakilo-workout-reminder' })
        notification.onclick = () => {
          window.focus()
          window.location.assign('/workouts/planner')
        }

        localStorage.setItem(LAST_REMINDER_KEY, todayKey)
      } catch {
        /* ignore reminder errors */
      } finally {
        checking.current = false
      }
    }

    check()
    const id = window.setInterval(check, 60_000)
    return () => window.clearInterval(id)
  }, [prefs?.enabled, prefs?.time])
}
