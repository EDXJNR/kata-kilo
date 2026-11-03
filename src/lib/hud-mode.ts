import { hudStackMeta } from '@/lib/hud-stack-meta'

/** Primary bottom-nav destinations use the HUD mobile shell. */
export function isHudRoute(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname === '/more') return true
  if (pathname.startsWith('/awards')) return true
  if (pathname.startsWith('/buddy')) return true
  if (pathname.startsWith('/workouts')) return true
  if (pathname.startsWith('/meals')) return true
  if (pathname.startsWith('/routes')) return true
  if (pathname.startsWith('/sleep')) return true
  if (pathname.startsWith('/habits')) return true
  if (pathname.startsWith('/body')) return true
  if (pathname.startsWith('/profile')) return true
  return false
}

export type HudHeaderKind =
  | 'today'
  | 'train'
  | 'walk'
  | 'eat'
  | 'sleep'
  | 'habits'
  | 'scan'
  | 'more'
  | 'stack'
  | 'default'

export function hudHeaderKind(pathname: string): HudHeaderKind {
  if (hudStackMeta(pathname)) return 'stack'
  if (pathname === '/') return 'today'
  if (pathname === '/more') return 'more'
  if (pathname.startsWith('/meals/scan')) return 'scan'
  if (pathname.startsWith('/meals')) return 'eat'
  if (pathname.startsWith('/workouts')) return 'train'
  if (pathname.startsWith('/routes')) return 'walk'
  if (pathname.startsWith('/sleep')) return 'sleep'
  if (pathname.startsWith('/habits')) return 'habits'
  return 'default'
}

export function hudSectionTitle(kind: HudHeaderKind): string {
  switch (kind) {
    case 'today':
      return 'Today'
    case 'train':
      return 'Train'
    case 'walk':
      return 'Walk & Run'
    case 'eat':
      return 'Eat & Nutrition'
    case 'scan':
      return 'Scan meal'
    case 'more':
      return 'More'
    case 'sleep':
      return 'Sleep'
    case 'habits':
      return 'Daily wins'
    case 'stack':
      return 'More'
    default:
      return 'Today'
  }
}
