import { NAV_SECTIONS } from '@/lib/nav-config'

export type Breadcrumb = { label: string; to?: string }

const PAGE_LABELS: Record<string, string> = {
  '/more': 'More',
  '/activity/rings': 'Activity history',
  '/awards': 'Awards',
  '/habits': 'Daily wins',
  '/buddy': 'Buddy',
  '/workouts/train': 'Train',
  '/workouts/planner': 'Weekly planner',
  '/workouts/progress': 'Progress',
  '/workouts/plans': 'Plans',
  '/workouts/library': 'Library',
  '/workouts/builder': 'Builder',
  '/workouts/coach': 'AI coach',
  '/routes/track': 'Live tracker',
  '/routes/history': 'History',
  '/meals/scan': 'Calorie scan',
  '/body/trends': 'Trends',
  '/sleep/track': 'Track sleep',
  '/sleep/history': 'Sleep history',
  '/profile/stats': 'Lifetime stats'
}

function labelForPath(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
  if (pathname === '/body') return 'Body'
  if (pathname === '/meals') return 'Eat'
  if (pathname === '/profile') return 'Profile'
  if (pathname === '/workouts') return 'Train'
  return 'Page'
}

export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  if (pathname === '/') return [{ label: 'Today' }]

  const home: Breadcrumb = { label: 'Today', to: '/' }

  for (const section of NAV_SECTIONS) {
    if (!section.to) continue
    const matches = section.end
      ? pathname === section.to
      : section.prefix
        ? pathname === section.to || pathname.startsWith(`${section.to}/`)
        : pathname === section.to || pathname.startsWith(`${section.to}/`)

    if (!matches) continue

    if (pathname === section.to) {
      return [home, { label: section.label }]
    }

    return [home, { label: section.label, to: section.to }, { label: labelForPath(pathname) }]
  }

  return [home, { label: labelForPath(pathname) }]
}
