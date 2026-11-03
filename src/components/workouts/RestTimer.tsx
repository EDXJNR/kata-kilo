import CircularTimer from '@/components/ui/CircularTimer'
import { useRestTimer } from '@/hooks/useWorkoutTimers'

export default function RestTimerBar({ defaultSec = 90 }: { defaultSec?: number }) {
  const { running, label, start, skip, progress, totalSec } = useRestTimer(defaultSec)

  return (
    <div className="rounded-2xl border border-line/50 bg-gradient-to-br from-violet/10 via-primary/5 to-cyan/10 p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <CircularTimer
          progress={running ? progress : 0}
          label={running ? label : 'Ready'}
          caption="Rest"
          subtitle={running ? `${totalSec}s interval` : 'Pick a preset'}
          color="#7c5cff"
          size={140}
        />
        <div className="flex-1 w-full flex flex-wrap gap-2 justify-center sm:justify-start">
          {!running ? (
            <>
              {[60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => start(sec)}
                  className="rounded-xl border border-line/60 bg-basalt/80 text-fog text-sm px-4 py-2.5 hover:border-primary hover:text-primary transition-colors"
                >
                  {sec === 120 ? '2 min' : `${sec}s`}
                </button>
              ))}
            </>
          ) : (
            <button
              type="button"
              onClick={skip}
              className="rounded-xl bg-accent/20 text-accent text-sm px-5 py-2.5 font-semibold"
            >
              Skip rest
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** Standalone timer controller for active workout — parent calls startRest */
export function useRestTimerControl(defaultSec = 90) {
  const timer = useRestTimer(defaultSec)
  return timer
}
