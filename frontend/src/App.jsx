import { useState } from 'react'
import InputPanel from './components/InputPanel'
import CleanJDSection from './components/CleanJDSection'
import BooleanTabs from './components/BooleanTabs'
import OutputSection from './components/OutputSection'
import LoadingState from './components/LoadingState'

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  return (
    <div className="min-h-screen bg-bg font-sans">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-bg/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c6fff, #5a4fd8)' }}
            >
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span className="text-sm font-semibold text-text">AI Recruiter Copilot</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-medium">
              ADK
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted hidden sm:block">Gemini Flash · 2-Agent Pipeline</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Backend connected" />
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-text">Recruiter Workflow</h1>
          <p className="text-sm text-muted mt-0.5">
            Paste a raw JD → get clean JD, Boolean strings, outreach & LinkedIn post.
          </p>
        </div>

        {/* Input Panel */}
        <InputPanel
          onResult={setResult}
          onLoading={setLoading}
          onError={setError}
        />

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
            <p className="text-sm text-red-400">⚠ {error}</p>
            {error.includes('API key') && (
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent hover:underline mt-1 block"
              >
                Get a free Gemini API key →
              </a>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingState />}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-4 animate-fade-in">
            {/* Section label */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs text-muted font-medium">Results</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {/* Agent 1 Outputs */}
            <CleanJDSection cleanJd={result.clean_jd} />
            <BooleanTabs booleans={result.booleans} />

            {/* Agent 2 Outputs */}
            <OutputSection
              title="Short Outreach"
              icon="✉️"
              content={result.outreach?.short}
            />
            <OutputSection
              title="Detailed Outreach"
              icon="📧"
              content={result.outreach?.detailed}
            />
            <OutputSection
              title="LinkedIn Hiring Post"
              icon="💼"
              content={result.linkedin_post}
            />

            {/* Bottom spacer */}
            <div className="h-8" />
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="text-center py-16 animate-fade-in">
            <div
              className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c6fff22, #5a4fd822)' }}
            >
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-sm text-muted">
              Paste a job description above and click{' '}
              <span className="text-text font-medium">Generate</span>
            </p>
            <p className="text-xs text-muted/60 mt-1">
              2-agent pipeline · JD cleanup → Boolean → Outreach → LinkedIn
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
