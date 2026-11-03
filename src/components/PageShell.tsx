import type { ReactNode } from 'react'

export default function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-4 md:px-6 lg:px-8 pt-8 pb-10 space-y-6 ${className}`}>
      {children}
    </div>
  )
}
