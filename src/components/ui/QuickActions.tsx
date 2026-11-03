import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'

export type QuickAction = {
  to: string
  label: string
  hint?: string
  icon: ComponentType<{ className?: string }>
  accent?: string
}

export default function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map(({ to, label, hint, icon: Icon, accent = 'rgb(74, 222, 128)' }) => (
        <Link
          key={to}
          to={to}
          className="group flex flex-col items-start gap-2 rounded-2xl border border-line/60 bg-basalt2/50 p-4 min-h-[88px] hover:border-primary/35 hover:bg-basalt2 transition-colors touch-manipulation"
        >
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl border transition-colors"
            style={{ borderColor: `${accent}44`, background: `${accent}14`, color: accent }}
          >
            <Icon className="w-5 h-5" />
          </span>
          <span className="text-bone text-sm font-semibold leading-tight">{label}</span>
          {hint ? <span className="text-fog text-[11px] leading-snug">{hint}</span> : null}
        </Link>
      ))}
    </div>
  )
}
