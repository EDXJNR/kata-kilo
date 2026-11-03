const STORAGE_KEY = 'katakilo.biometric'

type BiometricRecord = {
  credentialId: string
  email: string
}

function supportsWebAuthn() {
  return typeof window !== 'undefined' && typeof PublicKeyCredential !== 'undefined'
}

export function canUseBiometricUnlock(): boolean {
  if (!supportsWebAuthn()) return false
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY))
  } catch {
    return false
  }
}

export function biometricEmailHint(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return (JSON.parse(raw) as BiometricRecord).email
  } catch {
    return null
  }
}

export async function registerBiometricUnlock(email: string): Promise<void> {
  if (!supportsWebAuthn()) throw new Error('Biometric unlock is not supported on this device')
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Kata Kilo', id: window.location.hostname },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: email,
        displayName: email
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred'
      },
      timeout: 60000
    }
  })) as PublicKeyCredential | null

  if (!credential) throw new Error('Biometric setup was cancelled')

  const record: BiometricRecord = {
    credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
    email: email.trim().toLowerCase()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export async function verifyBiometricUnlock(): Promise<boolean> {
  if (!supportsWebAuthn()) return false
  let record: BiometricRecord
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    record = JSON.parse(raw) as BiometricRecord
  } catch {
    return false
  }

  const rawId = Uint8Array.from(atob(record.credentialId), (c) => c.charCodeAt(0))
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: rawId, type: 'public-key' }],
      userVerification: 'required',
      timeout: 60000
    }
  })) as PublicKeyCredential | null

  return Boolean(assertion)
}

export function clearBiometricUnlock() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
