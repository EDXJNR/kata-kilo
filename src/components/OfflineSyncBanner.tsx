import { useOfflineWorkoutSync } from '@/hooks/useOfflineWorkoutSync'

export default function OfflineSyncBanner() {
  const { pendingCount, syncing, syncNow } = useOfflineWorkoutSync()
  if (pendingCount === 0) return null

  return (
    <div className="mx-4 md:mx-6 lg:mx-8 mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-bone">
        {pendingCount} workout{pendingCount > 1 ? 's' : ''} waiting to sync
        {!navigator.onLine ? ' (offline)' : ''}
      </p>
      <button
        type="button"
        disabled={syncing || !navigator.onLine}
        onClick={() => void syncNow()}
        className="text-xs font-mono text-primary hover:underline disabled:opacity-50"
      >
        {syncing ? 'Syncing…' : 'Sync now'}
      </button>
    </div>
  )
}
