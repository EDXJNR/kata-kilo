import { Link } from 'react-router-dom'
import Panel from '@/components/ui/Panel'
import type { ReadinessData } from '@/types/field-log'

const REC_LABEL: Record<ReadinessData['recommendation'], string> = {
  rest: 'Recovery day',
  moderate: 'Moderate effort',
  train: 'Go train'
}

const REC_COLOR: Record<ReadinessData['recommendation'], string> = {
  rest: '#f87171',
  moderate: '#fbbf24',
  train: '#34d399'
}

export default function ReadinessCard({ data }: { data: ReadinessData }) {
  return (
    <Panel title="Readiness" variant="raised">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-4xl font-display font-bold tabular-nums text-bone">{data.score}</p>
          <p className="text-fog text-xs">/ 100</p>
        </div>
        <div
          className="rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wide border"
          style={{ color: REC_COLOR[data.recommendation], borderColor: `${REC_COLOR[data.recommendation]}66` }}
        >
          {REC_LABEL[data.recommendation]}
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {data.factors.slice(0, 4).map((f) => (
          <li key={f.label} className="text-sm text-fog flex justify-between gap-2">
            <span className="text-bone">{f.label}</span>
            <span className="text-right text-xs">{f.detail}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link to="/workouts/planner" className="text-primary hover:underline">
          Open planner
        </Link>
        <span className="text-line">·</span>
        <Link to="/nutrition/log" className="text-primary hover:underline">
          Log protein
        </Link>
        <span className="text-line">·</span>
        <Link to="/sleep/track" className="text-primary hover:underline">
          Log sleep
        </Link>
      </div>
    </Panel>
  )
}
