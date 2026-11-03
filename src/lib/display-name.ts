/** Prefer profile display name over email local-part. */
export function displayName(user: { name?: string | null; email?: string | null } | null | undefined): string {
  if (!user) return 'Athlete'
  const n = user.name?.trim()
  if (n) return n
  const email = user.email?.trim()
  if (email?.includes('@')) return email.split('@')[0] ?? 'Athlete'
  return 'Athlete'
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
