export type HudStackMeta = {
  title: string
  subtitle?: string
  backTo: string
  /** Parent tab header when returning (for walk/train context) */
  backLabel?: string
}

const STACK: Record<string, HudStackMeta> = {
  '/awards': { title: 'Awards', subtitle: 'Milestones & records', backTo: '/more' },
  '/awards/all': { title: 'All awards', subtitle: 'Full badge catalog', backTo: '/awards' },
  '/buddy': { title: 'Buddy', subtitle: 'Accountability partner', backTo: '/more' },
  '/buddy/squad-activity': { title: 'Squad activity', subtitle: 'Team feed', backTo: '/buddy' },
  '/habits': { title: 'Daily wins', subtitle: 'Micro-habits & streaks', backTo: '/more' },
  '/profile/stats': { title: 'Lifetime stats', subtitle: 'Aggregate output', backTo: '/more' },
  '/profile': { title: 'Profile', subtitle: 'Account & settings', backTo: '/more' },
  '/body/trends': { title: 'Body trends', subtitle: 'Weight & measurements', backTo: '/more' },
  '/routes/history': { title: 'Route history', subtitle: 'GPS trails & pace', backTo: '/more', backLabel: 'More' },
  '/sleep/history': { title: 'Sleep history', subtitle: 'Past nights', backTo: '/more' },
  '/workouts/planner': { title: 'Weekly planner', subtitle: 'Schedule & reminders', backTo: '/more' },
  '/workouts/progress': { title: 'Workout history', subtitle: 'Volume & PRs', backTo: '/more' },
  '/workouts/plans': { title: 'Saved plans', subtitle: 'Programs & templates', backTo: '/more' },
  '/workouts/library': { title: 'Exercise library', subtitle: 'Form guides & cues', backTo: '/workouts' },
  '/workouts/builder': { title: 'Workout builder', subtitle: 'Session architect', backTo: '/workouts' },
  '/workouts/coach': { title: 'AI coach', subtitle: 'Performance hub', backTo: '/more' }
}

export function hudStackMeta(pathname: string): HudStackMeta | null {
  if (pathname.startsWith('/meals/scan')) return null
  if (pathname === '/routes/track') return null
  const exact = STACK[pathname]
  if (exact) return exact
  return null
}
