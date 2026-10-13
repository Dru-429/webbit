export type FileMap = Record<string, string>

export type TemplateResponse = {
  prompts: string[]
  uiPrompts: string[]
}

export type ChatResponse = {
  response: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  title?: string
}

export type SessionPayload = {
  prompt: string
  template: TemplateResponse
}

export type FileTreeNode = {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileTreeNode[]
}

export type WorkspaceView = 'preview' | 'code'
