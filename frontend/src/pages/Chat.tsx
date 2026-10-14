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
    <div className="grid h-svh grid-cols-1 overflow-hidden bg-chat-bg text-chat-text max-[900px]:grid-rows-[45%_55%] min-[901px]:grid-cols-[minmax(320px,42%)_1fr]">
      <aside className="flex min-h-0 flex-col border-r border-chat-border bg-chat-bg">
        <header className="flex shrink-0 items-center justify-between border-b border-chat-border px-4 py-3.5">
          <Link
            to="/"
            className="text-sm font-semibold tracking-tight text-chat-text no-underline"
          >
            Webbit
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-chat-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            connected
          </span>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5" ref={scrollRef}>
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <div
                key={msg.id}
                className="max-w-[85%] self-end rounded-[16px_16px_4px_16px] bg-chat-bubble px-3.5 py-2.5 text-sm leading-normal whitespace-pre-wrap"
              >
                {msg.content}
              </div>
            ) : (
              <div
                key={msg.id}
                className="self-stretch text-sm leading-relaxed whitespace-pre-wrap text-chat-text/90"
              >
                {msg.content}
                {msg.title && (
                  <div className="mt-2 rounded-xl border border-chat-border bg-chat-surface px-3.5 py-3">
                    <div className="mb-1.5 text-sm font-semibold">{msg.title}</div>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        className="cursor-pointer rounded-md border border-chat-border bg-chat-elevated px-3 py-1.5 text-[13px] text-chat-text"
                        onClick={() => setView('code')}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-md border border-chat-border bg-chat-elevated px-3 py-1.5 text-[13px] text-chat-text"
                        onClick={() => setView('preview')}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ),
          )}

          {busy && (
            <div className="flex items-center gap-2 self-stretch text-sm text-chat-text/90">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Thinking…
            </div>
          )}

          {error && (
            <div className="self-stretch text-sm text-red-300">{error}</div>
          )}
        </div>

        <div className="shrink-0 border-t border-chat-border bg-chat-bg px-4 pt-3 pb-4">
          <form
            className="flex items-end gap-2 rounded-xl border border-chat-border bg-chat-surface px-3 py-2.5"
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
              className="max-h-[140px] min-h-11 flex-1 resize-none border-none bg-transparent text-sm leading-snug text-chat-text outline-none placeholder:text-chat-muted disabled:opacity-60"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit(input)
                }
              }}
            />
            <button
              type="submit"
              className="btn-inset focus-soft inline-flex cursor-pointer items-center justify-center rounded-full border-none bg-charcoal px-4 py-2 text-sm text-off-white transition-opacity active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy || !input.trim()}
            >
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
