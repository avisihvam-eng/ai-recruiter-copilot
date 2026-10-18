import { useCallback, useEffect, useMemo, useState } from 'react'

import Header from './components/Header'
import InputPanel from './components/InputPanel'
import ErrorBanner from './components/ErrorBanner'
import LoadingState from './components/LoadingState'
import EmptyState from './components/EmptyState'
import WorkspaceNav from './components/WorkspaceNav'
import SourceJd from './components/SourceJd'
import RoleBrief from './components/RoleBrief'
import SearchStrings from './components/SearchStrings'
import OutreachSection from './components/OutreachSection'
import TextBlock from './components/TextBlock'
import RecruiterPrep from './components/RecruiterPrep'
import CopyButton from './components/CopyButton'
import { IconDownload } from './components/Icons'

import { SECTIONS } from './lib/sections'
import { requestKit, checkHealth, stampNow } from './lib/api'
import { useScrollSpy } from './lib/useScrollSpy'
import { buildMarkdownKit, kitFilename, downloadText } from './lib/kit'
import { kitToOutlookHtml } from './lib/outlook'
import { cloneSampleResult, SAMPLE_JD } from './data/sample'

const KIT_KEY = 'recruiter-copilot:last-kit'

// Section ids come from one place, so the nav and the rendered order can never
// drift apart. Order matches SECTIONS in lib/sections.js.
const [ROLE_BRIEF, SEARCH_STRINGS, OUTREACH, LINKEDIN, PREP] = SECTIONS

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('checking')
  const [kit, setKit] = useState(() => {
    try {
      const saved = localStorage.getItem(KIT_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const result = kit?.result ?? null

  // Keep the last kit across refreshes — losing a paid-for generation to an
  // accidental reload is the most annoying possible bug.
  useEffect(() => {
    try {
      if (kit) localStorage.setItem(KIT_KEY, JSON.stringify(kit))
      else localStorage.removeItem(KIT_KEY)
    } catch {
      /* storage unavailable or quota exceeded — non-fatal */
    }
  }, [kit])

  // Real backend probe, replacing the old unconditional green dot.
  useEffect(() => {
    let alive = true
    checkHealth().then((ok) => {
      if (alive) setStatus(ok ? 'online' : 'offline')
    })
    return () => {
      alive = false
    }
  }, [])

  // Only the five nav destinations are observed. The Source JD block has no nav
  // entry of its own, and including it would let the nav settle into a
  // highlight-free state while the reader is parked on it.
  const spyIds = useMemo(() => SECTIONS.map((s) => s.id), [])
  // Default to the first section the nav can point at, so the nav is never in a
  // fully inactive state on first paint.
  const spyActive = useScrollSpy(result ? spyIds : [])
  const activeId = spyActive ?? ROLE_BRIEF.id

  const scrollToWorkspace = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const handleRun = useCallback(
    async (rawJd) => {
      setError(null)
      setLoading(true)
      try {
        const data = await requestKit(rawJd)
        setKit({ result: data, rawJd, isSample: false, at: stampNow() })
        scrollToWorkspace()
      } catch (err) {
        if (err?.name === 'AbortError') return
        setError(err?.message || 'Something went wrong while building the kit.')
      } finally {
        setLoading(false)
      }
    },
    [scrollToWorkspace],
  )

  const handleLoadSample = useCallback(() => {
    setError(null)
    setKit({ result: cloneSampleResult(), rawJd: SAMPLE_JD, isSample: true, at: stampNow() })
    scrollToWorkspace()
  }, [scrollToWorkspace])

  const handleStartOver = useCallback(() => {
    setKit(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const markdown = useMemo(() => buildMarkdownKit(result), [result])
  // The clipboard gets Word-safe HTML; the download stays Markdown. Pasting raw
  // Markdown into Outlook would show "#" and "**" literally.
  const kitHtml = useMemo(() => kitToOutlookHtml(result), [result])

  return (
    <div className="app-shell">
      <Header status={status} />

      <main className="workspace">
        <p className="sr-only" role="status">
          {result ? 'Recruiting kit ready — five sections' : ''}
        </p>

        <section className="page-head" aria-labelledby="page-title">
          <h1 id="page-title" className="page-title">
            Turn one job description into a complete recruiting kit.
          </h1>
          <p className="page-sub">
            A role brief, Boolean search strings, candidate outreach, a LinkedIn post, and intake
            prep — generated from your raw JD in a single run.
          </p>
        </section>

        <InputPanel onRun={handleRun} loading={loading} />

        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {loading && <LoadingState />}

        {!loading && !result && <EmptyState onLoadSample={handleLoadSample} />}

        {!loading && result && (
          <div className="kit" id="workspace">
            {kit.isSample && (
              <div className="callout callout-sample kit-notice">
                <span className="callout-swatch" aria-hidden="true" />
                <p>
                  <span className="callout-tag">Example kit</span> — this is a prepared sample so you
                  can see all five assets. Paste your own job description above and press{' '}
                  <strong>Build kit</strong> to generate a real kit from your role.
                </p>
              </div>
            )}

            <div className="kit-head">
              <div className="kit-head-meta">
                <p className="kit-title">Your recruiting kit</p>
                <p className="kit-sub">
                  5 assets · {kit.isSample ? 'Example' : 'Generated'} · {kit.at}
                </p>
              </div>

              <div className="kit-actions">
                <CopyButton text={markdown} html={kitHtml} label="Copy kit" />
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => downloadText(markdown, kitFilename(result?.clean_jd?.title))}
                >
                  <IconDownload />
                  Download
                </button>
                <button type="button" className="btn btn-quiet btn-sm" onClick={handleStartOver}>
                  Start over
                </button>
              </div>
            </div>

            <div className="kit-grid">
              <WorkspaceNav activeId={activeId} />

              <div className="doc">
                <SourceJd rawJd={kit.rawJd} />

                <RoleBrief id={ROLE_BRIEF.id} num={ROLE_BRIEF.num} cleanJd={result.clean_jd} />

                <SearchStrings
                  id={SEARCH_STRINGS.id}
                  num={SEARCH_STRINGS.num}
                  booleans={result.booleans}
                />

                <OutreachSection
                  id={OUTREACH.id}
                  num={OUTREACH.num}
                  outreach={result.outreach}
                />

                <TextBlock
                  id={LINKEDIN.id}
                  num={LINKEDIN.num}
                  title="LinkedIn post"
                  subtitle="Formatted and ready to publish"
                  content={result.linkedin_post}
                />

                <RecruiterPrep id={PREP.id} num={PREP.num} brief={result.recruiter_brief} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>Recruiter Copilot · Google ADK + Gemini</span>
        <nav className="footer-links" aria-label="Project links">
          <a
            href="https://github.com/avisihvam-eng/ai-recruiter-copilot"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a href="https://google.github.io/adk-docs/" target="_blank" rel="noreferrer">
            ADK docs
          </a>
        </nav>
      </footer>
    </div>
  )
}
