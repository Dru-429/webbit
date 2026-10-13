import type { FileMap } from '../types'

const FILE_ACTION_RE =
  /<boltAction\b([^>]*)\btype=["']file["']([^>]*)>([\s\S]*?)<\/boltAction>/gi

function readFilePath(attrs: string): string | null {
  const match = attrs.match(/filePath=["']([^"']+)["']/i)
  return match?.[1] ?? null
}

/** Pull file contents out of boltArtifact / boltAction markup. */
export function parseArtifactFiles(text: string): FileMap {
  const files: FileMap = {}
  if (!text) return files

  let match: RegExpExecArray | null
  FILE_ACTION_RE.lastIndex = 0

  while ((match = FILE_ACTION_RE.exec(text)) !== null) {
    const attrs = `${match[1] ?? ''} ${match[2] ?? ''}`
    const path = readFilePath(attrs)
    if (!path) continue

    let content = match[3] ?? ''
    // Trim a single leading newline often present in artifacts
    if (content.startsWith('\n')) content = content.slice(1)
    files[path] = content
  }

  return files
}

export function mergeFiles(base: FileMap, next: FileMap): FileMap {
  return { ...base, ...next }
}

/** Strip artifact XML for readable chat text. */
export function stripArtifacts(text: string): string {
  return text
    .replace(/<boltArtifact\b[^>]*>[\s\S]*?<\/boltArtifact>/gi, '')
    .replace(/<boltAction\b[^>]*>[\s\S]*?<\/boltAction>/gi, '')
    .trim()
}

export function extractArtifactTitle(text: string): string | undefined {
  const match = text.match(/<boltArtifact\b[^>]*\btitle=["']([^"']+)["']/i)
  return match?.[1]
}
