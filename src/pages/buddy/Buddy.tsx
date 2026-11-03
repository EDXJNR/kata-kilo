import { Link } from 'react-router-dom'
import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import MaterialIcon from '@/components/hud/MaterialIcon'
import { HudIntroBlock, HudSubpageShell } from '@/components/hud/HudSubpageShell'
import Panel from '@/components/ui/Panel'
import Modal from '@/components/ui/Modal'
import LoadingState from '@/components/ui/LoadingState'
import EmptyState from '@/components/ui/EmptyState'
import { PrimaryButton } from '@/components/ui/FieldInput'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useSavedPlans, invalidateSavedPlansCache } from '@/hooks/useSavedPlans'
import { api } from '@/lib/api'
import { mondayOfWeek } from '@/lib/week-utils'
import type { BuddyActivity, BuddyPrivacy, WeeklyPlanDay } from '@/types/field-log'
import SquadPanel from '@/components/squads/SquadPanel'

const NUDGE_PRESETS = [
  'Time to get moving! 💪',
  "Don't break your streak! 🔥",
  "You've got this!",
  'Your workout is waiting!',
  "Let's hit today's goal!"
]

const CHALLENGE_TEMPLATES = [
  { name: '3 workouts this week', goalType: 'workouts_count', goalValue: 3, days: 7 },
  { name: '5 workouts in 7 days', goalType: 'workouts_count', goalValue: 5, days: 7 },
  { name: '7-day workout streak', goalType: 'streak_days', goalValue: 7, days: 7 },
  { name: '10,000 steps daily', goalType: 'steps_daily', goalValue: 10000, days: 7 }
]

const SHARE_PRESETS = [
  { type: 'weekly_goal', message: 'I completed my weekly goal 🎯' },
  { type: 'streak', message: 'I worked out 4 days this week 🔥' },
  { type: 'run', message: 'I ran 5km today 🏃' }
]

