import { useLocation } from 'react-router-dom'
import FitnessLoader, { loaderVariantForPath, type LoaderVariant } from '@/components/ui/FitnessLoader'

export default function LoadingState({
  label,
  variant
}: {
  label?: string
  variant?: LoaderVariant
}) {
  const { pathname } = useLocation()
  const v = variant ?? loaderVariantForPath(pathname)

  return <FitnessLoader variant={v} label={label} />
}
