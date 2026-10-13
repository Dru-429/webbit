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
    <section className="workspace">
      <header className="workspace-toolbar">
        <div className="view-toggle" role="tablist" aria-label="Workspace view">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'preview'}
            className={view === 'preview' ? 'active' : ''}
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
            className={view === 'code' ? 'active' : ''}
            onClick={() => onViewChange('code')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 8l-4 4 4 4" />
              <path d="M16 8l4 4-4 4" />
            </svg>
            Code
          </button>
        </div>

        <div className="workspace-actions">
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {Object.keys(files).length} files
          </span>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }}>
            Share
          </button>
          <button type="button" className="btn btn-primary" style={{ fontSize: 13 }}>
            Publish
          </button>
        </div>
      </header>

      <div className="workspace-body">
        {view === 'preview' ? (
          <PreviewPanel files={files} />
        ) : (
          <div className="code-panel">
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
