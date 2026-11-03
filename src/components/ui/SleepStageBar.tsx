export default function SleepStageBar({
  startedAt,
  endedAt,
  durationH
}: {
  startedAt: string
  endedAt: string
  durationH: number
}) {
  const start = new Date(startedAt)
  const end = new Date(endedAt)
  const startMin = start.getHours() * 60 + start.getMinutes()
  const endMin = end.getHours() * 60 + end.getMinutes()
  const dayMins = 24 * 60

  let left = (startMin / dayMins) * 100
  let width = ((endMin >= startMin ? endMin - startMin : dayMins - startMin + endMin) / dayMins) * 100
  width = Math.max(width, 4)

  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono text-fog uppercase tracking-widest mb-2">
        <span>{start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        <span>{durationH}h asleep</span>
        <span>{end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="h-3 rounded-full bg-basalt overflow-hidden relative">
        <div
          className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-slate/80 to-moss/90"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-fog mt-1">
        <span>12a</span>
        <span>6a</span>
        <span>12p</span>
        <span>6p</span>
      </div>
    </div>
  )
}
