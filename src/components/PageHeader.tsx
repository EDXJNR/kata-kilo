import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getBreadcrumbs } from '@/lib/breadcrumbs'

function BreadcrumbSep() {
  return (
    <svg className="w-3.5 h-3.5 text-fog/50 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PageHeader({
  title,
  subtitle,
  action,
  breadcrumbs: breadcrumbsOverride
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  /** Override auto-detected breadcrumbs */
  breadcrumbs?: { label: string; to?: string }[]
}) {
  const { pathname } = useLocation()
  const breadcrumbs = breadcrumbsOverride ?? getBreadcrumbs(pathname)

  return (
    <header className="page-header shrink-0 px-4 md:px-6 lg:px-8 pt-4 md:pt-6 pb-6 md:pb-8 border-b border-line bg-basalt2/30">
      <nav aria-label="Breadcrumb" className="hidden md:flex items-center flex-wrap gap-1.5 text-sm mb-5">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1
          return (
            <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              {i > 0 ? <BreadcrumbSep /> : null}
              {crumb.to && !isLast ? (
                <Link to={crumb.to} className="text-fog hover:text-primary transition-colors truncate">
                  {crumb.label}
                </Link>
              ) : (
                <span className={`truncate ${isLast ? 'text-bone/80' : 'text-fog'}`}>{crumb.label}</span>
              )}
            </span>
          )
        })}
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl md:text-[1.75rem] font-bold text-bone tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle ? <p className="text-fog text-sm mt-1.5 leading-relaxed max-w-xl">{subtitle}</p> : null}
        </div>
        {action ? (
          <div className="shrink-0 flex flex-wrap items-center gap-2 sm:pt-0.5 [&_button]:min-h-[44px] [&_a]:min-h-[44px]">
            {action}
          </div>
        ) : null}
      </div>
    </header>
  )
}
