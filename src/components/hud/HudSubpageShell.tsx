import type { ReactNode } from 'react'
import MaterialIcon from '@/components/hud/MaterialIcon'

export function HudSubpageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col w-full px-5 lg:px-8 pb-10 gap-4 max-w-lg mx-auto lg:max-w-3xl font-body-hud bg-hud-surface min-h-full mt-1 lg:mt-0 ${className}`}
    >
      {children}
    </div>
  )
}

export function HudIntroBlock({
  eyebrow,
  title,
  description,
  trailing
}: {
  eyebrow?: string
  title: string
  description?: string
  trailing?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 pt-1">
      <div className="min-w-0">
        {eyebrow ? (
          <span className="text-[10px] text-hud-on-variant uppercase tracking-wider font-semibold block">{eyebrow}</span>
        ) : null}
        <h2 className="font-display text-xl font-bold text-hud-on tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-hud-on-variant mt-0.5">{description}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}

export function HudStatCard({
  label,
  value,
  unit,
  hint,
  hintPrimary,
  icon
}: {
  label: string
  value: string | number
  unit?: string
  hint?: string
  hintPrimary?: boolean
  icon?: string
}) {
  return (
    <div className="bg-hud-container-lowest p-3.5 rounded-xl shadow-sm border border-hud-outline-variant/30 flex flex-col justify-between min-h-[100px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-hud-on-variant uppercase tracking-wider font-semibold">{label}</span>
        {icon ? <MaterialIcon name={icon} className="text-[18px] text-hud-primary" /> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold text-hud-on tabular-nums">{value}</span>
        {unit ? <span className="text-sm text-hud-on-variant">{unit}</span> : null}
      </div>
      {hint ? (
        <p className={`text-[10px] mt-1 font-display font-semibold ${hintPrimary ? 'text-hud-primary' : 'text-hud-on-variant'}`}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
