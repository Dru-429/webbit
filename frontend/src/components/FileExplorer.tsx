import { useEffect, useMemo, useState } from 'react'
import type { FileMap, FileTreeNode } from '../types'
import { buildFileTree, downloadCodebase, filterTree } from '../lib/fileTree'

type Props = {
  files: FileMap
  activePath: string | null
  onSelect: (path: string) => void
}

const EXT_BADGE: Record<string, string> = {
  ts: 'bg-accent-blue',
  tsx: 'bg-accent-blue',
  js: 'bg-accent-blue',
  jsx: 'bg-accent-blue',
  json: 'bg-yellow-600',
  css: 'bg-sky-500',
  html: 'bg-orange-600',
  md: 'bg-slate-500',
}

function extBadge(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['ts', 'tsx'].includes(ext)) return { label: 'TS', className: EXT_BADGE.ts }
  if (['js', 'jsx'].includes(ext)) return { label: 'JS', className: EXT_BADGE.js }
  if (ext === 'json') return { label: 'JS', className: EXT_BADGE.json }
  if (ext === 'css') return { label: 'CSS', className: EXT_BADGE.css }
  if (ext === 'html') return { label: 'HTML', className: EXT_BADGE.html }
  if (ext === 'md') return { label: 'MD', className: EXT_BADGE.md }
  return {
    label: ext.slice(0, 3).toUpperCase() || 'F',
    className: 'bg-accent-blue',
  }
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
          className="flex w-full cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-2 py-1.5 text-left text-[13px] text-chat-text/85 hover:bg-white/6"
          style={{ paddingLeft: 8 + depth * 10 }}
          onClick={() => toggle(node.path)}
        >
          <span aria-hidden>{isOpen ? '▾' : '▸'}</span>
          <span>{node.name}</span>
        </button>
        {isOpen && (
          <div className="ml-3 border-l border-white/6 pl-1">
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
  const active = activePath === node.path
  return (
    <button
      type="button"
      className={`flex w-full cursor-pointer items-center gap-1.5 rounded-md border-none px-2 py-1.5 text-left text-[13px] text-chat-text/85 ${
        active ? 'bg-white/6' : 'bg-transparent hover:bg-white/6'
      }`}
      style={{ paddingLeft: 8 + depth * 10 }}
      onClick={() => onSelect(node.path)}
    >
      <span
        className={`inline-flex h-3.5 w-[18px] shrink-0 items-center justify-center rounded-sm text-[8px] font-semibold tracking-tight text-white ${badge.className}`}
      >
        {badge.label}
      </span>
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
    <aside className="flex min-h-0 flex-col border-r border-chat-border bg-chat-surface">
      <div className="relative border-b border-chat-border p-3">
        <svg
          className="pointer-events-none absolute top-1/2 left-[22px] -translate-y-1/2 opacity-45"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search code"
          aria-label="Search code"
          className="w-full rounded-md border border-chat-border bg-code-bg py-2 pr-2.5 pl-8 text-[13px] text-chat-text outline-none focus:shadow-[0_0_0_2px_var(--color-ring)]"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 text-[13px]">
        {filtered.length === 0 ? (
          <p className="m-0 p-2 text-[13px] text-chat-muted">No files yet</p>
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

      <div className="border-t border-chat-border p-3">
        <button
          type="button"
          onClick={() => downloadCodebase(files)}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-chat-border bg-chat-elevated px-3 py-2.5 text-[13px] text-chat-text"
        >
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
