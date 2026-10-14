/** Map a file path to a Monaco language id. */
export function languageFromPath(path: string | null): string {
  if (!path) return 'plaintext'
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'js':
    case 'jsx':
      return 'javascript'
    case 'json':
      return 'json'
    case 'css':
      return 'css'
    case 'scss':
    case 'sass':
      return 'scss'
    case 'html':
    case 'htm':
      return 'html'
    case 'md':
    case 'markdown':
      return 'markdown'
    case 'yml':
    case 'yaml':
      return 'yaml'
    case 'svg':
    case 'xml':
      return 'xml'
    case 'py':
      return 'python'
    case 'sh':
    case 'bash':
      return 'shell'
    case 'sql':
      return 'sql'
    default:
      return 'plaintext'
  }
}
