import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sendChat } from '../api/client'
import { Workspace } from '../components/Workspace'
import {
  extractArtifactTitle,
  mergeFiles,
  parseArtifactFiles,
  stripArtifacts,
} from '../lib/parseArtifact'
import { firstFilePath } from '../lib/fileTree'
import { loadSession } from '../lib/session'
import type { ChatMessage, FileMap, WorkspaceView } from '../types'

const FOLLOW_UPS = [
  'Add a dark mode toggle',
  'Improve the landing hero',
  'Add a README',
  'Polish the typography',
]

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function Chat() {
  const session = loadSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<FileMap>({})
  const [activePath, setActivePath] = useState<string | null>(null)
  const [view, setView] = useState<WorkspaceView>('preview')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bootstrapped = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const templatePrompts = useRef<string[]>(session?.template.prompts ?? [])

  const applyFiles = useCallback((incoming: FileMap) => {
    setFiles((prev) => {
      const merged = mergeFiles(prev, incoming)
      setActivePath((current) => current ?? firstFilePath(merged))
      return merged
    })
  }, [])

  const runChat = useCallback(
    async (userText: string, opts?: { silentUser?: boolean }) => {
      if (!userText.trim() || busy) return

      setBusy(true)
      setError(null)

      if (!opts?.silentUser) {
        setMessages((m) => [
          ...m,
          { id: uid(), role: 'user', content: userText.trim() },
        ])
      }

      try {
        const history = templatePrompts.current
        const payload =
          history.length > 0
            ? [...history, userText.trim()].join('\n\n')
            : userText.trim()

        // After first turn, keep conversation lighter (user edits only)
        templatePrompts.current = []

        const { response } = await sendChat(payload)
        const nextFiles = parseArtifactFiles(response)
        if (Object.keys(nextFiles).length > 0) {
          applyFiles(nextFiles)
          setView('code')
        }

        const title = extractArtifactTitle(response)
        const readable = stripArtifacts(response) || title || 'Updated the project.'

        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: 'assistant',
            content: readable,
            title: title ?? (Object.keys(nextFiles).length ? 'Updated files' : undefined),
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chat failed')
      } finally {
        setBusy(false)
      }
    },
    [applyFiles, busy],
  )

  // Seed files from template uiPrompts + kick off first generation
  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    const sessionData = loadSession()
    if (!sessionData) {
      setMessages([
        {
          id: uid(),
          role: 'assistant',
          content:
            'No active session. Go home, describe what you want to build, then come back here.',
        },
      ])
      return
    }

    const seed: FileMap = {}
    for (const ui of sessionData.template.uiPrompts) {
      Object.assign(seed, parseArtifactFiles(ui))
    }
    if (Object.keys(seed).length > 0) {
      applyFiles(seed)
    }

    setMessages([
      {
        id: uid(),
        role: 'user',
        content: sessionData.prompt,
      },
      {
        id: uid(),
        role: 'assistant',
        content: `Scaffolded a starter with ${Object.keys(seed).length} files. Generating your project…`,
        title: 'Project scaffold',
      },
    ])

    const genKey = `webbit_gen:${sessionData.prompt}`
    if (!sessionStorage.getItem(genKey)) {
      sessionStorage.setItem(genKey, '1')
      void runChat(sessionData.prompt, { silentUser: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, busy])

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setInput('')
    void runChat(trimmed)
  }

  return (
    <div className="chat-page">
      <aside className="chat-side">
        <header className="chat-side-header">
          <Link to="/">Webbit</Link>
          <span style={{ fontSize: 12, color: 'var(--chat-muted)' }}>
            <span className="status-dot" /> connected
          </span>
        </header>

        <div className="chat-messages" ref={scrollRef}>
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <div key={msg.id} className="msg-user">
                {msg.content}
              </div>
            ) : (
              <div key={msg.id} className="msg-assistant">
                {msg.content}
                {msg.title && (
                  <div className="msg-card">
                    <div className="msg-card-title">{msg.title}</div>
                    <div className="msg-card-actions">
                      <button type="button" onClick={() => setView('code')}>
                        Details
                      </button>
                      <button type="button" onClick={() => setView('preview')}>
                        Preview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ),
          )}

          {busy && (
            <div className="msg-assistant" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
              Thinking…
            </div>
          )}

          {error && (
            <div className="msg-assistant" style={{ color: '#fca5a5' }}>
              {error}
            </div>
          )}
        </div>

        <div className="chat-composer">
          <div className="chat-suggestions">
            {FOLLOW_UPS.map((s) => (
              <button key={s} type="button" onClick={() => submit(s)} disabled={busy}>
                {s}
              </button>
            ))}
          </div>
          <form
            className="composer-row"
            onSubmit={(e) => {
              e.preventDefault()
              submit(input)
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Webbit…"
              rows={2}
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit(input)
                }
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={busy || !input.trim()}>
              Build
            </button>
          </form>
        </div>
      </aside>

      <Workspace
        files={files}
        view={view}
        onViewChange={setView}
        activePath={activePath}
        onSelectFile={setActivePath}
      />
    </div>
  )
}
