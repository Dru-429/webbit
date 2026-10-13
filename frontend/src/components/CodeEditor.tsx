import { useMemo } from 'react'
import { highlightCode } from '../lib/highlight'

type Props = {
  path: string | null
  content: string
  onTogglePreview: () => void
}

export function CodeEditor({ path, content, onTogglePreview }: Props) {
  const lines = useMemo(() => content.split('\n'), [content])
  const html = useMemo(
    () => (path ? highlightCode(content, path) : ''),
    [content, path],
  )

  return (
    <div className="editor-pane">
      <div className="editor-tabs">
        <div className={`editor-tab${path ? ' active' : ''}`}>
          {path ?? 'No file selected'}
        </div>
        <div className="editor-toolbar-icons">
          <button
            type="button"
            className="icon-btn"
            title="Preview"
            onClick={onTogglePreview}
            aria-label="Switch to preview"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M3 16h18" />
            </svg>
          </button>
          <button type="button" className="icon-btn active" title="Code" aria-label="Code view">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 8l-4 4 4 4" />
              <path d="M16 8l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>

      {path ? (
        <div className="code-view">
          <div className="code-gutter" aria-hidden>
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre
            className="code-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      ) : (
        <div className="preview-empty" style={{ background: 'var(--code-bg)', color: 'var(--chat-muted)' }}>
          <h2 style={{ color: 'var(--chat-text)' }}>Select a file</h2>
          <p>Choose a file from the explorer to view its contents.</p>
        </div>
      )}
    </div>
  )
}
