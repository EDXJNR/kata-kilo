import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { HudIntroBlock, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import NotificationSettings from '@/components/NotificationSettings'
import UserAvatar from '@/components/profile/UserAvatar'
import { FieldLabel, PrimaryButton, TextField, formatDate } from '@/components/ui/FieldInput'
import LoadingState from '@/components/ui/LoadingState'
import { useTheme } from '@/context/ThemeContext'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { displayName } from '@/lib/display-name'
import { fileToAvatarDataUrl } from '@/lib/avatar-upload'
import { clearBiometricUnlock, registerBiometricUnlock } from '@/lib/biometric-unlock'
import { setStoredAuth, getStoredRefreshToken, getStoredToken } from '@/lib/session'

const GOALS = ['general', 'muscle', 'strength', 'weight_loss', 'endurance']
const LEVELS = ['beginner', 'intermediate', 'advanced']
const EQUIPMENT = ['bodyweight', 'dumbbells', 'barbell', 'gym', 'kettlebell', 'cables']
const DAYS = [
  { v: 0, l: 'Sun' }, { v: 1, l: 'Mon' }, { v: 2, l: 'Tue' }, { v: 3, l: 'Wed' },
  { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' }
]

export default function ProfileAccount() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { data, loading, error, reload } = useAsyncData(() => api.profile.get())
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [fitnessGoal, setFitnessGoal] = useState('general')
  const [experience, setExperience] = useState('beginner')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [duration, setDuration] = useState('45')
  const [trainingDays, setTrainingDays] = useState<number[]>([1, 3, 5])
  const [equipment, setEquipment] = useState<string[]>(['gym', 'barbell'])
  const [saving, setSaving] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [reminderBusy, setReminderBusy] = useState(false)
  const [bioBusy, setBioBusy] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!data) return
    if (data.name) setName(data.name)
    if (data.fitness_goal) setFitnessGoal(data.fitness_goal)
    if (data.experience_level) setExperience(data.experience_level)
    if (data.height_cm) setHeight(String(data.height_cm))
    if (data.weight_kg) setWeight(String(data.weight_kg))
    if (data.preferred_duration_min) setDuration(String(data.preferred_duration_min))
    if (data.training_days?.length) setTrainingDays(data.training_days)
    if (data.equipment?.length) setEquipment(data.equipment)
  }, [data])

  const shownName = displayName({ name: data?.name ?? name, email: data?.email ?? user?.email })

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.profile.update({
        name: name.trim() || undefined,
        fitness_goal: fitnessGoal,
        experience_level: experience,
        height_cm: height ? Number(height) : undefined,
        weight_kg: weight ? Number(weight) : undefined,
        preferred_duration_min: duration ? Number(duration) : undefined,
        training_days: trainingDays,
        equipment
      })
      if (res.user && user) {
        const token = getStoredToken()
        if (token) setStoredAuth(token, { ...user, ...res.user }, getStoredRefreshToken())
      }
      await reload()
    } finally {
      setSaving(false)
    }
  }

  async function onPickAvatar(file: File) {
    setAvatarBusy(true)
    setAvatarMsg(null)
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      await api.profile.update({ avatar_url: dataUrl })
      await reload()
      setAvatarMsg('Photo updated')
    } catch (err) {
      setAvatarMsg(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setAvatarBusy(false)
    }
  }

  async function removeAvatar() {
    setAvatarBusy(true)
    try {
      await api.profile.update({ avatar_url: null })
      await reload()
    } finally {
      setAvatarBusy(false)
    }
  }

  async function enableBiometric() {
    setBioBusy(true)
    try {
      await registerBiometricUnlock(data?.email ?? user?.email ?? '')
    } finally {
      setBioBusy(false)
    }
  }

  if (loading) return <LoadingState />

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Profile" />
      </div>
      <HudSubpageShell className="gap-5 pb-12">
        <HudIntroBlock eyebrow="Account" title={shownName} description={data?.email ?? user?.email ?? ''} />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <section className="bg-hud-container-lowest rounded-xl p-4 border border-hud-outline-variant/30 flex items-center gap-4">
          <UserAvatar
            name={data?.name ?? name}
            email={data?.email}
            avatarUrl={data?.avatar_url}
            size="lg"
          />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <p className="font-display font-bold text-hud-on truncate">{shownName}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onPickAvatar(f)
                e.target.value = ''
              }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={avatarBusy}
                onClick={() => fileRef.current?.click()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-hud-primary text-white"
              >
                {avatarBusy ? 'Saving…' : 'Set photo'}
              </button>
              {data?.avatar_url ? (
                <button
                  type="button"
                  disabled={avatarBusy}
                  onClick={() => void removeAvatar()}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-hud-outline-variant/50 text-hud-on-variant"
                >
                  Remove
                </button>
              ) : null}
            </div>
            {avatarMsg ? <p className="text-[11px] text-hud-on-variant">{avatarMsg}</p> : null}
          </div>
        </section>

        <section className="bg-hud-container-lowest rounded-xl p-4 border border-hud-outline-variant/30">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <FieldLabel>Display name</FieldLabel>
              <TextField value={name} onChange={(e) => setName(e.target.value)} placeholder="How you appear in squads & buddy" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Fitness goal</FieldLabel>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full rounded-lg border border-hud-outline-variant/50 bg-hud-container-low px-3 py-2.5 text-sm"
                >
                  {GOALS.map((g) => (
                    <option key={g} value={g}>{g.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Experience</FieldLabel>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-lg border border-hud-outline-variant/50 bg-hud-container-low px-3 py-2.5 text-sm"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <FieldLabel>Height (cm)</FieldLabel>
                <TextField type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Weight (kg)</FieldLabel>
                <TextField type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Duration (min)</FieldLabel>
                <TextField type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel>Training days</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d.v}
                    type="button"
                    onClick={() =>
                      setTrainingDays((prev) =>
                        prev.includes(d.v) ? prev.filter((x) => x !== d.v) : [...prev, d.v].sort()
                      )
                    }
                    className={`rounded-full w-10 h-10 text-xs font-medium border ${
                      trainingDays.includes(d.v) ? 'border-hud-primary bg-hud-primary/10 text-hud-primary' : 'border-hud-outline-variant/40'
                    }`}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Equipment</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT.map((eq) => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() =>
                      setEquipment((prev) => (prev.includes(eq) ? prev.filter((x) => x !== eq) : [...prev, eq]))
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium border capitalize ${
                      equipment.includes(eq) ? 'border-hud-primary text-hud-primary' : 'border-hud-outline-variant/40'
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>
            {data?.created_at ? <p className="text-hud-on-variant text-xs">Member since {formatDate(data.created_at)}</p> : null}
            <PrimaryButton type="submit" loading={saving}>Save profile</PrimaryButton>
          </form>
        </section>

        <section className="bg-hud-container-lowest rounded-xl p-4 border border-hud-outline-variant/30 space-y-3">
          <h3 className="font-display font-semibold text-hud-on text-sm">Appearance</h3>
          <button type="button" onClick={toggleTheme} className="w-full flex items-center gap-3 rounded-lg border border-hud-outline-variant/40 px-4 py-3">
            <span className="text-xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span className="text-sm">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
          </button>
        </section>

        <section className="bg-hud-container-lowest rounded-xl p-4 border border-hud-outline-variant/30">
          <h3 className="font-display font-semibold text-hud-on text-sm mb-3">Workout reminders</h3>
          <NotificationSettings
            prefs={data?.reminder_preferences ?? { enabled: false, time: '08:00' }}
            busy={reminderBusy}
            onSave={async (prefs) => {
              setReminderBusy(true)
              try {
                await api.reminders.update(prefs)
                await reload()
              } finally {
                setReminderBusy(false)
              }
            }}
          />
        </section>

        <section className="bg-hud-container-lowest rounded-xl p-4 border border-hud-outline-variant/30 space-y-2">
          <h3 className="font-display font-semibold text-hud-on text-sm">Sign in faster</h3>
          <p className="text-xs text-hud-on-variant">Use Face ID or fingerprint after your next password sign-in (this device only).</p>
          <button
            type="button"
            disabled={bioBusy}
            onClick={() => void enableBiometric()}
            className="w-full py-2.5 rounded-xl border border-hud-primary/40 text-hud-primary text-sm font-semibold flex items-center justify-center gap-2"
          >
            <MaterialIcon name="fingerprint" className="text-[20px]" />
            Enable biometric unlock
          </button>
          <button
            type="button"
            onClick={() => clearBiometricUnlock()}
            className="text-xs text-hud-on-variant underline"
          >
            Disable biometric on this device
          </button>
        </section>

        <button
          type="button"
          onClick={() => {
            void signOut().then(() => navigate('/login'))
          }}
          className="w-full py-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-display font-semibold text-sm flex items-center justify-center gap-2"
        >
          <MaterialIcon name="logout" className="text-[20px]" />
          Log out
        </button>
        <p className="text-center text-[11px] text-hud-on-variant pb-4">
          On desktop, you can also sign out from the sidebar menu at the bottom.
        </p>
      </HudSubpageShell>
    </>
  )
}
