import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useNav } from '@/context/NavContext'
import { useTheme } from '@/context/ThemeContext'
import { APP_TAGLINE } from '@/lib/brand'
import { displayName } from '@/lib/display-name'
import { IconLogout, MOBILE_NAV } from '@/lib/nav-config'
import SidebarNav from '@/components/SidebarNav'
import NavToggle from '@/components/ui/NavToggle'
import MobileTopBar from '@/components/MobileTopBar'
import HudMobileHeader from '@/components/hud/HudMobileHeader'
import HudBottomNav from '@/components/hud/HudBottomNav'
import { useHudShell } from '@/hooks/useHudShell'
import { hudHeaderKind } from '@/lib/hud-mode'
import MobileNavDrawer from '@/components/MobileNavDrawer'
import InstallPrompt from '@/components/InstallPrompt'
import GlobalSearch from '@/components/GlobalSearch'
import WorkoutRemindersRunner from '@/components/WorkoutRemindersRunner'
import OfflineSyncBanner from '@/components/OfflineSyncBanner'
import OfflineStatusBar from '@/components/OfflineStatusBar'
import { AutoStepProvider } from '@/components/activity/AutoStepTrackerRunner'
import { IconSearch } from '@/components/ui/Icons'

export default function Layout() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { collapsed, toggle } = useNav()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const hudShell = useHudShell()
  const headerKind = hudHeaderKind(location.pathname)
  const scanStack = location.pathname.startsWith('/meals/scan')
  const [walkGpsActive, setWalkGpsActive] = useState(false)
  useEffect(() => {
    const onGps = (e: Event) => {
      const active = (e as CustomEvent<{ active: boolean }>).detail?.active ?? false
      setWalkGpsActive(active)
    }
    const onSearch = () => setSearchOpen(true)
    window.addEventListener('katakilo:gps', onGps)
    window.addEventListener('katakilo:search-open', onSearch)
    return () => {
      window.removeEventListener('katakilo:gps', onGps)
      window.removeEventListener('katakilo:search-open', onSearch)
    }
  }, [])

  return (
    <AutoStepProvider>
    <div className="min-h-screen flex bg-basalt">
      <aside
        className={`hidden md:flex md:flex-col shrink-0 border-r border-line bg-basalt2/40 transition-all duration-300 ease-out h-screen sticky top-0 ${
          collapsed ? 'w-[56px] px-1.5 py-3' : 'w-[240px] px-3 py-4'
        }`}
      >
        <div
          className={`flex items-center shrink-0 mb-3 ${collapsed ? 'justify-center' : 'justify-between px-1 gap-2'}`}
        >
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold text-sm tracking-tight text-primary truncate">KATA KILO</div>
              <div className="text-fog text-[10px] font-medium truncate">{APP_TAGLINE}</div>
            </div>
          ) : null}
          <NavToggle collapsed={collapsed} onClick={toggle} />
        </div>

        <SidebarNav collapsed={collapsed} />

        {!collapsed ? (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 w-full rounded-lg border border-line/80 px-2.5 py-2 mt-2 text-xs text-fog hover:text-bone hover:border-primary/40 transition-colors"
          >
            <IconSearch className="w-4 h-4 shrink-0" />
            <span>Search…</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            title="Search"
            className="flex items-center justify-center rounded-lg p-2.5 mt-2 text-fog hover:text-bone hover:bg-basalt2/80 w-full"
          >
            <IconSearch className="w-[18px] h-[18px]" />
          </button>
        )}

        <div className="shrink-0 mt-3 pt-3 border-t border-line/50 space-y-0.5">
          {!collapsed && user?.email ? (
            <div className="px-2.5 py-2 mb-1">
              <p className="text-bone text-xs font-medium truncate">{displayName(user)}</p>
              <p className="text-fog text-[10px] truncate">{user.email}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className={`flex items-center rounded-lg text-sm text-fog hover:text-primary hover:bg-basalt2/80 transition-colors w-full ${
              collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'
            }`}
          >
            <span className="text-base leading-none">{theme === 'dark' ? '☀️' : '🌙'}</span>
            {!collapsed ? <span className="text-xs font-medium">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span> : null}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            title="Sign out"
            className={`flex items-center rounded-lg text-sm text-fog hover:text-alert hover:bg-basalt2/80 transition-colors w-full ${
              collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'
            }`}
          >
            <IconLogout className="w-[18px] h-[18px] shrink-0" />
            {!collapsed ? <span className="text-xs font-medium">Sign out</span> : null}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <OfflineStatusBar />
        {hudShell ? (
          <HudMobileHeader
            headerKind={headerKind}
            gpsActive={headerKind === 'walk' && walkGpsActive}
            onMenuOpen={() => setMobileMenuOpen(true)}
            onSearchOpen={() => setSearchOpen(true)}
          />
        ) : (
          <MobileTopBar onMenuOpen={() => setMobileMenuOpen(true)} onSearchOpen={() => setSearchOpen(true)} />
        )}
        <main
          className={`flex-1 flex flex-col min-h-0 animate-page-in ${
            hudShell
              ? scanStack
                ? 'pb-[env(safe-area-inset-bottom)] md:pb-0 bg-hud-surface text-hud-on'
                : 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 bg-hud-surface text-hud-on'
              : 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0'
          }`}
        >
          <OfflineSyncBanner />
          <Outlet />
        </main>
      </div>

      <MobileNavDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <WorkoutRemindersRunner />
      <InstallPrompt />

      {hudShell && !scanStack ? (
        <HudBottomNav />
      ) : !hudShell ? (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-basalt2/95 backdrop-blur-md border-t border-line flex z-20 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV.map(({ to, label, icon: Icon, end, activePrefix }) => {
            const prefixActive = activePrefix
              ? location.pathname === activePrefix || location.pathname.startsWith(`${activePrefix}/`)
              : false
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 min-h-[52px] py-1.5 px-0.5 text-[10px] font-medium transition-colors touch-manipulation ${
                    isActive || prefixActive ? 'text-primary' : 'text-fog'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate max-w-full">{label}</span>
              </NavLink>
            )
          })}
        </nav>
      ) : null}
    </div>
    </AutoStepProvider>
  )
}
