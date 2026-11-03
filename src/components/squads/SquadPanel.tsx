import { useState } from 'react'
import Panel from '@/components/ui/Panel'
import SquadActivityFeed, { SquadActivitySectionHeader } from '@/components/squads/SquadActivityFeed'
import UserAvatar from '@/components/profile/UserAvatar'
import { FieldLabel, PrimaryButton, TextField } from '@/components/ui/FieldInput'
import { api } from '@/lib/api'
import type { SquadDashboard } from '@/types/field-log'

type Props = {
  data: SquadDashboard
  onChange: () => void
}

export default function SquadPanel({ data, onChange }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function createSquad() {
    if (!name.trim()) return
    setBusy(true)
    setErr(null)
    try {
      await api.squads.create(name.trim())
      setName('')
      onChange()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not create squad')
    } finally {
      setBusy(false)
    }
  }

  async function join() {
    if (!code.trim()) return
    setBusy(true)
    setErr(null)
    try {
      await api.squads.join(code.trim())
      setCode('')
      onChange()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not join')
    } finally {
      setBusy(false)
    }
  }

  async function leave() {
    setBusy(true)
    try {
      await api.squads.leave()
      onChange()
    } finally {
      setBusy(false)
    }
  }

  if (!data.squad) {
    return (
      <Panel title="Squad (up to 5)" variant="quiet">
        <p className="text-fog text-sm mb-3">Train with a small group — weekly workout totals on one board.</p>
        {err ? <p className="text-alert text-xs mb-2">{err}</p> : null}
        <div className="space-y-3">
          <div>
            <FieldLabel>Create squad</FieldLabel>
            <TextField value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekend warriors" />
            <div className="mt-2">
              <PrimaryButton loading={busy} onClick={() => void createSquad()}>
                Create
              </PrimaryButton>
            </div>
          </div>
          <div className="pt-3 border-t border-line">
            <FieldLabel>Join with code</FieldLabel>
            <TextField value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABCD1234" />
            <div className="mt-2">
              <PrimaryButton loading={busy} onClick={() => void join()}>
                Join squad
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <Panel title={data.squad.name} variant="raised">
      <p className="text-fog text-xs mb-2">
        Invite code: <span className="font-mono text-primary">{data.squad.inviteCode}</span>
      </p>
      {data.progress ? (
        <p className="text-sm text-bone mb-3">
          Team workouts this week: {data.progress.teamWorkouts} / {data.progress.workoutGoal}
        </p>
      ) : null}
      <ul className="space-y-2 mb-3">
        {data.members.map((m) => (
          <li key={m.userId} className="flex items-center justify-between text-sm text-fog gap-2">
            <span className="flex items-center gap-2 text-bone min-w-0">
              <UserAvatar name={m.name} avatarUrl={m.avatarUrl} size="sm" />
              <span className="truncate">{m.name}</span>
            </span>
            <span className="shrink-0">{m.workoutsThisWeek} workouts</span>
          </li>
        ))}
      </ul>
      <div className="pt-3 border-t border-line mb-3">
        <SquadActivitySectionHeader count={data.activityPreview?.length} />
        <SquadActivityFeed
          items={data.activityPreview ?? []}
          maxItems={3}
          showViewAll
          viewAllLabel="View more squad activity"
        />
      </div>
      <button type="button" onClick={() => void leave()} disabled={busy} className="text-xs text-alert hover:underline">
        Leave squad
      </button>
    </Panel>
  )
}
