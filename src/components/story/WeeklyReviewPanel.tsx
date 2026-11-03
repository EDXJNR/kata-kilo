import type { WeeklyReviewData } from '@/types/field-log'
import Panel from '@/components/ui/Panel'

export default function WeeklyReviewPanel({ data }: { data: WeeklyReviewData }) {
  return (
    <Panel title="Weekly review" variant="quiet">
      <ul className="space-y-2 text-sm text-fog">
        {data.summaryLines.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-primary">▸</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-fog">
        {data.habitCompletions} habit check-offs · {data.activeChallenges} active buddy challenge(s)
      </p>
    </Panel>
  )
}
