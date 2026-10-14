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
    <div className="relative min-h-svh overflow-hidden bg-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[10%] -top-[20%] z-0 h-[55%] bg-[radial-gradient(ellipse_at_20%_40%,rgba(255,180,140,0.28),transparent_55%),radial-gradient(ellipse_at_70%_30%,rgba(160,190,255,0.22),transparent_50%),radial-gradient(ellipse_at_50%_70%,rgba(255,200,210,0.2),transparent_55%)]"
      />

      <nav className="sticky top-0 z-10 flex items-center justify-between bg-cream/88 px-8 py-4 backdrop-blur-sm">
        <Link
          to="/"
          className="text-base font-semibold tracking-tight text-charcoal no-underline"
        >
          Webbit
        </Link>
        <div className="flex items-center gap-6">
          <a href="#how" className="text-sm text-charcoal no-underline">
            How it works
          </a>
          <Link
            to="/chat"
            className="btn-inset focus-soft inline-flex items-center justify-center gap-2 rounded-md border-none bg-charcoal px-4 py-2 text-off-white no-underline transition-opacity active:opacity-80"
          >
            Open chat
          </Link>
        </div>
      </nav>

      <main className="relative z-1 mx-auto max-w-[820px] px-6 pt-24 pb-32 text-center">
        <h1 className="mb-4 text-[clamp(36px,6vw,60px)] leading-[1.05] font-semibold tracking-[-1.5px] text-charcoal">
          Build something lovely with a prompt
        </h1>
        <p className="mx-auto mb-10 max-w-[520px] text-lg leading-snug text-muted">
          Describe an app and Webbit scaffolds the project, keeps a live file
          tree, and lets you iterate in chat — preview or code side by side.
        </p>

        <form
          className="rounded-xl border border-border bg-cream p-4 text-left shadow-[0_1px_0_rgb(28_28_28/0.03)]"
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
            className="min-h-24 w-full resize-y border-none bg-transparent text-base leading-normal text-charcoal outline-none placeholder:text-muted disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                void start(prompt)
              }
            }}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px] text-muted">⌘/Ctrl + Enter to build</span>
            <button
              type="submit"
              className="btn-inset focus-soft inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-charcoal px-4 py-2 text-off-white transition-opacity active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  Building…
                </>
              ) : (
                'Start building'
              )}
            </button>
          </div>
        </form>

        {error && <p className="mt-3 text-sm text-[#b42318]">{error}</p>}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="cursor-pointer rounded-full border border-border bg-transparent px-3.5 py-2 text-sm text-charcoal-82 hover:bg-charcoal-04 disabled:cursor-not-allowed disabled:opacity-50"
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

        <div id="how" className="mt-20 flex flex-wrap justify-center gap-12">
          <div>
            <strong className="block text-5xl leading-none font-semibold tracking-tight text-charcoal">
              2
            </strong>
            <span className="mt-2 block text-base text-muted">API routes to build with</span>
          </div>
          <div>
            <strong className="block text-5xl leading-none font-semibold tracking-tight text-charcoal">
              1
            </strong>
            <span className="mt-2 block text-base text-muted">Prompt to scaffold a project</span>
          </div>
          <div>
            <strong className="block text-5xl leading-none font-semibold tracking-tight text-charcoal">
              ∞
            </strong>
            <span className="mt-2 block text-base text-muted">Chat iterations on code</span>
          </div>
        </div>
      </main>
    </div>
  )
}
