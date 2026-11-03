export const AUTH_TOKEN_KEY = 'katakilo.auth.token'
export const AUTH_REFRESH_KEY = 'katakilo.auth.refresh'
export const AUTH_USER_KEY = 'katakilo.auth.user'

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(AUTH_REFRESH_KEY)
}

export function setStoredAuth(token: string, user: unknown, refreshToken?: string | null) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  if (refreshToken) localStorage.setItem(AUTH_REFRESH_KEY, refreshToken)
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_REFRESH_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
