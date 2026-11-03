import type { ComponentType } from 'react'
import {
  IconBody,
  IconDashboard,
  IconLogout,
  IconMore,
  IconNutrition,
  IconRoute,
  IconSleep,
  IconWorkout
} from '@/components/ui/Icons'

export type NavChild = {
  to: string
  label: string
  end?: boolean
}

export type NavSection = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  to?: string
  /** When true, any path under `to` counts as active (e.g. /workouts/train) */
  prefix?: boolean
  end?: boolean
  children?: NavChild[]
}

/** Primary navigation — flat, everyday destinations only */
export const NAV_SECTIONS: NavSection[] = [
  { id: 'home', label: 'Today', icon: IconDashboard, to: '/', end: true },
  { id: 'train', label: 'Train', icon: IconWorkout, to: '/workouts', prefix: true },
  { id: 'walk', label: 'Walk & run', icon: IconRoute, to: '/routes', prefix: true },
  { id: 'eat', label: 'Eat', icon: IconNutrition, to: '/meals', prefix: true },
  { id: 'body', label: 'Body', icon: IconBody, to: '/body', prefix: true },
  { id: 'sleep', label: 'Sleep', icon: IconSleep, to: '/sleep', prefix: true },
  { id: 'more', label: 'More', icon: IconMore, to: '/more', end: true }
]

export type MobileNavItem = {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
  /** Highlight tab when pathname starts with this prefix */
  activePrefix?: string
}

/** Bottom bar on mobile — five clear tabs */
export const MOBILE_NAV: MobileNavItem[] = [
  { to: '/', label: 'Today', icon: IconDashboard, end: true },
  { to: '/workouts', label: 'Train', icon: IconWorkout, activePrefix: '/workouts' },
  { to: '/routes/track', label: 'Walk', icon: IconRoute, activePrefix: '/routes' },
  { to: '/meals', label: 'Eat', icon: IconNutrition, activePrefix: '/meals' },
  { to: '/more', label: 'More', icon: IconMore, end: true }
]

export { IconLogout }
