import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import AwardBadge from '@/components/awards/AwardBadge'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { HudIntroBlock, HudStatCard, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import ViewMoreLink from '@/components/ui/ViewMoreLink'
import LoadingState from '@/components/ui/LoadingState'
import { AWARD_CATALOG } from '@/data/awards'
import { useAwards } from '@/hooks/useAwards'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { getStepGoal } from '@/lib/daily-steps'

function tierLabel(earned: number, total: number) {
  const pct = total > 0 ? earned / total : 0
  if (pct >= 0.85) return 'Tier 4 Pro'
  if (pct >= 0.6) return 'Tier 3'
  if (pct >= 0.35) return 'Tier 2'
  return 'Tier 1'
}

export default function AwardsPage() {
  const { awards, ctx, profile, stepsToday, loading } = useAwards()
  const { data: workouts } = useAsyncData(() => api.workouts.list())
  const { data: routes } = useAsyncData(() => api.routes.list())
  const { data: habits } = useAsyncData(() => api.habits.get())

  const stepGoal = getStepGoal()

  const earnedCount = awards.filter((a) => a.earned).length
  const maxStreak = habits?.streaks ? Math.max(0, ...Object.values(habits.streaks)) : 0
  const totalKm = routes?.entries.reduce((s, e) => s + e.distance_km, 0) ?? 0
  const sprintGoal = 100_000
  const sprintCurrent = Math.min(sprintGoal, stepsToday * 22)
  const sprintPct = Math.round((sprintCurrent / sprintGoal) * 100)

  const showcase = useMemo(() => {
    const earned = awards.filter((a) => a.earned)
    const locked = awards.filter((a) => !a.earned)
    const pick = [...earned.slice(0, 4), ...locked.slice(0, 2)].slice(0, 6)
    return pick.map((a) => {
      const def = AWARD_CATALOG.find((d) => d.id === a.id)
      const progress = def?.progress?.(ctx)
      return { ...a, progressLabel: progress }
    })
  }, [awards, ctx])

  const prs = workouts?.prs?.slice(0, 3) ?? []

  if (loading) return <LoadingState />

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Awards" />
      </div>
      <HudSubpageShell className="gap-5">
        <HudIntroBlock
          eyebrow="Performance audit"
          title="Hall of milestones"
          trailing={
            <span className="inline-flex items-center gap-1.5 bg-hud-primary/10 text-hud-primary px-2.5 py-1 rounded-full text-xs font-display font-semibold">
              <MaterialIcon name="military_tech" className="text-[16px]" filled />
              {tierLabel(earnedCount, awards.length)}
            </span>
          }
        />

        <div className="grid grid-cols-3 gap-2">
          <HudStatCard
            label="Weight"
            value={profile?.weight_kg != null ? profile.weight_kg.toFixed(1) : '—'}
            unit="kg"
            hint={profile?.weight_kg != null ? 'Current log' : 'Log body'}
            icon="monitor_weight"
          />
          <HudStatCard label="Streak" value={maxStreak} unit="d" hint="Consecutive" hintPrimary icon="local_fire_department" />
          <HudStatCard
            label="Move"
            value={Math.round(totalKm * 10) / 10}
            unit="km"
            hint="Tracked"
            icon="directions_run"
          />
        </div>

        <section className="bg-hud-container-lowest rounded-xl p-4 shadow-sm border border-hud-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hud-primary" />
              <span className="text-[10px] text-hud-primary font-bold uppercase tracking-wider">Current sprint</span>
            </div>
            <span className="text-[11px] text-hud-on-variant bg-hud-container-low px-2 py-0.5 rounded-full font-display">
              {stepGoal.toLocaleString()} steps / day target
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-display font-semibold text-hud-on">100k steps challenge</h3>
            <span className="font-display font-bold text-hud-primary">{sprintPct}%</span>
          </div>
          <p className="text-sm text-hud-on-variant mb-3">
            Today {stepsToday.toLocaleString()} steps · keep pacing toward your monthly goal.
          </p>
          <div className="w-full bg-hud-container-high rounded-full h-2.5 overflow-hidden">
            <div className="bg-hud-primary h-full rounded-full transition-all" style={{ width: `${sprintPct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs font-display">
            <span className="text-hud-on font-semibold">
              {sprintCurrent.toLocaleString()} <span className="text-hud-on-variant font-normal">/ {sprintGoal.toLocaleString()}</span>
            </span>
            <span className="text-hud-on-variant">{(sprintGoal - sprintCurrent).toLocaleString()} to go</span>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Medals & insignia</span>
              <h3 className="font-display font-semibold text-hud-on">Unlocked badges</h3>
            </div>
            <span className="text-xs text-hud-on-variant font-display">
              {earnedCount} of {awards.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {showcase.map((a) => (
              <AwardBadge
                key={a.id}
                title={a.title}
                emoji={a.emoji}
                earned={a.earned}
                statusLabel={a.earned ? 'Earned' : a.progressLabel ?? 'In progress'}
              />
            ))}
          </div>
          <ViewMoreLink to="/awards/all" label={`View all ${awards.length} awards`} />
        </section>

        {prs.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Benchmark data</span>
                <h3 className="font-display font-semibold text-hud-on">Personal records</h3>
              </div>
              <Link to="/workouts/progress" className="text-xs text-hud-primary font-semibold flex items-center gap-0.5">
                History <MaterialIcon name="chevron_right" className="text-[15px]" />
              </Link>
            </div>
            <div className="bg-hud-container-lowest rounded-xl shadow-sm border border-hud-outline-variant/30 overflow-hidden divide-y divide-hud-outline-variant/40">
              {prs.map((pr, i) => (
                <div key={`${pr.exerciseId}-${i}`} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-hud-container-high flex items-center justify-center text-base" aria-hidden>
                      🏋️‍♂️
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-hud-on truncate">{pr.exerciseName}</p>
                      <p className="text-[11px] text-hud-on-variant">Best set logged</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-hud-on">{pr.weightKg} kg</p>
                    <p className="text-[10px] text-hud-on-variant uppercase">{pr.reps} reps</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="bg-hud-container-low p-4 rounded-xl flex items-center justify-between gap-3 border border-hud-outline-variant/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-hud-container-lowest flex items-center justify-center text-xl shrink-0" aria-hidden>
              🎯
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-hud-on">Next: {Math.max(0, stepGoal - stepsToday).toLocaleString()} steps today</p>
              <p className="text-xs text-hud-on-variant">Close your move ring for another badge.</p>
            </div>
          </div>
          <Link
            to="/routes/track"
            className="bg-hud-primary text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg shrink-0"
          >
            Log run
          </Link>
        </section>
      </HudSubpageShell>
    </>
  )
}
