import type { SessionPayload } from '../types'

const KEY = 'webbit_session'

export function saveSession(payload: SessionPayload) {
  sessionStorage.setItem(KEY, JSON.stringify(payload))
}

export function loadSession(): SessionPayload | null {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionPayload
  } catch {
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(KEY)
}
