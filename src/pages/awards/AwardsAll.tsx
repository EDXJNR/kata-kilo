import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import AwardBadge from '@/components/awards/AwardBadge'
import { HudIntroBlock, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import LoadingState from '@/components/ui/LoadingState'
import { AWARD_CATALOG, AWARD_CATEGORIES } from '@/data/awards'
import { useAwards } from '@/hooks/useAwards'

export default function AwardsAllPage() {
  const { awards, ctx, loading } = useAwards()

  if (loading) return <LoadingState />

  const earnedCount = awards.filter((a) => a.earned).length

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="All awards" />
      </div>
      <HudSubpageShell className="gap-5 pb-10">
        <HudIntroBlock
          eyebrow="Full catalog"
          title="Every badge"
          description={`${earnedCount} unlocked · ${awards.length - earnedCount} still to earn`}
        />

        {AWARD_CATEGORIES.map((category) => {
          const inCategory = awards.filter((a) => a.category === category)
          if (inCategory.length === 0) return null
          const catEarned = inCategory.filter((a) => a.earned).length

          return (
            <section key={category}>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="font-display font-semibold text-hud-on">{category}</h2>
                <span className="text-xs text-hud-on-variant font-display">
                  {catEarned}/{inCategory.length}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {inCategory.map((a) => {
                  const def = AWARD_CATALOG.find((d) => d.id === a.id)
                  const progress = def?.progress?.(ctx)
                  return (
                    <AwardBadge
                      key={a.id}
                      title={a.title}
                      emoji={a.emoji}
                      earned={a.earned}
                      statusLabel={a.earned ? 'Earned' : progress ?? 'Locked'}
                      size="sm"
                    />
                  )
                })}
              </div>
            </section>
          )
        })}

        <Link to="/awards" className="text-center text-sm text-hud-on-variant hover:text-hud-primary font-display">
          ← Back to awards overview
        </Link>
      </HudSubpageShell>
    </>
  )
}
