import PageHeader from '@/components/PageHeader'
import { HudIntroBlock, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import AiCoachPanel from '@/components/workouts/AiCoachPanel'
import LoadingState from '@/components/ui/LoadingState'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { getExercise } from '@/data/exercises'

export default function WorkoutCoach() {
  const { data, loading } = useAsyncData(() => api.workouts.list())
  const { data: profile } = useAsyncData(() => api.profile.get())
  const { data: automation } = useAsyncData(() => api.automation.suggestions())

  if (loading) return <LoadingState />

  const summary = data?.summary

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-0px)] md:min-h-screen bg-hud-surface">
      <div className="hidden lg:block">
        <PageHeader title="AI Coach" />
      </div>
      <HudSubpageShell className="gap-4 pb-0">
        <HudIntroBlock
          eyebrow="Kata Kilo AI coach"
          title="Performance hub"
          description="Daily overload and nutritional sync."
          trailing={
            summary ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase">
                {summary.currentStreak} day streak
              </span>
            ) : null
          }
        />
        {automation ? (
          <section className="bg-hud-container-lowest rounded-xl p-4 shadow-sm border border-hud-outline-variant/30 border-t-2 border-t-hud-primary">
            <span className="text-[10px] text-hud-on-variant uppercase tracking-wider">Smart recovery</span>
            <p className="text-sm text-hud-on mt-1">{automation.nutrition.note}</p>
            <div className="mt-3 bg-hud-container-low rounded-lg p-3">
              <div className="flex justify-between text-xs font-display mb-1">
                <span>Protein target</span>
                <span className="tabular-nums">
                  {automation.nutrition.proteinTodayG}g / {automation.nutrition.proteinTargetG}g
                </span>
              </div>
              <div className="h-2 rounded-full bg-hud-container-high overflow-hidden">
                <div
                  className="h-full bg-hud-primary rounded-full"
                  style={{
                    width: `${Math.min(100, (automation.nutrition.proteinTodayG / Math.max(1, automation.nutrition.proteinTargetG)) * 100)}%`
                  }}
                />
              </div>
            </div>
            {automation.progressiveOverload.length > 0 ? (
              <ul className="mt-3 space-y-1.5 text-xs text-hud-on-variant">
                {automation.progressiveOverload.map((o) => (
                  <li key={o.exerciseId} className="bg-hud-container-low rounded-md px-2 py-1.5">
                    <span className="text-hud-on font-semibold">{getExercise(o.exerciseId)?.name ?? o.exerciseId}</span>: {o.suggestion}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </HudSubpageShell>
      <AiCoachPanel fullPage profile={profile ?? null} summary={summary ?? null} />
    </div>
  )
}
