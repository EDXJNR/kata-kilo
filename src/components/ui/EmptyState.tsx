export default function EmptyState({
  title,
  hint
}: {
  title: string
  hint?: string
}) {
  return (
    <div className="rounded-md border border-dashed border-line px-4 py-8 text-center">
      <div className="text-bone text-sm font-display">{title}</div>
      {hint ? <div className="text-fog text-xs font-mono mt-2">{hint}</div> : null}
    </div>
  )
}
