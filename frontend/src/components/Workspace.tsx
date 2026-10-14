import type { FileMap, WorkspaceView } from '../types'
import { FileExplorer } from './FileExplorer'
import { CodeEditor } from './CodeEditor'
import { PreviewPanel } from './PreviewPanel'

type Props = {
  files: FileMap
  view: WorkspaceView
  onViewChange: (view: WorkspaceView) => void
  activePath: string | null
  onSelectFile: (path: string) => void
}

export function Workspace({
  files,
  view,
  onViewChange,
  activePath,
  onSelectFile,
}: Props) {
  const content = activePath ? (files[activePath] ?? '') : ''

  return (
    <section className="flex min-h-0 min-w-0 flex-col bg-cream text-charcoal">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-cream px-3.5 py-2.5">
        <div
          className="inline-flex gap-1 rounded-md border border-border bg-charcoal-03 p-0.5"
          role="tablist"
          aria-label="Workspace view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === 'preview'}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded border-none px-3 py-1.5 text-[13px] ${
              view === 'preview'
                ? 'bg-accent-blue text-white'
                : 'bg-transparent text-muted'
            }`}
            onClick={() => onViewChange('preview')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="14" rx="2" />
            </svg>
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'code'}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded border-none px-3 py-1.5 text-[13px] ${
              view === 'code'
                ? 'bg-accent-blue text-white'
                : 'bg-transparent text-muted'
            }`}
            onClick={() => onViewChange('code')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 8l-4 4 4 4" />
              <path d="M16 8l4 4-4 4" />
            </svg>
            Code
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {view === 'preview' ? (
          <PreviewPanel files={files} />
        ) : (
          <div className="grid h-full grid-cols-1 bg-code-bg text-chat-text max-[700px]:grid-cols-1 min-[701px]:grid-cols-[260px_1fr]">
            <FileExplorer
              files={files}
              activePath={activePath}
              onSelect={onSelectFile}
            />
            <CodeEditor
              path={activePath}
              content={content}
              onTogglePreview={() => onViewChange('preview')}
            />
          </div>
        )}
      </div>
    </section>
  )
}
