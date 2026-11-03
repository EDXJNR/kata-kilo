import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { isHudRoute } from '@/lib/hud-mode'

/** Applies HUD design tokens on primary tabs; follows user light/dark preference. */
export function useHudShell() {
  const { pathname } = useLocation()
  const { theme } = useTheme()
  const active = isHudRoute(pathname)

  useEffect(() => {
    if (!active) {
      delete document.documentElement.dataset.hud
      return
    }
    const root = document.documentElement
    root.dataset.hud = theme === 'dark' ? 'dark' : 'light'
    root.dataset.theme = theme
    root.classList.toggle('dark', theme === 'dark')
    return () => {
      delete root.dataset.hud
    }
  }, [active, theme])

  return active
}
