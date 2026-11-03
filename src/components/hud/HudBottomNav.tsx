import { NavLink, useLocation } from 'react-router-dom'
import MaterialIcon from '@/components/hud/MaterialIcon'

const TABS = [
  { to: '/', label: 'Today', icon: 'radio_button_checked', end: true as const },
  { to: '/workouts', label: 'Train', icon: 'fitness_center', prefix: '/workouts' },
  { to: '/routes/track', label: 'Walk', icon: 'directions_walk', prefix: '/routes' },
  { to: '/sleep', label: 'Sleep', icon: 'bedtime', prefix: '/sleep' },
  { to: '/more', label: 'More', icon: 'grid_view', end: true as const }
]

export default function HudBottomNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)] bg-hud-container-lowest/95 backdrop-blur-xl border-t border-hud-outline-variant/60 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 px-5">
        {TABS.map(({ to, label, icon, end, prefix }) => {
          const prefixActive = prefix
            ? location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
            : false
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => {
                const on = isActive || prefixActive
                return `flex flex-col items-center justify-center gap-1 min-w-[56px] h-12 transition-all duration-200 text-[10px] font-display uppercase tracking-wider ${
                  on ? 'text-hud-primary font-bold' : 'text-hud-on-variant font-semibold hover:text-hud-on'
                }`
              }}
            >
              <MaterialIcon name={icon} className="text-[22px]" />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
