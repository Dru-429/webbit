import { useEffect, useMemo, useState } from 'react'
import type { FileMap, FileTreeNode } from '../types'
import { buildFileTree, downloadCodebase, filterTree } from '../lib/fileTree'

type Props = {
  files: FileMap
  activePath: string | null
  onSelect: (path: string) => void
}

function extBadge(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['ts', 'tsx'].includes(ext)) return { label: 'TS', className: '' }
  if (['js', 'jsx'].includes(ext)) return { label: 'JS', className: '' }
  if (ext === 'json') return { label: 'JS', className: 'json' }
  if (ext === 'css') return { label: 'CSS', className: 'css' }
  if (ext === 'html') return { label: 'HTML', className: 'html' }
  if (ext === 'md') return { label: 'MD', className: 'md' }
  return { label: ext.slice(0, 3).toUpperCase() || 'F', className: '' }
}

function TreeNode({
  node,
  depth,
  activePath,
  onSelect,
  open,
  toggle,
}: {
  node: FileTreeNode
  depth: number
  activePath: string | null
  onSelect: (path: string) => void
  open: Set<string>
  toggle: (path: string) => void
}) {
  if (node.type === 'folder') {
    const isOpen = open.has(node.path)
    return (
      <div>
        <button
          type="button"
          className="tree-folder"
          style={{ paddingLeft: 8 + depth * 10 }}
          onClick={() => toggle(node.path)}
        >
          <span aria-hidden>{isOpen ? '▾' : '▸'}</span>
          <span>{node.name}</span>
        </button>
        {isOpen && (
          <div className="tree-children">
            {(node.children ?? []).map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                activePath={activePath}
                onSelect={onSelect}
                open={open}
                toggle={toggle}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const badge = extBadge(node.name)
  return (
    <button
      type="button"
      className={`tree-file${activePath === node.path ? ' active' : ''}`}
      style={{ paddingLeft: 8 + depth * 10 }}
      onClick={() => onSelect(node.path)}
    >
      <span className={`file-ext ${badge.className}`}>{badge.label}</span>
      <span>{node.name}</span>
    </button>
  )
}

export function FileExplorer({ files, activePath, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const tree = useMemo(() => buildFileTree(files), [files])
  const filtered = useMemo(() => filterTree(tree, query), [tree, query])

  const [open, setOpen] = useState<Set<string>>(new Set())

  useEffect(() => {
    setOpen((prev) => {
      const next = new Set(prev)
      for (const n of tree) {
        if (n.type === 'folder') next.add(n.path)
      }
      // Keep src expanded like the screenshot
      if (tree.some((n) => n.path === 'src')) next.add('src')
      return next
    })
  }, [tree])

  const toggle = (path: string) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return (
    <aside className="file-explorer">
      <div className="file-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search code"
          aria-label="Search code"
        />
      </div>

      <div className="file-tree">
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--chat-muted)', padding: 8, margin: 0, fontSize: 13 }}>
            No files yet
          </p>
        ) : (
          filtered.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              activePath={activePath}
              onSelect={onSelect}
              open={open}
              toggle={toggle}
            />
          ))
        )}
      </div>

      <div className="explorer-footer">
        <button type="button" onClick={() => downloadCodebase(files)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          Download codebase
        </button>
      </div>
    </aside>
  )
}
