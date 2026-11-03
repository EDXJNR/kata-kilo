import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import BrandLoginHero from '@/components/brand/BrandLoginHero'
import { ApiError } from '@/types/field-log'
import { getPreviewCredentials, hasPreviewLogin } from '@/lib/preview-auth'
import { canUseBiometricUnlock, biometricEmailHint } from '@/lib/biometric-unlock'
import MaterialIcon from '@/components/hud/MaterialIcon'

export default function Login() {
  const { user, signIn, signUp, signInWithBiometric } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const location = useLocation()
  const passwordRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const biometricReady = canUseBiometricUnlock()
  const biometricHint = biometricEmailHint()

  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  function clearPasswordField() {
    if (passwordRef.current) passwordRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const password = passwordRef.current?.value ?? ''
    if (!password) return

    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'signup') {
        await signUp(email, password, name || undefined)
      } else {
        await signIn(email, password)
      }
      clearPasswordField()
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Authentication failed')
      clearPasswordField()
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next: 'signin' | 'signup') {
    setMode(next)
    setError(null)
    clearPasswordField()
  }

  async function signInPreview() {
    const creds = getPreviewCredentials()
    if (!creds) return
    setSubmitting(true)
    setError(null)
    try {
      await signIn(creds.email, creds.password)
      clearPasswordField()
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Preview sign-in failed')
      clearPasswordField()
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass =
    'w-full rounded-xl bg-basalt border border-line px-4 py-3 text-sm text-bone placeholder:text-fog/70'

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 py-10 font-body-hud ${
        isDark ? 'bg-black' : 'bg-[#f8f9fa]'
      }`}
    >
      <div className="w-full max-w-md flex flex-col items-center mb-8 px-2">
        <BrandLoginHero />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-bone">
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-fog mt-1">Sign in to access workouts, nutrition, and daily rings.</p>
        </div>

        <form
          method="post"
          autoComplete="on"
          onSubmit={handleSubmit}
          className="rounded-2xl bg-basalt2 border border-line shadow-sm p-6 space-y-4"
        >
          {mode === 'signup' ? (
            <div>
              <label className="block text-xs font-semibold text-fog mb-1.5">Name</label>
              <input
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                className={fieldClass}
              />
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-semibold text-fog mb-1.5">Email address</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fog mb-1.5">Password</label>
            <input
              ref={passwordRef}
              type="password"
              id="password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className={fieldClass}
            />
          </div>

          {error ? <p className="text-alert text-xs pt-1">{error}</p> : null}

          {biometricReady && mode === 'signin' ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setSubmitting(true)
                setError(null)
                void signInWithBiometric()
                  .then((ok) => {
                    if (ok) navigate('/')
                    else setError('Biometric sign-in failed — use your password')
                  })
                  .finally(() => setSubmitting(false))
              }}
              className="w-full py-3 rounded-xl border-2 border-primary/30 text-primary font-display font-semibold text-sm flex items-center justify-center gap-2"
            >
              <MaterialIcon name="fingerprint" className="text-[22px]" />
              {biometricHint ? `Sign in with Face ID · ${biometricHint}` : 'Sign in with Face ID / Touch ID'}
            </button>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dim text-white font-display font-bold text-sm shadow-sm disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in →'}
          </button>

          {hasPreviewLogin() && mode === 'signin' ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void signInPreview()}
              className="w-full rounded-xl border border-primary/40 text-primary text-xs font-semibold uppercase tracking-wider py-3 hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              Sign in with preview account (dev)
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="w-full text-fog text-xs hover:text-bone transition-colors pt-2 border-t border-line"
          >
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={toggleTheme}
          className="mt-6 mx-auto flex items-center gap-2 text-xs text-fog hover:text-bone"
        >
          <span>{isDark ? '☀️ Light mode' : '🌙 Dark mode'}</span>
        </button>
      </div>
    </div>
  )
}
