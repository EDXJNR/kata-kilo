import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { buildAwardsFromContext } from '@/data/awards'
import { HABIT_CATALOG } from '@/lib/habit-catalog'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { getLocalStepsToday } from '@/lib/daily-steps'

type LinkRow = {
  to: string
  pathLabel: string
  label: string
  detail: string
  icon: string
  iconPrimary?: boolean
}

const SECTIONS: { title: string; sectionIcon: string; links: LinkRow[] }[] = [
  {
    title: 'Progress & people',
    sectionIcon: 'group',
    links: [
      {
        to: '/awards',
        pathLabel: '/awards',
        label: 'Awards',
        detail: 'Milestones, badges & personal records',
        icon: 'military_tech'
      },
      {
        to: '/habits',
        pathLabel: '/habits',
        label: 'Daily wins',
        detail: 'Micro-habits, hydration & consistency streaks',
        icon: 'star'
      },
      {
        to: '/buddy',
        pathLabel: '/buddy',
        label: 'Buddy',
        detail: 'Shared accountability & pacing partners',
        icon: 'diversity_1'
      },
      {
        to: '/profile/stats',
        pathLabel: '/stats',
        label: 'Lifetime stats',
        detail: 'Aggregate tonnage, distance & volume records',
        icon: 'equalizer'
      }
    ]
  },
  {
    title: 'Training tools',
    sectionIcon: 'fitness_center',
    links: [
      {
        to: '/workouts/planner',
        pathLabel: '/planner',
        label: 'Weekly planner',
        detail: 'Periodization splits & rest allocation',
        icon: 'calendar_month'
      },
      {
        to: '/workouts/progress',
        pathLabel: '/workouts/progress',
        label: 'Workout history',
        detail: 'Previous sessions, sets, reps & volume',
        icon: 'history'
      },
      {
        to: '/workouts/plans',
        pathLabel: '/plans',
        label: 'Saved plans',
        detail: 'Curated mesocycles & program templates',
        icon: 'folder_special'
      },
      {
        to: '/workouts/library',
        pathLabel: '/exercises',
        label: 'Exercise library',
        detail: 'Movement guides & form cues',
        icon: 'menu_book'
      },
      {
        to: '/workouts/builder',
        pathLabel: '/builder',
        label: 'Plan builder',
        detail: 'Custom progression & exercise selection',
        icon: 'architecture'
      },
      {
        to: '/workouts/coach',
        pathLabel: '/coach',
        label: 'AI coach',
        detail: 'Adaptive volume recommendations & feedback',
        icon: 'smart_toy',
        iconPrimary: true
      }
    ]
  },
  {
    title: 'Logs & history',
    sectionIcon: 'monitoring',
    links: [
      {
        to: '/body/trends',
        pathLabel: '/body',
        label: 'Body trends',
        detail: 'Weight, measurements & trends',
        icon: 'monitor_weight'
      },
      {
        to: '/routes/history',
        pathLabel: '/routes',
        label: 'Route history',
        detail: 'GPS trails & outdoor maps',
        icon: 'alt_route'
      },
      {
        to: '/sleep/history',
        pathLabel: '/sleep/history',
        label: 'Sleep history',
        detail: 'Sleep duration & recent nights',
        icon: 'bedtime'
      },
      {
        to: '/meals/scan',
        pathLabel: '/scan',
        label: 'Calorie scan',
        detail: 'Meal camera & macro breakdown',
        icon: 'qr_code_scanner'
      }
    ]
  },
  {
    title: 'Account',
    sectionIcon: 'person',
    links: [
      {
        to: '/profile',
        pathLabel: '/settings',
        label: 'Profile & settings',
        detail: 'Account details, preferences & security',
        icon: 'settings'
      }
    ]
  }
]

function openSearch() {
  window.dispatchEvent(new CustomEvent('katakilo:search-open'))
}

