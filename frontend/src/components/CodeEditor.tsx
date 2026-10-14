import Editor from '@monaco-editor/react'
import { languageFromPath } from '../lib/monacoLanguage'

type Props = {
  path: string | null
  content: string
  onTogglePreview: () => void
}

export function CodeEditor({ path, content, onTogglePreview }: Props) {
  const language = languageFromPath(path)

  return (
    <div className="flex min-h-0 min-w-0 flex-col bg-code-bg">
      <div className="flex min-h-11 shrink-0 items-center justify-between border-b border-chat-border px-3">
        <div
          className={`inline-flex items-center gap-2 border-b-2 px-1 py-2.5 text-[13px] ${
            path
              ? 'border-accent-blue text-chat-text'
              : 'border-transparent text-chat-text/80'
          }`}
        >
          {path ?? 'No file selected'}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-transparent text-chat-muted hover:bg-white/6 hover:text-chat-text"
            title="Preview"
            onClick={onTogglePreview}
            aria-label="Switch to preview"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M3 16h18" />
            </svg>
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-transparent bg-accent-blue/20 text-[#93c5fd]"
            title="Code"
            aria-label="Code view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 8l-4 4 4 4" />
              <path d="M16 8l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>

      {path ? (
        <div className="min-h-0 flex-1">
          <Editor
            key={path}
            height="100%"
            theme="vs-dark"
            language={language}
            value={content}
            path={path}
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', ui-monospace, Consolas, monospace",
              lineHeight: 20,
              padding: { top: 12, bottom: 12 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'off',
              renderLineHighlight: 'line',
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              folding: true,
              tabSize: 2,
            }}
            loading={
              <div className="flex h-full items-center justify-center bg-code-bg text-sm text-chat-muted">
                Loading editor…
              </div>
            }
          />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-code-bg p-8 text-center text-chat-muted">
          <h2 className="m-0 text-xl font-normal text-chat-text">Select a file</h2>
          <p className="m-0 text-sm">Choose a file from the explorer to view its contents.</p>
        </div>
      )}
    </div>
  )
}
