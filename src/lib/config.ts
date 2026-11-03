/** API base URL — set VITE_API_URL in .env (no trailing slash required). */
export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (!configured) {
    console.warn('[kata-kilo] VITE_API_URL is not set. API calls will fail until you add it to .env')
    return ''
  }
  return configured.replace(/\/$/, '')
}
