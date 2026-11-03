import { useEffect, useState } from 'react'
import { PrimaryButton } from '@/components/ui/FieldInput'
import {
  type NotificationSettingsProps,
  useNotificationPermission
} from '@/hooks/useNotificationPermission'

export default function NotificationSettings({
  prefs,
  onSave,
  busy = false,
  variant = 'panel',
  onSaved
}: NotificationSettingsProps) {
  const { permission, request } = useNotificationPermission()
  const [enabled, setEnabled] = useState(prefs.enabled)
  const [time, setTime] = useState(prefs.time)
  const [saved, setSaved] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    setEnabled(prefs.enabled)
    setTime(prefs.time)
  }, [prefs.enabled, prefs.time])

  async function handleAllow() {
    setRequesting(true)
    try {
      const result = await request()
      if (result === 'granted') {
        setEnabled(true)
        await handleSave(true)
      }
    } finally {
      setRequesting(false)
    }
  }

  async function handleSave(nextEnabled = enabled) {
    await onSave({ enabled: nextEnabled, time })
    setSaved(true)
    onSaved?.()
    window.setTimeout(() => setSaved(false), 2000)
  }

  const canRemind = permission === 'granted'
  const needsPermission = permission === 'default' || permission === 'denied'

  const inner = (
    <div className="space-y-4">
      {permission === 'unsupported' ? (
        <p className="text-fog text-sm">Notifications are not supported in this browser.</p>
      ) : (
        <>
          {permission === 'denied' ? (
            <div className="rounded-lg border border-alert/30 bg-alert/10 px-3 py-2 text-sm text-alert">
              Notifications are blocked. Enable them in your browser settings to get workout reminders.
            </div>
          ) : null}

          {needsPermission ? (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <p className="text-sm text-bone font-medium">Get reminded on workout days</p>
              <p className="text-fog text-xs">
                Pick a time below, then allow notifications. We only remind you on days with a scheduled workout — never on rest days.
              </p>
              <div>
                <label className="text-xs text-fog block mb-1">Reminder time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full max-w-[200px] rounded-lg border border-line bg-basalt px-3 py-2.5 text-sm text-bone min-h-[44px]"
                />
              </div>
              <PrimaryButton disabled={requesting || busy} onClick={() => void handleAllow()} className="w-full sm:w-auto">
                {requesting ? 'Requesting…' : 'Allow notifications'}
              </PrimaryButton>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span aria-hidden>✓</span>
                <span>Notifications allowed</span>
              </div>
              <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded border-line w-5 h-5"
                />
                <span className="text-sm text-bone">Remind me on scheduled workout days</span>
              </label>
              <div>
                <label className="text-xs text-fog block mb-1">Reminder time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={!enabled}
                  className="w-full max-w-[200px] rounded-lg border border-line bg-basalt px-3 py-2.5 text-sm text-bone min-h-[44px] disabled:opacity-50"
                />
              </div>
            </>
          )}

          {canRemind || enabled ? (
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton
                disabled={busy || (enabled && !canRemind)}
                onClick={() => void handleSave()}
              >
                Save reminder settings
              </PrimaryButton>
              {saved ? <span className="text-primary text-sm">Saved ✓</span> : null}
            </div>
          ) : null}

          {canRemind && enabled ? (
            <p className="text-fog text-xs">
              Example: &quot;Today&apos;s workout: Upper Body 💪. You&apos;ve got this!&quot;
            </p>
          ) : null}
        </>
      )}
    </div>
  )

  if (variant === 'banner') {
    return (
      <div className="rounded-xl border border-primary/35 bg-gradient-to-br from-primary/10 to-basalt2 p-4 md:p-5">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl shrink-0" aria-hidden>
            🔔
          </span>
          <div>
            <p className="font-display font-semibold text-bone">Never miss a planned workout</p>
            <p className="text-fog text-sm mt-1">
              Set a daily reminder tied to your weekly plan. Pick a time per workout day in the planner — rest days are always skipped.
            </p>
          </div>
        </div>
        {inner}
      </div>
    )
  }

  return inner
}
