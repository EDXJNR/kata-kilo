import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { searchLocal, SEARCH_CATEGORY_LABELS, type SearchResult } from '@/lib/search-index'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'

type Props = {
  open: boolean
  onClose: () => void
}

export default function GlobalSearch({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [workoutHits, setWorkoutHits] = useState<
    { id: string; name: string; recorded_at: string; duration_min: number | null }[]
  >([])

  const localResults = useMemo(() => searchLocal(query), [query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (query.trim().length < 2) {
      setWorkoutHits([])
      return
    }
    const t = window.setTimeout(() => {
      void api.search.workouts(query.trim()).then((r) => setWorkoutHits(r.workouts)).catch(() => setWorkoutHits([]))
    }, 250)
    return () => window.clearTimeout(t)
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    for (const r of localResults) {
      const list = map.get(r.category) ?? []
      list.push(r)
      map.set(r.category, list)
    }
    return map
  }, [localResults])

  const go = useCallback(
    (to: string) => {
      navigate(to)
      onClose()
    },
    [navigate, onClose]
  )

  const hasResults = localResults.length > 0 || workoutHits.length > 0
  const trimmed = query.trim()

  return (
    <Modal open={open} onClose={onClose} title="Search">
      <div className="space-y-4">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises, plans, pages…"
            autoFocus
            className="w-full rounded-lg border border-line bg-basalt px-3 py-2.5 pr-10 text-sm text-bone placeholder:text-fog/60 focus:outline-none focus:border-primary/50"
          />
          {trimmed ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] text-fog hover:text-bone"
            >
              ✕
            </button>
          ) : null}
        </div>

        {!trimmed ? (
          <p className="text-fog text-sm">Try "squat", "cardio", or "buddy".</p>
        ) : !hasResults ? (
          <EmptyState title="No results" hint={`Nothing matched "${trimmed}". Try another term.`} />
        ) : (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {Array.from(grouped.entries()).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-[10px] uppercase tracking-widest text-fog/70 mb-2">
                  {SEARCH_CATEGORY_LABELS[cat as SearchResult['category']]}
                </p>
                <ul className="divide-y divide-line/60 rounded-lg border border-line overflow-hidden">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => go(item.to)}
                        className="w-full text-left px-3 py-2.5 hover:bg-basalt2/80 transition-colors min-h-[44px]"
                      >
                        <span className="text-sm text-bone block">{item.title}</span>
                        {item.subtitle ? <span className="text-xs text-fog">{item.subtitle}</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {workoutHits.length > 0 ? (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-fog/70 mb-2">Your workouts</p>
                <ul className="divide-y divide-line/60 rounded-lg border border-line overflow-hidden">
                  {workoutHits.map((w) => (
                    <li key={w.id}>
                      <button
                        type="button"
                        onClick={() => go('/workouts/progress')}
                        className="w-full text-left px-3 py-2.5 hover:bg-basalt2/80 transition-colors min-h-[44px]"
                      >
                        <span className="text-sm text-bone block">{w.name}</span>
                        <span className="text-xs text-fog">
                          {new Date(w.recorded_at).toLocaleDateString()}
                          {w.duration_min ? ` · ${w.duration_min} min` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  )
}
