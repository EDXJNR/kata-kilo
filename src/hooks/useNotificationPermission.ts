import { useCallback, useEffect, useState } from 'react'
import type { ReminderPreferences } from '@/types/field-log'

export type NotificationPermission = 'unsupported' | 'default' | 'granted' | 'denied'

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission as NotificationPermission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'unsupported'
  const result = await Notification.requestPermission()
  return result as NotificationPermission
}

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>(() => getNotificationPermission())

  useEffect(() => {
    setPermission(getNotificationPermission())
  }, [])

  const request = useCallback(async () => {
    const next = await requestNotificationPermission()
    setPermission(next)
    return next
  }, [])

  return { permission, request, refresh: () => setPermission(getNotificationPermission()) }
}

export type NotificationSettingsProps = {
  prefs: ReminderPreferences
  onSave: (prefs: ReminderPreferences) => Promise<void> | void
  busy?: boolean
  /** Prominent callout for weekly planner */
  variant?: 'panel' | 'banner'
  onSaved?: () => void
}
