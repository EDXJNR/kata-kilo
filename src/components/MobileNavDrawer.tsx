import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SidebarNav from '@/components/SidebarNav'
import { APP_TAGLINE } from '@/lib/brand'
import BrandLogo from '@/components/brand/BrandLogo'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

type Props = {
  open: boolean
  onClose: () => void
}

export default function MobileNavDrawer({ open, onClose }: Props) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-40 bg-obsidian/70 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      <aside
        className="fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] flex flex-col bg-basalt2/98 backdrop-blur-xl border-r border-line shadow-2xl lg:hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line shrink-0">
          <Link to="/" onClick={onClose} className="min-h-[44px] flex flex-col justify-center gap-1">
            <BrandLogo size="md" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-primary">{APP_TAGLINE}</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-fog hover:text-bone hover:bg-basalt2/80"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3" onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) onClose()
        }}>
          <SidebarNav collapsed={false} mobileMenu />
        </div>

        <div className="shrink-0 px-4 py-3 border-t border-line space-y-2">
          <p className="text-xs text-bone/80 truncate">{user?.email}</p>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full min-h-[44px] rounded-lg border border-line text-sm text-fog hover:text-bone hover:bg-basalt2/80 flex items-center justify-center gap-2"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              void signOut()
            }}
            className="w-full min-h-[44px] rounded-lg border border-line text-sm text-fog hover:text-bone hover:bg-basalt2/80"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
