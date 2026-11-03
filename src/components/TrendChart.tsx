import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Point = { label: string; value: number }

const COLORS: Record<string, string> = {
  primary: '#7c5cff',
  accent: '#ff6b6b',
  cyan: '#22d3ee',
  amber: '#fbbf24',
  pink: '#f472b6',
  moss: '#7c5cff',
  ember: '#ff6b6b',
  slate: '#22d3ee'
}

export default function TrendChart({
  data,
  accent = 'primary',
  unit = '',
  height = 180
}: {
  data: Point[]
  accent?: 'primary' | 'accent' | 'cyan' | 'amber' | 'pink' | 'moss' | 'ember' | 'slate'
  unit?: string
  height?: number
}) {
  const color = COLORS[accent] ?? COLORS.primary
  const gradientId = `contour-${accent}`

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center text-fog text-sm font-mono" style={{ height }}>
        log a few more entries to see a trend
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: 'rgb(136, 136, 168)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          axisLine={{ stroke: 'rgb(45, 45, 70)' }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
        <Tooltip
          contentStyle={{
            background: 'rgb(18, 18, 31)',
            border: '1px solid rgb(45, 45, 70)',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'IBM Plex Mono'
          }}
          labelStyle={{ color: 'rgb(136, 136, 168)' }}
          formatter={(value: number) => [`${value}${unit}`, undefined]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
