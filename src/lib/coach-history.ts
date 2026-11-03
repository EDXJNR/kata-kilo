import type { CoachMessage } from '@/hooks/useAiCoach'

export type CoachSession = {
  id: string
  title: string
  messages: CoachMessage[]
  updatedAt: string
}

type CoachStore = {
  activeId: string | null
  sessions: CoachSession[]
}

function storageKey(userId: string) {
  return `katakilo.coach.${userId}`
}

function defaultWelcome(): CoachMessage[] {
  return [
    {
      role: 'coach',
      text: "Hey — I'm KATA Coach. Ask what to train, which weight to use, or I'll build you a program."
    }
  ]
}

export function loadCoachStore(userId: string): CoachStore {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return { activeId: null, sessions: [] }
    return JSON.parse(raw) as CoachStore
  } catch {
    return { activeId: null, sessions: [] }
  }
}

export function saveCoachStore(userId: string, store: CoachStore) {
  localStorage.setItem(storageKey(userId), JSON.stringify(store))
}

export function createSession(userId: string): CoachSession {
  const store = loadCoachStore(userId)
  const session: CoachSession = {
    id: crypto.randomUUID(),
    title: 'New chat',
    messages: defaultWelcome(),
    updatedAt: new Date().toISOString()
  }
  store.sessions.unshift(session)
  store.activeId = session.id
  saveCoachStore(userId, store)
  return session
}

export function getActiveSession(userId: string): CoachSession {
  const store = loadCoachStore(userId)
  if (store.activeId) {
    const found = store.sessions.find((s) => s.id === store.activeId)
    if (found) return found
  }
  if (store.sessions.length > 0) {
    store.activeId = store.sessions[0].id
    saveCoachStore(userId, store)
    return store.sessions[0]
  }
  return createSession(userId)
}

export function updateSessionMessages(userId: string, sessionId: string, messages: CoachMessage[]) {
  const store = loadCoachStore(userId)
  const idx = store.sessions.findIndex((s) => s.id === sessionId)
  if (idx === -1) return
  const firstUser = messages.find((m) => m.role === 'user')
  store.sessions[idx] = {
    ...store.sessions[idx],
    messages,
    title: firstUser ? firstUser.text.slice(0, 40) + (firstUser.text.length > 40 ? '…' : '') : store.sessions[idx].title,
    updatedAt: new Date().toISOString()
  }
  store.sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  saveCoachStore(userId, store)
}

export function setActiveSession(userId: string, sessionId: string) {
  const store = loadCoachStore(userId)
  store.activeId = sessionId
  saveCoachStore(userId, store)
}

export function listSessions(userId: string): CoachSession[] {
  return loadCoachStore(userId).sessions
}
