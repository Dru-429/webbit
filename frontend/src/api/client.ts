import type { ChatResponse, TemplateResponse } from '../types'

const BASE = '/api'

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = (await res.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export function fetchTemplate(prompt: string) {
  return request<TemplateResponse>('/template', { prompt })
}

export function sendChat(message: string | unknown[]) {
  return request<ChatResponse>('/chat', { message })
}
