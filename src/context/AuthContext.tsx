import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { refreshAccessToken, logoutLocal } from '@/lib/auth-refresh'
import { getStoredRefreshToken, getStoredToken, getStoredUser, setStoredAuth } from '@/lib/session'
import { verifyBiometricUnlock } from '@/lib/biometric-unlock'
import type { User } from '@/types/field-log'
import { ApiError } from '@/types/field-log'

type AuthContextValue = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithBiometric: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      const token = getStoredToken()
      const cached = getStoredUser<User>()
      if (!token || !cached) {
        setLoading(false)
        return
      }

      setUser(cached)
      try {
        const { user: fresh } = await api.auth.me()
        setUser(fresh)
        setStoredAuth(token, fresh, getStoredRefreshToken())
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            try {
              const { user: fresh } = await api.auth.me()
              setUser(fresh)
              setStoredAuth(refreshed, fresh, getStoredRefreshToken())
            } catch {
              logoutLocal()
              setUser(null)
            }
          } else {
            logoutLocal()
            setUser(null)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [])

  async function signIn(email: string, password: string) {
    const { token, refreshToken, user: sessionUser } = await api.auth.signIn(email, password)
    setStoredAuth(token, sessionUser, refreshToken)
    setUser(sessionUser)
  }

  async function signUp(email: string, password: string, name?: string) {
    const { token, refreshToken, user: sessionUser } = await api.auth.signUp(email, password, name)
    setStoredAuth(token, sessionUser, refreshToken)
    setUser(sessionUser)
  }

  async function signOut() {
    try {
      await api.auth.signOut()
    } catch {
      // clear local session even if network fails
    }
    logoutLocal()
    setUser(null)
  }

  async function signInWithBiometric(): Promise<boolean> {
    const ok = await verifyBiometricUnlock()
    if (!ok) return false
    const token = await refreshAccessToken()
    if (!token) return false
    const { user: fresh } = await api.auth.me()
    setStoredAuth(token, fresh, getStoredRefreshToken())
    setUser(fresh)
    return true
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithBiometric }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
