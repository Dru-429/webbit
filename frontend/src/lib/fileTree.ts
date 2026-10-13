import type { FileMap, FileTreeNode } from '../types'

export function buildFileTree(files: FileMap): FileTreeNode[] {
  const root: FileTreeNode[] = []

  const sorted = Object.keys(files).sort((a, b) => a.localeCompare(b))

  for (const filePath of sorted) {
    const parts = filePath.split('/').filter(Boolean)
    let current = root

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1
      const path = parts.slice(0, index + 1).join('/')
      let node = current.find((n) => n.name === part)

      if (!node) {
        node = {
          name: part,
          path,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
        }
        current.push(node)
      }

      if (!isFile && node.children) {
        current = node.children
      }
    })
  }

  const sortNodes = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    nodes.forEach((n) => {
      if (n.children) sortNodes(n.children)
    })
  }

  sortNodes(root)
  return root
}

export function filterTree(
  nodes: FileTreeNode[],
  query: string,
): FileTreeNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes

  const walk = (list: FileTreeNode[]): FileTreeNode[] => {
    const out: FileTreeNode[] = []
    for (const node of list) {
      if (node.type === 'file') {
        if (node.path.toLowerCase().includes(q) || node.name.toLowerCase().includes(q)) {
          out.push(node)
        }
      } else {
        const children = walk(node.children ?? [])
        if (children.length > 0 || node.name.toLowerCase().includes(q)) {
          out.push({ ...node, children })
        }
      }
    }
    return out
  }

  return walk(nodes)
}

export function firstFilePath(files: FileMap): string | null {
  const keys = Object.keys(files).sort((a, b) => a.localeCompare(b))
  return keys[0] ?? null
}

export function downloadCodebase(files: FileMap, name = 'codebase.json') {
  const blob = new Blob([JSON.stringify(files, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
