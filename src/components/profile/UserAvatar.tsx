import { displayName, initials } from '@/lib/display-name'

type Props = {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-16 h-16 text-lg' }

export default function UserAvatar({ name, email, avatarUrl, size = 'sm', className = '' }: Props) {
  const label = displayName({ name, email })
  const dim = sizes[size]

  if (avatarUrl?.trim()) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${dim} rounded-full object-cover shrink-0 bg-hud-container-high ring-2 ring-white dark:ring-hud-container-lowest ${className}`}
      />
    )
  }

  return (
    <span
      className={`${dim} rounded-full shrink-0 flex items-center justify-center font-display font-bold bg-hud-primary text-white ring-2 ring-white dark:ring-hud-container-lowest ${className}`}
      aria-hidden
    >
      {initials(label)}
    </span>
  )
}
