import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export default function InstallPrompt() {
  const { canInstall, showIosHint, install, dismiss } = useInstallPrompt()

  if (!canInstall && !showIosHint) return null

  return (
    <div
      className="fixed z-50 left-3 right-3 md:left-auto md:right-6 md:max-w-sm rounded-xl border border-line bg-basalt2/95 backdrop-blur-md shadow-lg p-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6"
      role="region"
      aria-label="Install app"
    >
      <p className="text-sm font-medium text-bone">Install KATA KILO</p>
      {showIosHint ? (
        <p className="text-xs text-fog mt-1">
          Tap <span className="text-bone">Share</span> in Safari, then choose{' '}
          <span className="text-bone">Add to Home Screen</span>.
        </p>
      ) : (
        <p className="text-xs text-fog mt-1">Add to your home screen for quick access, even offline.</p>
      )}
      <div className="flex gap-2 mt-3">
        {canInstall ? (
          <button
            type="button"
            onClick={() => void install()}
            className="flex-1 min-h-[44px] rounded-lg bg-primary text-obsidian text-sm font-semibold px-3"
          >
            Install
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className={`min-h-[44px] rounded-lg border border-line text-fog text-sm px-3 hover:text-bone ${canInstall ? '' : 'flex-1'}`}
        >
          Not now
        </button>
      </div>
    </div>
  )
}
