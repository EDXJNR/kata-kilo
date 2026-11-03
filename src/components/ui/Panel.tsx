import type { ReactNode } from 'react'

export default function Panel({
  title,
  children,
  className = '',
  variant = 'raised'
}: {
  title?: string
  children: ReactNode
  className?: string
  /** 'raised' — bordered card, use for the one hero element on a page.
   *  'quiet' — no box, just a label and a top hairline. Use this as the
   *  default for everything else so raised cards keep their weight. */
  variant?: 'raised' | 'quiet'
}) {
  if (variant === 'quiet') {
    return (
      <section className={`pt-3 ${className}`}>
        {title ? (
          <div className="text-fog text-xs font-medium mb-2">{title}</div>
        ) : null}
        {children}
      </section>
    )
  }

  return (
    <section
      className={`rounded-2xl border border-line/80 bg-basalt2/90 backdrop-blur-sm p-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.65)] ${className}`}
    >
      {title ? (
        <div className="text-fog text-xs font-medium mb-3">{title}</div>
      ) : null}
      {children}
    </section>
  )
}
