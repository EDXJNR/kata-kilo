import { Link } from 'react-router-dom'
import MaterialIcon from '@/components/hud/MaterialIcon'

export default function ViewMoreLink({ to, label = 'View more' }: { to: string; label?: string }) {
  return (
    <Link
      to={to}
      className="mt-1 flex items-center justify-center gap-1 w-full py-2.5 rounded-xl border border-hud-outline-variant/30 bg-hud-container-low text-sm font-display font-semibold text-hud-primary hover:bg-hud-container-high transition-colors"
    >
      {label}
      <MaterialIcon name="arrow_forward" className="text-[16px]" />
    </Link>
  )
}
