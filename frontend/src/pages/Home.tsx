import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchTemplate } from '../api/client'
import { saveSession } from '../lib/session'

const SUGGESTIONS = [
  'Build a todo app with React',
  'Create a landing page for a SaaS',
  'Make a Node.js REST API',
  'Design a personal portfolio',
]

export function Home() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)

    try {
      const template = await fetchTemplate(trimmed)
      saveSession({ prompt: trimmed, template })
      navigate('/chat')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <nav className="home-nav">
        <Link to="/" className="home-logo">
          Webbit
        </Link>
        <div className="home-nav-links">
          <a href="#how">How it works</a>
          <Link to="/chat" className="btn btn-primary">
            Open chat
          </Link>
        </div>
      </nav>

      <main className="home-hero">
        <h1>Build something lovely with a prompt</h1>
        <p>
          Describe an app and Webbit scaffolds the project, keeps a live file
          tree, and lets you iterate in chat — preview or code side by side.
        </p>

        <form
          className="prompt-box"
          onSubmit={(e) => {
            e.preventDefault()
            void start(prompt)
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Webbit to build a weather dashboard, a blog, a game…"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                void start(prompt)
              }
            }}
          />
          <div className="prompt-box-footer">
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              ⌘/Ctrl + Enter to build
            </span>
            <button type="submit" className="btn btn-primary" disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <span className="spinner" /> Building…
                </>
              ) : (
                'Start building'
              )}
            </button>
          </div>
        </form>

        {error && <p className="home-error">{error}</p>}

        <div className="suggestion-row">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="suggestion-chip"
              onClick={() => {
                setPrompt(s)
                void start(s)
              }}
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="home-stats" id="how">
          <div className="home-stat">
            <strong>2</strong>
            <span>API routes to build with</span>
          </div>
          <div className="home-stat">
            <strong>1</strong>
            <span>Prompt to scaffold a project</span>
          </div>
          <div className="home-stat">
            <strong>∞</strong>
            <span>Chat iterations on code</span>
          </div>
        </div>
      </main>
    </div>
  )
}
