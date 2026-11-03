import { Link, useLocation } from 'react-router-dom'
import { getBreadcrumbs } from '@/lib/breadcrumbs'

type Props = {
  onMenuOpen: () => void
  onSearchOpen: () => void
}

export default function MobileTopBar({ onMenuOpen, onSearchOpen }: Props) {
  const location = useLocation()
  const crumbs = getBreadcrumbs(location.pathname)
  const title = crumbs[crumbs.length - 1]?.label ?? 'Today'
  const onHome = location.pathname === '/'

  return (
    <header className="sticky top-0 z-30 lg:hidden border-b border-line bg-obsidian/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2 px-3 min-h-[52px]">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-fog hover:text-bone hover:bg-basalt2/80 shrink-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>

        {onHome ? (
          <Link to="/" className="font-display text-base font-bold tracking-tight text-bone truncate flex-1">
            KATA KILO
          </Link>
        ) : (
          <h1 className="font-display text-base font-bold tracking-tight text-bone truncate flex-1">{title}</h1>
        )}

        <button
          type="button"
          onClick={onSearchOpen}
          aria-label="Search"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-fog hover:text-bone hover:bg-basalt2/80 shrink-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}
