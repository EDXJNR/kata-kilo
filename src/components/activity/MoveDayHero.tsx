import CircularTimer from '@/components/ui/CircularTimer'
import StepWeekRings from '@/components/activity/StepWeekRings'
import { getStepGoal } from '@/lib/daily-steps'

export default function MoveDayHero({
  stepsToday,
  distanceKm,
  moveCalories,
  moveGoal
}: {
  stepsToday: number
  distanceKm: number
  moveCalories: number
  moveGoal: number
}) {
  const stepGoal = getStepGoal()
  const stepPct = stepGoal > 0 ? stepsToday / stepGoal : 0
  const movePct = moveGoal > 0 ? moveCalories / moveGoal : 0

  return (
    <section className="rounded-2xl border border-line/60 bg-gradient-to-br from-basalt2 via-basalt2/90 to-primary/5 p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <p className="text-fog text-[10px] font-mono uppercase tracking-[0.2em]">Activity</p>
          <h2 className="text-bone font-display font-bold text-lg">Today</h2>
        </div>
        <span className="text-xs text-fog">Auto-tracking steps</span>
      </div>

      <StepWeekRings stepsToday={stepsToday} />

      <div className="mt-6 grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <CircularTimer
          progress={stepPct}
          label={stepsToday.toLocaleString()}
          caption="Steps"
          subtitle={`Goal ${stepGoal.toLocaleString()}`}
          color="#ff375f"
          size={168}
        />
        <div className="space-y-4">
          <div>
            <p className="text-fog text-xs uppercase tracking-wide mb-1">Move</p>
            <p className="text-3xl font-display font-bold tabular-nums text-[#ff375f]">
              {Math.round(moveCalories)}
              <span className="text-lg text-fog font-normal"> / {moveGoal} kcal</span>
            </p>
            <div className="mt-2 h-2 rounded-full bg-line/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ff375f] to-pink-400 transition-all duration-700"
                style={{ width: `${Math.min(100, movePct * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-fog text-xs">Distance</p>
              <p className="text-bone font-semibold tabular-nums">{distanceKm.toFixed(2)} km</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
