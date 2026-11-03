import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { snoozeReminders } from '@/hooks/useWorkoutReminders'
import { mondayOfWeek, todayWeekdayIndex } from '@/lib/week-utils'

export default function PlannerReminderBanner() {
  const [workoutName, setWorkoutName] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    void api.workouts
      .getWeekly()
      .then(({ plan }) => {
        const day = plan.days.find((d) => d.weekday === todayWeekdayIndex())
        if (day && !day.isRest && day.workoutName) setWorkoutName(day.workoutName)
      })
      .catch(() => {})
  }, [])

  if (!workoutName || checkedIn) return null

  async function markDone() {
    setCheckingIn(true)
    try {
      await api.planner.checkin(mondayOfWeek(), todayWeekdayIndex())
      setCheckedIn(true)
    } finally {
      setCheckingIn(false)
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-bone">
        Planned today: <strong>{workoutName}</strong>
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={() => snoozeReminders(60)} className="text-fog hover:text-bone">
          Snooze 1h
        </button>
        <button type="button" disabled={checkingIn} onClick={() => void markDone()} className="text-primary hover:underline">
          {checkingIn ? 'Saving…' : 'Check in'}
        </button>
        <Link to="/workouts/train" className="text-primary hover:underline">
          Train
        </Link>
      </div>
    </div>
  )
}
