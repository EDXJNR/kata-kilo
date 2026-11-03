import { getApiBaseUrl } from '@/lib/config'
import {
  clearStoredAuth,
  getStoredRefreshToken,
  getStoredUser,
  setStoredAuth
} from '@/lib/session'
import type { User } from '@/types/field-log'

let refreshPromise: Promise<string | null> | null = null

/** Refresh Supabase access token using stored refresh token. Returns new access token or null. */
export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getStoredRefreshToken()
  if (!refresh) return null

  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh })
      })
      if (!res.ok) return null
      const payload = (await res.json()) as { token?: string; refreshToken?: string; user?: User }
      if (!payload.token) return null
      const user = payload.user ?? getStoredUser<User>()
      if (user) setStoredAuth(payload.token, user, payload.refreshToken ?? refresh)
      else setStoredAuth(payload.token, { id: '', email: '' }, payload.refreshToken ?? refresh)
      return payload.token
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export function logoutLocal() {
  clearStoredAuth()
}
