/** Local dev preview credentials — set in .env (never commit real passwords). */
export function getPreviewCredentials(): { email: string; password: string } | null {
  if (!import.meta.env.DEV) return null
  const email = import.meta.env.VITE_PREVIEW_EMAIL?.trim()
  const password = import.meta.env.VITE_PREVIEW_PASSWORD?.trim()
  if (!email || !password) return null
  return { email, password }
}

export function hasPreviewLogin(): boolean {
  return getPreviewCredentials() != null
}
