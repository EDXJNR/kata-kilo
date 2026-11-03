import type { Difficulty } from '@/data/exercises'
import { DIFFICULTY_COLOR } from '@/data/exercises'

export default function ExerciseVideo({
  videoId,
  title
}: {
  videoId: string | null
  title: string
}) {
  if (!videoId) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden border border-dashed border-line bg-gradient-to-br from-primary/10 via-violet/5 to-cyan/10 flex flex-col items-center justify-center gap-2 p-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl">▶</div>
        <p className="text-bone text-sm font-display font-semibold text-center">{title}</p>
        <p className="text-fog text-xs text-center">Follow the form cues below</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden border border-line bg-black/40">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={`${title} demonstration`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span
      className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border"
      style={{ color: DIFFICULTY_COLOR[level], borderColor: DIFFICULTY_COLOR[level] }}
    >
      {level}
    </span>
  )
}

export function MuscleTag({ label, color = '#7c5cff' }: { label: string; color?: string }) {
  return (
    <span
      className="text-[10px] font-mono px-2 py-0.5 rounded-full"
      style={{ color, backgroundColor: `${color}22` }}
    >
      {label}
    </span>
  )
}
