import { useAutoSteps } from '@/components/activity/AutoStepTrackerRunner'

export default function MotionPermissionBanner() {
  const { needsMotionPermission, grantMotion, tracking } = useAutoSteps()

  if (!needsMotionPermission) return null

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-pink-500/5 to-transparent px-4 py-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-bone">
        Allow location while using the app so steps count from real walks (GPS pace), not phone shakes.
      </p>
      <button
        type="button"
        onClick={() => void grantMotion()}
        className="text-sm font-semibold text-primary hover:underline shrink-0"
      >
        Allow motion
      </button>
      {tracking ? <span className="text-xs text-fog w-full">Location assist is active.</span> : null}
    </div>
  )
}
