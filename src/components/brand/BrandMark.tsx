/** Visible mark on light HUD backgrounds (no blend modes). */
export default function BrandMark({ className = '', size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="40" height="40" rx="10" className="fill-emerald-600 dark:fill-hud-primary" />
      <path
        d="M20 10 L30 26 L20 22 L10 26 Z"
        className="fill-white"
        stroke="white"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="19" r="2.5" className="fill-emerald-100 dark:fill-emerald-200" />
    </svg>
  )
}
