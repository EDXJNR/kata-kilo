import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { getBreadcrumbs } from '@/lib/breadcrumbs'

export default function MealsHudLayout() {
  const { pathname } = useLocation()
  const title = getBreadcrumbs(pathname).at(-1)?.label ?? 'Eat'

  useEffect(() => {
    const root = document.documentElement
    const prevTheme = root.dataset.theme
    root.dataset.hud = 'true'
    root.dataset.theme = 'dark'
    root.classList.add('dark')
    return () => {
      delete root.dataset.hud
      if (prevTheme) root.dataset.theme = prevTheme
      else root.dataset.theme = 'light'
      root.classList.remove('dark')
    }
  }, [])

  return (
    <div className="hud-shell min-h-full bg-hud-surface text-hud-on font-body-hud">
      <Outlet context={{ hudTitle: title }} />
    </div>
  )
}
