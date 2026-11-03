import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { NAV_SECTIONS } from '@/lib/nav-config'

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function SidebarNav({
  collapsed,
  mobileMenu = false
}: {
  collapsed: boolean
  mobileMenu?: boolean
}) {
  const idleLink = mobileMenu ? 'text-bone/85 hover:text-bone hover:bg-basalt/80' : 'text-fog hover:text-bone hover:bg-basalt2/80'
  const idleChild = mobileMenu ? 'text-bone/75 hover:text-bone hover:bg-basalt/70' : 'text-fog hover:text-bone hover:bg-basalt2/60'
  const sectionLabel = mobileMenu ? 'text-bone/60' : 'text-fog/70'
  const location = useLocation()

  function sectionActive(section: (typeof NAV_SECTIONS)[0]): boolean {
    if (section.to) {
      if (section.end) return location.pathname === section.to
      if (section.prefix) {
        return location.pathname === section.to || location.pathname.startsWith(`${section.to}/`)
      }
      return location.pathname === section.to
    }
    return (
      section.children?.some((c) =>
        c.end ? location.pathname === c.to : location.pathname.startsWith(c.to)
      ) ?? false
    )
  }

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const s of NAV_SECTIONS) {
      if (s.children) init[s.id] = sectionActive(s)
    }
    return init
  })

  useEffect(() => {
    setOpen(() => {
      const next: Record<string, boolean> = {}
      for (const s of NAV_SECTIONS) {
        if (s.children) next[s.id] = sectionActive(s)
      }
      return next
    })
  }, [location.pathname])

  function toggle(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <nav className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0 py-1">
      {!collapsed ? (
        <p className={`px-2.5 pb-1 text-[10px] font-medium uppercase tracking-widest ${sectionLabel}`}>
          Menu
        </p>
      ) : null}

      {NAV_SECTIONS.map((section) => {
        const Icon = section.icon
        const active = sectionActive(section)

        if (!section.children) {
          return (
            <NavLink
              key={section.id}
              to={section.to!}
              end={section.end ?? !section.prefix}
              title={collapsed ? section.label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'
                } ${isActive ? 'bg-primary/15 text-primary' : idleLink}`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed ? <span className="truncate">{section.label}</span> : null}
            </NavLink>
          )
        }

        const expanded = collapsed ? false : (open[section.id] ?? active)

        return (
          <div key={section.id}>
            {collapsed ? (
              <NavLink
                to={section.children[0].to}
                title={section.label}
                className={({ isActive }) =>
                  `flex items-center justify-center rounded-lg p-2.5 transition-colors ${
                    active || isActive ? 'bg-primary/15 text-primary' : idleLink
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px]" />
              </NavLink>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className={`flex items-center w-full rounded-lg text-sm font-medium transition-colors gap-2.5 px-2.5 py-2 ${
                    active ? 'text-primary' : idleLink
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate flex-1 text-left">{section.label}</span>
                  <Chevron open={expanded} />
                </button>

                {expanded ? (
                  <div className="ml-3 pl-3 border-l border-line/60 mt-0.5 mb-1 space-y-0.5">
                    {section.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end={child.end}
                        className={({ isActive }) =>
                          `block rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                            isActive
                              ? 'bg-primary/12 text-primary font-medium'
                              : idleChild
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        )
      })}
    </nav>
  )
}
