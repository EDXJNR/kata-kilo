import MaterialIcon from '@/components/hud/MaterialIcon'
import UserAvatar from '@/components/profile/UserAvatar'
import ViewMoreLink from '@/components/ui/ViewMoreLink'
import { formatDate } from '@/components/ui/FieldInput'
import type { SquadActivityItem } from '@/types/field-log'

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(iso)
}

function activityEmoji(type: SquadActivityItem['type']): string {
  return type === 'route' ? '🏃‍♂️' : '🏋️‍♀️'
}

function activityLabel(type: SquadActivityItem['type']): string {
  return type === 'route' ? 'Outdoor' : 'Workout'
}

export function SquadActivityRow({ item }: { item: SquadActivityItem }) {
  return (
    <li className="flex gap-3 p-3.5 bg-hud-container-lowest rounded-xl border border-hud-outline-variant/25 hover:border-hud-primary/25 transition-colors">
      <UserAvatar name={item.userName} avatarUrl={item.avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-hud-on">{item.userName}</span>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-display text-hud-on-variant bg-hud-container-low px-1.5 py-0.5 rounded-full">
            <span aria-hidden>{activityEmoji(item.type)}</span>
            {activityLabel(item.type)}
          </span>
        </div>
        <p className="text-sm text-hud-on font-medium truncate mt-0.5">{item.title}</p>
        <p className="text-xs text-hud-on-variant truncate">{item.detail}</p>
        <p className="text-[10px] text-hud-primary/80 mt-1 font-display">{formatRelative(item.recordedAt)}</p>
      </div>
      <div
        className="w-10 h-10 rounded-xl bg-hud-primary/10 flex items-center justify-center shrink-0 text-lg"
        aria-hidden
      >
        {activityEmoji(item.type)}
      </div>
    </li>
  )
}

export default function SquadActivityFeed({
  items,
  showViewAll,
  maxItems,
  viewAllTo = '/buddy/squad-activity',
  viewAllLabel = 'View more squad activity'
}: {
  items: SquadActivityItem[]
  showViewAll?: boolean
  maxItems?: number
  viewAllTo?: string
  viewAllLabel?: string
}) {
  const visible = maxItems != null ? items.slice(0, maxItems) : items
  const canViewMore = showViewAll && (maxItems != null ? items.length > 0 : items.length > 0)

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-hud-outline-variant/40 p-4 text-center">
        <p className="text-2xl mb-1" aria-hidden>
          👥
        </p>
        <p className="text-sm text-hud-on-variant">No squad activity yet — log a workout or route.</p>
        {showViewAll ? <ViewMoreLink to={viewAllTo} label={viewAllLabel} /> : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {visible.map((item) => (
          <SquadActivityRow key={item.id} item={item} />
        ))}
      </ul>
      {canViewMore ? <ViewMoreLink to={viewAllTo} label={viewAllLabel} /> : null}
    </div>
  )
}

/** Compact header row for activity sections */
export function SquadActivitySectionHeader({ count }: { count?: number }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <MaterialIcon name="groups" className="text-[18px] text-hud-primary" />
        <span className="text-xs font-semibold uppercase tracking-wide text-hud-on">Squad activity</span>
      </div>
      {count != null ? (
        <span className="text-[10px] font-display text-hud-on-variant">{count} recent</span>
      ) : null}
    </div>
  )
}