export default function BuddyPage() {
  const { data, loading, reload } = useAsyncData(() => api.buddy.dashboard(), [])
  const { data: squadData, reload: reloadSquad } = useAsyncData(() => api.squads.dashboard(), [])
  const { plans: savedPlans } = useSavedPlans()
  const [inviteEmail, setInviteEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [challengeOpen, setChallengeOpen] = useState(false)
  const [challengeName, setChallengeName] = useState('')
  const [challengeGoal, setChallengeGoal] = useState(3)
  const [sharePlanId, setSharePlanId] = useState('')

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
      reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  if (loading || !data) return <LoadingState />

  const hasBuddy = Boolean(data.buddy)
  const privacy = data.privacy

  return (
    <>
      <div className="hidden lg:block">
        <PageHeader title="Kata Kilo Buddy" />
      </div>
      <HudSubpageShell className="gap-5">
        <HudIntroBlock
          eyebrow="Accountability"
          title={hasBuddy ? (data.buddy!.name ?? 'Your buddy') : 'Find a buddy'}
          description="Compare streaks, nudge each other, and share training plans."
        />

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {hasBuddy && data.buddyStats ? (
          <BuddyCompareCard
            my={data.myStats}
            buddy={data.buddyStats}
            buddyName={data.buddy!.name ?? data.buddy!.email}
            onNudge={(msg) => void run(() => api.buddy.nudge(msg))}
            busy={busy}
          />
        ) : null}

        {squadData ? <SquadPanel data={squadData} onChange={() => void reloadSquad()} /> : null}

        {!hasBuddy ? (
          <Panel variant="raised" title="Find your accountability partner">
            <p className="text-fog text-sm mb-4">
              Invite someone by email to stay consistent together — share progress, challenges, and nudges.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="buddy@email.com"
                className="flex-1 rounded-lg border border-line bg-basalt px-3 py-2.5 text-sm text-bone min-h-[44px]"
              />
              <PrimaryButton
                disabled={busy || !inviteEmail.trim()}
                onClick={() => void run(() => api.buddy.invite(inviteEmail.trim()).then(() => setInviteEmail('')))}
              >
                Send invite
              </PrimaryButton>
            </div>
            {data.incomingRequests.length > 0 ? (
              <div className="mt-6 space-y-2">
                <p className="text-xs text-fog uppercase tracking-wide">Incoming requests</p>
                {data.incomingRequests.map((req) => (
                  <div key={req.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line p-3">
                    <span className="text-sm text-bone flex-1">Buddy request</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(() => api.buddy.respond(req.id, 'accepted'))}
                      className="min-h-[44px] px-3 rounded-lg bg-primary text-obsidian text-sm font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void run(() => api.buddy.respond(req.id, 'declined'))}
                      className="min-h-[44px] px-3 rounded-lg border border-line text-fog text-sm"
                    >
                      Decline
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No buddy yet" hint="Invite a friend who also uses KATA KILO." />
            )}
          </Panel>
        ) : (
          <>
            <Panel variant="raised" title="Your buddy">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-bold text-bone">{data.buddy!.name ?? data.buddy!.email}</p>
                  <p className="text-fog text-sm">{data.buddy!.email}</p>
                  {data.buddyStats ? (
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className="text-primary font-semibold tabular-nums">{data.buddyStats.currentStreak}🔥 streak</span>
                      <span className="text-fog">{data.buddyStats.workoutsThisWeek} workouts this week</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {NUDGE_PRESETS.slice(0, 3).map((msg) => (
                    <button
                      key={msg}
                      type="button"
                      disabled={busy}
                      onClick={() => void run(() => api.buddy.nudge(msg))}
                      className="min-h-[44px] px-3 rounded-lg border border-primary/30 text-primary text-xs hover:bg-primary/10"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => api.buddy.remove())}
                className="mt-4 text-xs text-fog hover:text-alert"
              >
                Remove buddy
              </button>
            </Panel>

            <Panel variant="raised" title="Share with buddy">
              <p className="text-fog text-sm mb-4">Send your weekly schedule or a training plan for them to try.</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <PrimaryButton
                  disabled={busy}
                  onClick={() => void run(() => api.buddy.shareWeeklyPlan(mondayOfWeek()))}
                >
                  Share my weekly plan
                </PrimaryButton>
                {savedPlans.length > 0 ? (
                  <>
                    <select
                      value={sharePlanId}
                      onChange={(e) => setSharePlanId(e.target.value)}
                      className="flex-1 min-h-[44px] rounded-lg border border-line bg-basalt px-3 text-sm text-bone"
                    >
                      <option value="">Select a plan to share…</option>
                      {savedPlans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <PrimaryButton
                      disabled={busy || !sharePlanId}
                      onClick={() =>
                        void run(() => api.buddy.sharePlan(sharePlanId).then(() => setSharePlanId('')))
                      }
                    >
                      Share plan
                    </PrimaryButton>
                  </>
                ) : (
                  <p className="text-fog text-xs self-center">Create a plan under Workouts → Plans to share it.</p>
                )}
              </div>
            </Panel>

            <div className="grid sm:grid-cols-2 gap-4">
              <Panel variant="raised" title="Your progress">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-display font-bold text-primary tabular-nums">{data.myStats.currentStreak}</p>
                    <p className="text-[10px] text-fog uppercase">Streak</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-bone tabular-nums">{data.myStats.workoutsThisWeek}</p>
                    <p className="text-[10px] text-fog uppercase">This week</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-bone tabular-nums">{data.myStats.totalWorkouts}</p>
                    <p className="text-[10px] text-fog uppercase">Recent</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {SHARE_PRESETS.map((s) => (
                    <button
                      key={s.type}
                      type="button"
                      disabled={busy}
                      onClick={() => void run(() => api.buddy.postActivity(s.type, s.message))}
                      className="min-h-[44px] px-3 rounded-lg border border-line text-xs text-bone hover:bg-basalt2/80"
                    >
                      Share: {s.message}
                    </button>
                  ))}
                </div>
              </Panel>

              {data.buddyStats && privacy.progress !== false ? (
                <Panel variant="raised" title="Buddy progress">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-display font-bold text-primary tabular-nums">{data.buddyStats.currentStreak}</p>
                      <p className="text-[10px] text-fog uppercase">Streak</p>
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-bone tabular-nums">{data.buddyStats.workoutsThisWeek}</p>
                      <p className="text-[10px] text-fog uppercase">This week</p>
                    </div>
                    <div>
                      <p className="text-2xl font-display font-bold text-bone tabular-nums">{data.buddyStats.totalWorkouts}</p>
                      <p className="text-[10px] text-fog uppercase">Recent</p>
                    </div>
                  </div>
                </Panel>
              ) : null}
            </div>

            <BuddyActivityFeed activities={data.activities} busy={busy} onAction={() => reload()} />

            <Panel variant="quiet" title="Challenges">
              <div className="flex flex-wrap gap-2 mb-4">
                <PrimaryButton onClick={() => setChallengeOpen(true)}>New challenge</PrimaryButton>
                {CHALLENGE_TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const start = new Date().toISOString().slice(0, 10)
                      const end = new Date(Date.now() + t.days * 86400000).toISOString().slice(0, 10)
                      void run(() =>
                        api.buddy.createChallenge({
                          name: t.name,
                          goalType: t.goalType,
                          goalValue: t.goalValue,
                          startDate: start,
                          endDate: end
                        })
                      )
                    }}
                    className="min-h-[44px] px-3 rounded-lg border border-line text-xs text-fog hover:text-bone"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              {data.challenges.length === 0 ? (
                <EmptyState title="No active challenges" hint="Start one with your buddy." />
              ) : (
                <ul className="space-y-3">
                  {data.challenges.map((c) => {
                    const myProg = c.progress?.find((p) => p.user_id === data.myStats.userId)?.progress_value ?? 0
                    const buddyProg = c.progress?.find((p) => p.user_id === data.buddy?.id)?.progress_value ?? 0
                    const pct = Math.min(100, Math.round((myProg / Number(c.goal_value)) * 100))
                    return (
                      <li key={c.id} className="rounded-xl border border-line p-4">
                        <div className="flex justify-between gap-2 mb-2">
                          <p className="font-display font-semibold text-bone">{c.name}</p>
                          <span className="text-xs text-fog capitalize">{c.status}</span>
                        </div>
                        <p className="text-xs text-fog mb-3">
                          Goal: {c.goal_value} · {c.start_date} → {c.end_date}
                        </p>
                        <div className="h-2 rounded-full bg-basalt overflow-hidden mb-2">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-fog">
                          <span>You: {myProg}</span>
                          <span>Buddy: {buddyProg}</span>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void run(() => api.buddy.updateChallengeProgress(c.id, myProg + 1))}
                          className="mt-3 min-h-[44px] px-3 rounded-lg border border-primary/30 text-primary text-xs"
                        >
                          +1 progress
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>

            {data.nudges.length > 0 ? (
              <Panel variant="quiet" title="Nudges">
                <ul className="space-y-2">
                  {data.nudges.map((n) => (
                    <li key={n.id} className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm text-bone">
                      {n.message}
                      <span className="block text-[10px] text-fog mt-1">{new Date(n.created_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-3 text-xs text-fog hover:text-bone"
                  onClick={() => void run(() => api.buddy.markNudgesRead())}
                >
                  Mark all read
                </button>
              </Panel>
            ) : null}
          </>
        )}

        <Panel variant="quiet" title="Privacy controls">
          <p className="text-fog text-sm mb-4">Choose what your buddy can see.</p>
          <div className="space-y-3">
            {(Object.keys(privacy) as (keyof BuddyPrivacy)[]).map((key) => (
              <label key={key} className="flex items-center justify-between gap-3 min-h-[44px] cursor-pointer">
                <span className="text-sm text-bone capitalize">{key.replace('_', ' ')}</span>
                <input
                  type="checkbox"
                  checked={privacy[key] !== false}
                  onChange={(e) => {
                    const next = { ...privacy, [key]: e.target.checked }
                    void run(() => api.buddy.updatePrivacy(next))
                  }}
                  className="rounded border-line"
                />
              </label>
            ))}
          </div>
        </Panel>

        <p className="text-fog text-xs">
          Workout reminders are in{' '}
          <Link to="/profile" className="text-primary hover:underline">
            Profile → Workout reminders
          </Link>
          .
        </p>
      </HudSubpageShell>

      <Modal open={challengeOpen} onClose={() => setChallengeOpen(false)} title="Create challenge">
        <div className="space-y-4">
          <input
            value={challengeName}
            onChange={(e) => setChallengeName(e.target.value)}
            placeholder="Challenge name"
            className="w-full rounded-lg border border-line bg-basalt px-3 py-2 text-sm text-bone min-h-[44px]"
          />
          <input
            type="number"
            min={1}
            value={challengeGoal}
            onChange={(e) => setChallengeGoal(Number(e.target.value))}
            className="w-full rounded-lg border border-line bg-basalt px-3 py-2 text-sm text-bone min-h-[44px]"
          />
          <PrimaryButton
            disabled={busy || !challengeName.trim()}
            onClick={() => {
              const start = new Date().toISOString().slice(0, 10)
              const end = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
              void run(() =>
                api.buddy.createChallenge({
                  name: challengeName.trim(),
                  goalType: 'workouts_count',
                  goalValue: challengeGoal,
                  startDate: start,
                  endDate: end
                }).then(() => setChallengeOpen(false))
              )
            }}
          >
            Create
          </PrimaryButton>
        </div>
      </Modal>
    </>
  )
}

const QUICK_NUDGES = [
  { icon: 'bolt', label: 'Move', msg: 'Time to move' },
  { icon: 'local_fire_department', label: 'Crushed it', msg: 'Crushed it' },
  { icon: 'water_drop', label: 'Hydrate', msg: 'Hydrate' },
  { icon: 'sports_mma', label: 'LFG', msg: 'LFG' }
] as const

function BuddyCompareCard({
  my,
  buddy,
  buddyName,
  onNudge,
  busy
}: {
  my: { currentStreak: number; workoutsThisWeek: number; totalWorkouts: number }
  buddy: { currentStreak: number; workoutsThisWeek: number; totalWorkouts: number }
  buddyName: string
  onNudge: (msg: string) => void
  busy: boolean
}) {
  return (
    <section className="bg-hud-container-lowest rounded-xl p-4 shadow-sm border border-hud-outline-variant/30 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-hud-primary uppercase tracking-wider font-bold">Connected</span>
          <p className="font-display font-semibold text-hud-on">{buddyName}</p>
        </div>
        <MaterialIcon name="verified" className="text-hud-primary text-[20px]" filled />
      </div>
      <div className="flex flex-col gap-2">
        <CompareRow label="Active streak" you={my.currentStreak} them={buddy.currentStreak} suffix="days" />
        <CompareRow label="Workouts this week" you={my.workoutsThisWeek} them={buddy.workoutsThisWeek} suffix="done" />
        <CompareRow label="Recent sessions" you={my.totalWorkouts} them={buddy.totalWorkouts} suffix="" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {QUICK_NUDGES.map((n) => (
          <button
            key={n.label}
            type="button"
            disabled={busy}
            onClick={() => onNudge(n.msg)}
            className="flex flex-col items-center p-2.5 rounded-xl bg-hud-container-low hover:bg-hud-container-high transition active:scale-95 shadow-sm"
          >
            <MaterialIcon name={n.icon} className="text-[20px] text-hud-primary" />
            <span className="text-[10px] font-display uppercase mt-1 text-hud-on">{n.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function CompareRow({
  label,
  you,
  them,
  suffix
}: {
  label: string
  you: number
  them: number
  suffix: string
}) {
  const lead = you >= them
  return (
    <div className="flex items-center justify-between bg-hud-container-low rounded-lg p-2.5 text-sm">
      <div className="flex items-baseline gap-1">
        <span className={`font-display font-bold text-lg ${lead ? 'text-hud-primary' : 'text-hud-on'}`}>{you}</span>
        {suffix ? <span className="text-xs text-hud-on-variant">{suffix}</span> : null}
      </div>
      <span className="text-[10px] uppercase text-hud-on-variant font-semibold text-center px-2">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-display font-semibold text-lg text-hud-on">{them}</span>
        {suffix ? <span className="text-xs text-hud-on-variant">{suffix}</span> : null}
      </div>
    </div>
  )
}

const BUDDY_FEED_PREVIEW = 4

function buddyActivityEmoji(type: string, message: string): string {
  const t = type.toLowerCase()
  const m = message.toLowerCase()
  if (t.includes('plan') || t.includes('weekly')) return '📋'
  if (t.includes('streak') || m.includes('streak')) return '🔥'
  if (t.includes('run') || m.includes('km') || m.includes('run')) return '🏃‍♂️'
  if (t.includes('goal') || m.includes('goal')) return '🎯'
  if (t.includes('workout') || m.includes('workout')) return '🏋️‍♀️'
  if (m.includes('step')) return '👣'
  return '💬'
}

function BuddyActivityFeed({
  activities,
  busy,
  onAction
}: {
  activities: BuddyActivity[]
  busy: boolean
  onAction: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? activities : activities.slice(0, BUDDY_FEED_PREVIEW)
  const hasMore = activities.length > BUDDY_FEED_PREVIEW

  return (
    <Panel variant="quiet" title="Activity feed">
      {activities.length === 0 ? (
        <EmptyState title="No shared activity yet" hint="Complete a workout or share an update." />
      ) : (
        <div className="flex flex-col gap-2">
          <ul className="space-y-2">
            {visible.map((a) => (
              <SharedActivityItem key={a.id} activity={a} busy={busy} onAction={onAction} />
            ))}
          </ul>
          {hasMore && !expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center justify-center gap-1 w-full py-2.5 rounded-xl border border-hud-outline-variant/30 bg-hud-container-low text-sm font-display font-semibold text-hud-primary hover:bg-hud-container-high transition-colors"
            >
              View more ({activities.length - BUDDY_FEED_PREVIEW} more)
              <MaterialIcon name="expand_more" className="text-[18px]" />
            </button>
          ) : null}
        </div>
      )}
    </Panel>
  )
}

function SharedActivityItem({
  activity,
  busy,
  onAction
}: {
  activity: BuddyActivity
  busy: boolean
  onAction: () => void
}) {
  const [importing, setImporting] = useState(false)
  const meta = activity.metadata ?? {}

  async function importPlan() {
    const plan = meta.plan as Record<string, unknown> | undefined
    if (!plan) return
    setImporting(true)
    try {
      await api.plans.importShared(plan)
      invalidateSavedPlansCache()
      onAction()
    } finally {
      setImporting(false)
    }
  }

  const emoji = buddyActivityEmoji(activity.activity_type, activity.message)

  return (
    <li className="rounded-xl border border-line/60 px-4 py-3 flex gap-3 bg-hud-container-lowest/50">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0" aria-hidden>
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
      <p className="text-sm text-bone">{activity.message}</p>
      {activity.activity_type === 'weekly_plan_shared' && Array.isArray(meta.days) ? (
        <ul className="mt-2 text-xs text-fog space-y-1">
          {(meta.days as WeeklyPlanDay[]).map((d) => (
            <li key={d.weekday}>
              {d.label}: {d.isRest ? 'Rest' : d.workoutName ?? '—'}
              {!d.isRest && d.reminderTime ? ` · ${d.reminderTime}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
      {activity.activity_type === 'training_plan_shared' && meta.plan ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || importing}
            onClick={() => void importPlan()}
            className="min-h-[40px] px-3 rounded-lg border border-primary/40 text-primary text-xs font-medium hover:bg-primary/10"
          >
            {importing ? 'Saving…' : 'Save plan & try'}
          </button>
        </div>
      ) : null}
      <p className="text-[10px] text-fog mt-2">{new Date(activity.created_at).toLocaleString()}</p>
      </div>
    </li>
  )
}
