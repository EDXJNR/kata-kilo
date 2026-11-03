import { useState, type FormEvent } from 'react'
import { useAiCoach } from '@/hooks/useAiCoach'
import { useAuth } from '@/context/AuthContext'
import type { ProfileData, WorkoutSummary } from '@/types/field-log'

function formatSessionDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AiCoachPanel({
  profile,
  summary,
  fullPage = false
}: {
  profile: ProfileData | null
  summary: WorkoutSummary | null
  /** When true, fills the page — no card container */
  fullPage?: boolean
}) {
  const { user } = useAuth()
  const { messages, sessions, sessionId, thinking, ask, prompts, startNewChat, openSession } = useAiCoach(
    user?.id,
    profile,
    summary
  )
  const [input, setInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    ask(q)
    setInput('')
  }

  const rootClass = fullPage
    ? 'flex flex-1 min-h-0 flex-col lg:flex-row'
    : 'rounded-2xl border border-line overflow-hidden bg-basalt2 shadow-xl shadow-primary/5 flex flex-col lg:flex-row min-h-[480px]'

  return (
    <div className={rootClass}>
      <aside
        className={`border-b lg:border-b-0 lg:border-r border-line bg-basalt2/50 flex flex-col shrink-0 ${
          showHistory ? 'flex' : 'hidden lg:flex'
        } lg:w-60`}
      >
        <div className="px-4 py-4 border-b border-line flex items-center justify-between gap-2">
          <span className="text-fog text-xs font-medium">Chat history</span>
          <button type="button" onClick={startNewChat} className="text-primary text-xs font-medium hover:underline">
            + New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
          {sessions.length === 0 ? (
            <p className="text-fog text-xs px-1">No saved chats yet</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => openSession(s.id)}
                className={`w-full text-left rounded-lg px-3 py-2.5 text-xs transition-colors ${
                  s.id === sessionId
                    ? 'bg-primary/12 text-primary border border-primary/25'
                    : 'text-fog hover:bg-basalt hover:text-bone border border-transparent'
                }`}
              >
                <p className="font-medium truncate">{s.title}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{formatSessionDate(s.updatedAt)}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-basalt">
        {!fullPage ? (
          <div className="relative px-5 py-5 bg-gradient-to-br from-primary/20 via-violet/10 to-cyan/5 border-b border-line">
            <div className="relative flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className="lg:hidden text-fog text-xs border border-line rounded-lg px-2 py-1"
              >
                History
              </button>
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center text-lg">✦</div>
              <div>
                <h2 className="text-bone font-display font-bold text-lg">KATA Coach</h2>
                <p className="text-fog text-xs">Chats saved automatically</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:hidden px-4 py-3 border-b border-line flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="text-fog text-xs font-medium border border-line rounded-lg px-3 py-1.5"
            >
              {showHistory ? 'Hide history' : 'Chat history'}
            </button>
            <button type="button" onClick={startNewChat} className="text-primary text-xs font-medium">
              + New chat
            </button>
          </div>
        )}

        <div className="flex-1 px-4 md:px-6 lg:px-8 py-6 space-y-5 overflow-y-auto min-h-0">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'coach' ? (
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 text-sm text-primary">
                  ✦
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-cyan/15 flex items-center justify-center shrink-0 text-[10px] font-medium text-cyan">
                  You
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'coach'
                    ? 'bg-basalt2 border border-line text-bone rounded-tl-sm'
                    : 'bg-primary text-basalt rounded-tr-sm'
                }`}
              >
                {m.text.split('\n').map((line, j) => (
                  <p key={j} className={j > 0 ? 'mt-2' : ''}>
                    {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                      part.startsWith('**') ? (
                        <strong key={k} className="font-semibold">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {thinking ? (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-sm text-primary animate-pulse">
                ✦
              </div>
              <div className="flex gap-1 px-4 py-3 rounded-2xl bg-basalt2 border border-line">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 px-4 md:px-6 lg:px-8 py-5 border-t border-line bg-basalt2/40">
          <div className="flex flex-wrap gap-2 mb-4">
            {prompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => ask(p)}
                className="rounded-full border border-line bg-basalt text-fog text-xs px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach anything…"
              className="flex-1 rounded-xl border border-line bg-basalt px-4 py-3 text-sm text-bone outline-none focus:border-primary placeholder:text-fog/60"
            />
            <button
              type="submit"
              disabled={thinking || !input.trim()}
              className="rounded-xl bg-primary text-basalt font-semibold px-6 py-3 disabled:opacity-50 shrink-0 hover:brightness-110 transition-all"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
