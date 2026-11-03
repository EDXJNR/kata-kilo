const VOICE_KEY = 'katakilo.voiceCoach'

export function isVoiceCoachEnabled(): boolean {
  return localStorage.getItem(VOICE_KEY) !== 'off'
}

export function setVoiceCoachEnabled(on: boolean) {
  localStorage.setItem(VOICE_KEY, on ? 'on' : 'off')
}

export function speak(text: string) {
  if (!isVoiceCoachEnabled()) return
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1.05
  u.pitch = 1
  window.speechSynthesis.speak(u)
}

export function parseTargetReps(reps: string): { mode: 'reps' | 'hold'; count: number } {
  const t = reps.trim().toLowerCase()
  if (t.endsWith('s')) {
    const sec = parseInt(t, 10)
    return { mode: 'hold', count: Number.isFinite(sec) ? sec : 30 }
  }
  if (t.includes('-')) {
    const [a, b] = t.split('-').map((x) => parseInt(x, 10))
    if (Number.isFinite(a) && Number.isFinite(b)) return { mode: 'reps', count: Math.round((a + b) / 2) }
  }
  const n = parseInt(t, 10)
  return { mode: 'reps', count: Number.isFinite(n) ? n : 10 }
}
