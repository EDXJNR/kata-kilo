import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { TrendPoint } from '@/types/field-log'

type Series = {
  key: string
  label: string
  data: TrendPoint[]
  color: string
  unit: string
}

export default function MultiMetricChart({ series, height = 220 }: { series: Series[]; height?: number }) {
  const active = series.filter((s) => s.data.length >= 2)
  if (active.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-fog text-sm font-mono">
        Record a few measurements to see trends
      </div>
    )
  }

  const labels = active[0].data.map((d) => d.label)
  const merged = labels.map((label, i) => {
    const row: Record<string, string | number> = { label }
    for (const s of active) {
      row[s.key] = s.data[i]?.value ?? null
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={merged} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="rgb(var(--color-line))" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'rgb(var(--color-fog))', fontSize: 10, fontFamily: 'Space Grotesk' }}
          axisLine={{ stroke: 'rgb(var(--color-line))' }}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: 'rgb(var(--color-basalt2))',
            border: '1px solid rgb(var(--color-line))',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'Space Grotesk'
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Space Grotesk', color: 'rgb(var(--color-fog))' }} />
        {active.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={`${s.label} (${s.unit})`}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3, fill: s.color }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