export default function MorePage() {
  const { data: profile } = useAsyncData(() => api.profile.get())
  const { data: dash } = useAsyncData(() => api.dashboard.get())
  const { data: habits } = useAsyncData(() => api.habits.get())

  const { earnedCount, habitsDone, habitsTotal } = useMemo(() => {
    const stepsToday = Math.max(dash?.stepsToday ?? 0, getLocalStepsToday().steps)
    const awards = buildAwardsFromContext({
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
    })
    const done = habits?.today.filter((l) => l.completed).length ?? 0
    return {
      earnedCount: awards.filter((a) => a.earned).length,
      habitsDone: done,
      habitsTotal: HABIT_CATALOG.length
    }
  }, [profile, dash, habits])

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="More" subtitle="Everything else — training tools, history, and account." />
      </div>
      <div className="flex flex-col w-full px-5 lg:px-8 pb-10 gap-4 max-w-lg mx-auto lg:max-w-3xl font-body-hud bg-hud-surface min-h-full mt-2 lg:mt-0">
        <button
          type="button"
          onClick={openSearch}
          className="relative bg-hud-container-lowest rounded-xl p-3 shadow-sm border border-hud-outline-variant/30 w-full text-left"
        >
          <div className="flex items-center gap-3 bg-hud-container-low rounded-lg px-3 py-2.5">
            <MaterialIcon name="search" className="text-[20px] text-hud-on-variant shrink-0" />
            <span className="text-sm text-hud-on-variant flex-1">Search tools, logs, plans or stats…</span>
          </div>
          <p className="text-[10px] text-hud-on-variant uppercase tracking-wider mt-2 px-1 flex items-center gap-1.5">
            <MaterialIcon name="bolt" className="text-[14px] text-hud-primary" />
            Quickly jump to any page or log
          </p>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <FeaturedCard
            to="/awards"
            icon="military_tech"
            title="Your awards"
            meta={`/awards · ${earnedCount} unlocked`}
            accent
          />
          <FeaturedCard
            to="/habits"
            icon="local_fire_department"
            title="Daily wins"
            meta={`/habits · ${habitsDone}/${habitsTotal} targets`}
          />
        </div>

        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="bg-hud-container-lowest rounded-xl p-4 shadow-sm border border-hud-outline-variant/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <MaterialIcon name={section.sectionIcon} className="text-[18px] text-hud-on-variant" />
              <h2 className="text-xs text-hud-on-variant uppercase tracking-wider font-semibold">{section.title}</h2>
            </div>
            <div className="flex flex-col gap-1">
              {section.links.map((link) => (
                <MoreRow key={link.to} {...link} />
              ))}
            </div>
          </section>
        ))}

        <div className="flex flex-col items-center justify-center py-3 text-center">
          <div className="flex items-center gap-1.5 text-hud-on-variant">
            <MaterialIcon name="bolt" className="text-[14px]" />
            <span className="text-[10px] tracking-widest uppercase font-display">Kata Kilo directory</span>
          </div>
        </div>
      </div>
    </>
  )
}

function FeaturedCard({
  to,
  icon,
  title,
  meta,
  accent
}: {
  to: string
  icon: string
  title: string
  meta: string
  accent?: boolean
}) {
  return (
    <Link
      to={to}
      className="bg-hud-container-lowest p-3 rounded-xl shadow-sm border border-hud-outline-variant/20 hover:border-hud-primary/40 transition-all flex items-center gap-3 group"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          accent ? 'bg-emerald-50 dark:bg-hud-primary/10 text-hud-primary' : 'bg-hud-container-high text-hud-primary'
        }`}
      >
        <MaterialIcon name={icon} className="text-[22px]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-bold text-hud-on truncate group-hover:text-hud-primary transition-colors">{title}</p>
          <MaterialIcon name="arrow_forward" className="text-[16px] text-hud-on-variant group-hover:text-hud-primary shrink-0" />
        </div>
        <p className="text-[12px] text-hud-on-variant truncate">{meta}</p>
      </div>
    </Link>
  )
}

function MoreRow({ to, pathLabel, label, detail, icon, iconPrimary }: LinkRow) {
  return (
    <Link
      to={to}
      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-hud-container-low hover:bg-hud-container-high transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-lg bg-hud-container-high flex items-center justify-center shrink-0 ${
            iconPrimary ? 'text-hud-primary' : 'text-hud-on'
          }`}
        >
          <MaterialIcon name={icon} className="text-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-hud-on font-semibold truncate">{label}</p>
          <p className="text-xs text-hud-on-variant truncate">{detail}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <span className="font-display text-[11px] text-hud-on-variant hidden sm:inline">{pathLabel}</span>
        <MaterialIcon name="chevron_right" className="text-[18px] text-hud-on-variant group-hover:text-hud-on" />
      </div>
    </Link>
  )
}
