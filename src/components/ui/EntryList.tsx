import type { ReactNode } from 'react'

export default function EntryList({
  items
}: {
  items: { id: string; title: string; meta?: string; detail?: ReactNode }[]
}) {
  if (items.length === 0) return null

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="py-3 flex items-start justify-between gap-4">
          <div>
            <div className="text-bone text-sm">{item.title}</div>
            {item.detail ? <div className="text-fog text-xs mt-1">{item.detail}</div> : null}
          </div>
          {item.meta ? <div className="text-fog text-[11px] font-mono shrink-0">{item.meta}</div> : null}
        </li>
      ))}
    </ul>
  )
}
