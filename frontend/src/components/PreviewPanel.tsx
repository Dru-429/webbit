import { useMemo } from 'react'
import type { FileMap } from '../types'

type Props = {
  files: FileMap
}

function buildPreviewHtml(files: FileMap): string | null {
  const htmlFile =
    files['index.html'] ??
    files['public/index.html'] ??
    Object.entries(files).find(([p]) => p.endsWith('index.html'))?.[1]

  if (!htmlFile) return null

  const css =
    files['src/index.css'] ??
    files['index.css'] ??
    files['src/App.css'] ??
    ''

  const app =
    files['src/App.tsx'] ??
    files['src/App.jsx'] ??
    files['src/main.tsx'] ??
    files['index.js'] ??
    ''

  // For React scaffolds we can't run JSX in an iframe without a bundler.
  // Show a friendly static preview surface with the entry HTML + CSS when possible.
  const hasReact = /react/i.test(app) || Object.keys(files).some((p) => p.endsWith('.tsx') || p.endsWith('.jsx'))

  if (hasReact) {
    const snippet = app.slice(0, 400)
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: #f7f4ed;
      color: #1c1c1c;
    }
    .wrap {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;
      gap: 12px;
    }
    h1 { font-size: 28px; font-weight: 600; letter-spacing: -0.6px; margin: 0; }
    p { color: #5f5f5d; max-width: 420px; line-height: 1.5; margin: 0; }
    pre {
      text-align: left;
      background: #1c1c1c;
      color: #fcfbf8;
      padding: 16px;
      border-radius: 12px;
      font-size: 12px;
      max-width: 560px;
      width: 100%;
      overflow: auto;
      margin-top: 16px;
    }
    ${css}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Preview</h1>
    <p>React projects need a runtime to render live. Showing your entry component source until WebContainer is wired.</p>
    <pre>${escapeHtml(snippet)}${app.length > 400 ? '\n…' : ''}</pre>
  </div>
</body>
</html>`
  }

  // Plain HTML project — inject CSS if present
  if (css && !/<link[^>]+stylesheet/i.test(htmlFile)) {
    return htmlFile.replace(
      '</head>',
      `<style>${css}</style></head>`,
    )
  }

  return htmlFile
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function PreviewPanel({ files }: Props) {
  const srcDoc = useMemo(() => buildPreviewHtml(files), [files])
  const fileCount = Object.keys(files).length

  if (!srcDoc) {
    return (
      <div className="preview-empty">
        <h2>No preview yet</h2>
        <p>
          {fileCount === 0
            ? 'Start a chat to generate project files.'
            : 'No index.html found in the generated files.'}
        </p>
      </div>
    )
  }

  return (
    <iframe
      className="preview-frame"
      title="Preview"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
    />
  )
}
