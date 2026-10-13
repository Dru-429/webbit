import axios from 'axios'
import type { ChatResponse, TemplateResponse } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json'}
})

async function request<T>(path: string, body: unknown): Promise<T> {
  try {
    const { data } = await api.post<T>(path, body);
    return data;
    
  } catch (error) {
    console.error(error);
    throw error
  }
}

export function fetchTemplate(prompt: string) {
  return request<TemplateResponse>('/template', { prompt })
}

export function sendChat(message: string | unknown[]) {
  return request<ChatResponse>('/chat', { message })
}
