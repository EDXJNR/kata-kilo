type Props = {
  /** sm = in-app header, md = drawer, lg = compact mark (not login hero) */
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16'
}

/** Circular Kata Kilo emblem — favicon / in-app mark (`/logo-icon.png`). */
export default function BrandLogo({ size = 'md', className = '', onClick }: Props) {
  const img = (
    <img
      src="/logo-icon.png"
      alt="Kata Kilo"
      className={`${sizes[size]} rounded-full object-cover shrink-0 pointer-events-none select-none shadow-sm ring-1 ring-black/5`}
      draggable={false}
    />
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Open menu"
        className={`inline-flex items-center shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-hud-primary ${className}`}
      >
        {img}
      </button>
    )
  }

  return <span className={`inline-flex items-center shrink-0 ${className}`}>{img}</span>
}
