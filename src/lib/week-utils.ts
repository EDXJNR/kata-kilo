export const WEEKDAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function localDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function emptyWeekDays() {
  return WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    isRest: false,
    workoutName: null,
    workoutType: null,
    durationMin: null,
    intensity: null,
    planId: null,
    exercises: null,
    reminderTime: null
  }))
}

export function mondayOfWeek(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(12, 0, 0, 0)
  return localDateString(d)
}

export function addWeeks(weekStart: string, delta: number): string {
  const d = new Date(weekStart + 'T12:00:00')
  d.setDate(d.getDate() + delta * 7)
  return localDateString(d)
}

export function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T12:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export function todayWeekdayIndex(): number {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m }
}

export function formatMonthLabel(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey)
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function addMonths(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey)
  const d = new Date(year, month - 1 + delta, 1)
  return currentMonthKey(d)
}

/** Monday-based week starts that overlap the given calendar month */
export function weekStartsInMonth(monthKey: string): string[] {
  const { year, month } = parseMonthKey(monthKey)
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0)
  const monthStartStr = localDateString(monthStart)
  const monthEndStr = localDateString(monthEnd)

  let weekStart = mondayOfWeek(monthStart)
  const out: string[] = []
  for (let i = 0; i < 6; i++) {
    const weekEnd = addWeeks(weekStart, 1)
    const weekEndDate = new Date(weekEnd + 'T12:00:00')
    weekEndDate.setDate(weekEndDate.getDate() - 1)
    const weekEndStr = localDateString(weekEndDate)
    const overlaps = weekEndStr >= monthStartStr && weekStart <= monthEndStr
    if (overlaps) out.push(weekStart)
    weekStart = weekEnd
    if (weekStart > monthEndStr && out.length > 0) break
  }
  return out
}

export function dateForWeekday(weekStart: string, weekday: number): string {
  const d = new Date(weekStart + 'T12:00:00')
  d.setDate(d.getDate() + weekday)
  return localDateString(d)
}
