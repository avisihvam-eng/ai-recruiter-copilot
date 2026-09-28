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
      <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: '#111111' }}
            >
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <span className="text-sm font-semibold text-text">Recruiter Copilot</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-surface text-text-dim border border-border font-medium">
              ADK
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted hidden sm:block">Decision support for human recruiters</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Backend connected" />
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text leading-snug tracking-tight">
            Another JD just landed in your inbox.{' '}
            <span className="text-accent">Kool. Now what?</span>
          </h1>
          <p className="text-sm text-muted mt-3 max-w-xl leading-relaxed">
            Paste it here. We'll turn the role into a sourcing plan, candidate outreach, screening questions, and a recruiter-ready brief.
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
            <p className="text-sm text-red-400">! {error}</p>
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
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted font-medium">Your kit</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Agent 1 Outputs */}
            <CleanJDSection cleanJd={result.clean_jd} />
            <BooleanTabs booleans={result.booleans} />

            {/* Agent 2 Outputs */}
            <OutputSection
              title="Short Outreach"
              content={result.outreach?.short}
            />
            <OutputSection
              title="Detailed Outreach"
              content={result.outreach?.detailed}
            />
            <OutputSection
              title="LinkedIn Hiring Post"
              content={result.linkedin_post}
            />

            {/* Bottom spacer */}
            <div className="h-8" />
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-sm text-muted">
              Paste a job description above and click{' '}
              <span className="text-text font-medium">Generate</span>
            </p>
            <p className="text-xs text-muted/60 mt-1">
              JD cleanup · Boolean strings · Outreach · LinkedIn
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
