import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/brand/BrandLogo'
import MaterialIcon from '@/components/hud/MaterialIcon'
import type { HudHeaderKind } from '@/lib/hud-mode'
import { hudSectionTitle } from '@/lib/hud-mode'
import { hudStackMeta } from '@/lib/hud-stack-meta'
import { useLocation } from 'react-router-dom'

type Props = {
  headerKind: HudHeaderKind
  onMenuOpen: () => void
  onSearchOpen: () => void
  gpsActive?: boolean
}

function formatHeaderDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
}

export default function HudMobileHeader({ headerKind, onMenuOpen, onSearchOpen, gpsActive }: Props) {
  const title = hudSectionTitle(headerKind)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const stack = headerKind === 'stack' ? hudStackMeta(pathname) : null

  return (
    <header className="sticky top-0 inset-x-0 z-30 lg:hidden bg-hud-container-lowest/95 backdrop-blur-xl pt-[env(safe-area-inset-top)] shadow-sm border-b border-hud-outline-variant/60">
      <div className="h-16 px-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {headerKind === 'stack' && stack ? (
            <>
              <button
                type="button"
                aria-label="Go back"
                onClick={() => navigate(stack.backTo)}
                className="w-10 h-10 flex items-center justify-center text-hud-on hover:text-hud-primary rounded-full hover:bg-hud-container-high transition-colors shrink-0"
              >
                <MaterialIcon name="arrow_back" className="text-[24px]" />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-base font-bold uppercase tracking-wider text-hud-on leading-tight truncate">
                  {stack.title}
                </h1>
                {stack.subtitle ? (
                  <p className="text-[10px] text-hud-on-variant font-medium truncate">{stack.subtitle}</p>
                ) : null}
              </div>
            </>
          ) : headerKind === 'scan' ? (
            <>
              <button
                type="button"
                aria-label="Go back"
                onClick={() => navigate('/meals')}
                className="w-10 h-10 flex items-center justify-center text-hud-on hover:text-hud-primary rounded-full hover:bg-hud-container-high transition-colors shrink-0"
              >
                <MaterialIcon name="arrow_back" className="text-[24px]" />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-base font-bold uppercase tracking-wider text-hud-on leading-tight truncate">
                  Calorie scan
                </h1>
                <p className="text-[10px] text-hud-on-variant font-medium">Photo · macros · log</p>
              </div>
            </>
          ) : headerKind === 'today' ? (
            <>
              <BrandLogo size="sm" onClick={onMenuOpen} />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-hud-on-variant capitalize tracking-wide truncate">
                  {formatHeaderDate()}
                </span>
                <h1 className="font-display text-xl font-bold tracking-tight text-hud-on truncate">{title}</h1>
              </div>
            </>
          ) : headerKind === 'walk' ? (
            <>
              <BrandLogo size="sm" onClick={onMenuOpen} />
              <div className="min-w-0">
                <h1 className="font-display text-base font-bold uppercase tracking-wide text-hud-on leading-tight truncate">
                  {title}
                </h1>
                {gpsActive ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-hud-primary animate-pulse" />
                    <span className="text-[10px] text-hud-primary font-bold uppercase tracking-wider">GPS active</span>
                  </div>
                ) : null}
              </div>
            </>
          ) : headerKind === 'sleep' ? (
            <>
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-hud-primary/10 flex items-center justify-center text-hud-primary shrink-0">
                <MaterialIcon name="bedtime" className="text-[20px]" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base font-bold uppercase tracking-wider text-hud-on leading-tight">Sleep</h1>
                <p className="text-[10px] text-hud-on-variant font-medium">Recovery &amp; rhythm</p>
              </div>
            </>
          ) : headerKind === 'habits' ? (
            <>
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-hud-primary/10 flex items-center justify-center text-hud-primary shrink-0">
                <MaterialIcon name="local_fire_department" className="text-[20px]" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base font-bold uppercase tracking-wider text-hud-on leading-tight">Daily wins</h1>
                <p className="text-[10px] text-hud-on-variant font-medium">Micro-habits &amp; streaks</p>
              </div>
            </>
          ) : headerKind === 'more' ? (
            <>
              <BrandLogo size="sm" onClick={onMenuOpen} />
              <div className="min-w-0">
                <h1 className="font-display text-base font-bold uppercase tracking-wider text-hud-on leading-tight">
                  More
                </h1>
                <p className="text-[10px] text-hud-on-variant font-medium">Tools, logs &amp; account</p>
              </div>
            </>
          ) : headerKind === 'eat' ? (
            <>
              <BrandLogo size="sm" onClick={onMenuOpen} />
              <div className="flex items-center gap-2 min-w-0">
                <MaterialIcon name="restaurant" className="text-hud-primary text-[22px] shrink-0" />
                <h1 className="font-display text-base font-bold text-hud-on truncate">{title}</h1>
              </div>
            </>
          ) : (
            <>
              <BrandLogo size="sm" onClick={onMenuOpen} />
              <h1 className="font-display text-[22px] font-bold tracking-tight text-hud-on truncate">{title}</h1>
            </>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {headerKind !== 'sleep' && headerKind !== 'scan' && headerKind !== 'stack' ? (
            <button
              type="button"
              onClick={onSearchOpen}
              aria-label="Search"
              className="w-10 h-10 flex items-center justify-center text-hud-on-variant hover:text-hud-on rounded-full hover:bg-hud-container-high transition-colors"
            >
              <MaterialIcon name="search" className="text-[20px]" />
            </button>
          ) : null}
          {headerKind === 'scan' ? (
            <button
              type="button"
              aria-label="Scan options"
              className="w-10 h-10 flex items-center justify-center text-hud-on-variant hover:text-hud-primary rounded-full hover:bg-hud-container-high transition-colors"
            >
              <MaterialIcon name="more_vert" className="text-[22px]" />
            </button>
          ) : null}
          {headerKind === 'more' || headerKind === 'sleep' ? (
            <Link
              to="/awards"
              aria-label="Awards"
              className="w-10 h-10 flex items-center justify-center text-hud-on-variant hover:text-hud-primary rounded-full hover:bg-hud-container-high transition-colors"
            >
              <MaterialIcon name="military_tech" className="text-[22px]" />
            </Link>
          ) : headerKind !== 'today' && headerKind !== 'train' ? (
            <button
              type="button"
              aria-label="Notifications"
              className="relative w-10 h-10 flex items-center justify-center text-hud-on-variant hover:text-hud-on rounded-full hover:bg-hud-container-high transition-colors"
            >
              <MaterialIcon name="notifications" className="text-[20px]" />
            </button>
          ) : null}
          <Link
            to="/profile"
            className={`w-9 h-9 rounded-full flex items-center justify-center ml-0.5 shadow-sm ${
              headerKind === 'more'
                ? 'bg-hud-container-high text-hud-on hover:text-hud-primary border border-hud-outline-variant/50'
                : headerKind === 'sleep' || headerKind === 'eat' || headerKind === 'train'
                  ? 'bg-hud-primary-container text-white'
                  : 'bg-slate-900 dark:bg-hud-primary text-white'
            }`}
            aria-label={headerKind === 'more' ? 'Profile and settings' : 'Profile'}
          >
            <MaterialIcon name={headerKind === 'more' ? 'settings' : 'person'} className="text-[18px]" />
          </Link>
        </div>
      </div>
    </header>
  )
}
