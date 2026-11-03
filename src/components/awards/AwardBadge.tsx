import MaterialIcon from '@/components/hud/MaterialIcon'

type Props = {
  title: string
  emoji: string
  earned: boolean
  statusLabel: string
  size?: 'sm' | 'md'
}

export default function AwardBadge({ title, emoji, earned, statusLabel, size = 'md' }: Props) {
  const compact = size === 'sm'

  return (
    <div
      className={`bg-hud-container-lowest rounded-xl shadow-sm flex flex-col items-center text-center border border-hud-outline-variant/20 ${
        compact ? 'p-2.5' : 'p-3'
      } ${earned ? '' : 'opacity-80'}`}
    >
      <div className={`relative mb-2 flex items-center justify-center ${compact ? 'w-12 h-12' : 'w-14 h-14'}`}>
        {earned ? (
          <>
            <div className="absolute inset-0 rounded-full bg-hud-primary/15" />
            <div
              className={`rounded-full bg-gradient-to-br from-hud-primary/90 to-emerald-700 flex items-center justify-center shadow-sm ring-2 ring-hud-primary/30 ${
                compact ? 'w-10 h-10 text-xl' : 'w-11 h-11 text-2xl'
              }`}
              aria-hidden
            >
              {emoji}
            </div>
            <MaterialIcon
              name="check_circle"
              className="absolute -bottom-0.5 -right-0.5 text-hud-primary text-[14px] bg-hud-container-lowest rounded-full"
              filled
            />
          </>
        ) : (
          <div
            className={`rounded-full bg-hud-container-high flex items-center justify-center grayscale opacity-60 ${
              compact ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl'
            }`}
            aria-hidden
          >
            {emoji}
          </div>
        )}
      </div>
      <span className={`font-semibold text-hud-on leading-tight ${compact ? 'text-[11px]' : 'text-[13px]'}`}>{title}</span>
      <span className={`text-hud-primary uppercase mt-1 font-display ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
        {statusLabel}
      </span>
    </div>
  )
}
