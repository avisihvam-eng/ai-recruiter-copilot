import { useCallback, useEffect, useMemo, useState } from 'react'

import Header from './components/Header'
import InputPanel from './components/InputPanel'
import ErrorBanner from './components/ErrorBanner'
import LoadingState from './components/LoadingState'
import EmptyState from './components/EmptyState'
import RecentKits from './components/RecentKits'
import AboutDialog from './components/AboutDialog'
import WorkspaceNav from './components/WorkspaceNav'
import SourceJd from './components/SourceJd'
import RoleBrief from './components/RoleBrief'
import SearchStrings from './components/SearchStrings'
import OutreachSection from './components/OutreachSection'
import LinkedInPost from './components/LinkedInPost'
import RecruiterPrep from './components/RecruiterPrep'
import CopyButton from './components/CopyButton'

import { SECTIONS } from './lib/sections'
import { requestKit, streamKit, regenerateAsset, checkHealth, stampNow } from './lib/api'
import { useScrollSpy } from './lib/useScrollSpy'
import { buildMarkdownKit } from './lib/kit'
import { kitToOutlookHtml } from './lib/outlook'
import { cloneSampleResult, SAMPLE_JD } from './data/sample'

const HISTORY_KEY = 'recruiter-copilot:history'
const HISTORY_MAX = 5

// How long a healthy probe is allowed to take before we assume a cold start and
// start explaining the wait. A warm backend answers in a few hundred ms.
const WARMING_AFTER_MS = 1200

// Edits land in the live kit straight away, but only reach the saved history
// once the typing stops — otherwise every keystroke rewrites the whole array.
const HISTORY_SYNC_MS = 700

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `k${Date.now()}${Math.random().toString(36).slice(2, 7)}`

// Section ids come from one place, so the nav and the rendered order can never
// drift apart. Order matches SECTIONS in lib/sections.js.
const [ROLE_BRIEF, SEARCH_STRINGS, OUTREACH, LINKEDIN, PREP] = SECTIONS

export default function App() {
  const [loading, setLoading] = useState(false)
  const [stageStates, setStageStates] = useState({})
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('checking')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [history, setHistory] = useState(readHistory)
  const [kit, setKit] = useState(() => readHistory()[0] ?? null)
  const [regenerating, setRegenerating] = useState(null)

  const result = kit?.result ?? null
  const ready = status === 'online'

  // Keep the last few kits across refreshes — losing a paid-for generation to an
  // accidental reload is the most annoying possible bug.
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      /* storage unavailable or quota exceeded — history is a convenience */
    }
  }, [history])

  // Probe once on mount. State is only touched *after* the await, so this does
  // not trigger a synchronous re-render from inside the effect.
  useEffect(() => {
    let alive = true
    checkHealth().then(({ ok }) => {
      if (alive) setStatus(ok ? 'online' : 'offline')
    })
    return () => {
      alive = false
    }
  }, [])

  // Escalate "still checking" to "waking up" rather than leaving the user with
  // no explanation for a wait that can run to 20 seconds.
  useEffect(() => {
    if (status !== 'checking') return undefined
    const timer = setTimeout(() => {
      setStatus((current) => (current === 'checking' ? 'warming' : current))
    }, WARMING_AFTER_MS)
    return () => clearTimeout(timer)
  }, [status])

  // Manual edits are saved to history shortly after the typing stops.
  useEffect(() => {
    if (!kit || kit.isSample) return undefined
    const timer = setTimeout(() => {
      setHistory((prev) => {
        const index = prev.findIndex((item) => item.id === kit.id)
        if (index === -1 || prev[index] === kit) return prev
        const next = [...prev]
        next[index] = kit
        return next
      })
    }, HISTORY_SYNC_MS)
    return () => clearTimeout(timer)
  }, [kit])

  // Manual retry from the header, after a failed probe.
  const retryProbe = useCallback(() => {
    setStatus('checking')
    checkHealth().then(({ ok }) => setStatus(ok ? 'online' : 'offline'))
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

  const remember = useCallback((entry) => {
    setKit(entry)
    // Sample kits are our words, not the user's work — they do not belong in a
    // list of "your recent kits".
    if (entry.isSample) return
    setHistory((prev) => [entry, ...prev.filter((item) => item.rawJd !== entry.rawJd)].slice(0, HISTORY_MAX))
  }, [])

  const handleStage = useCallback((event) => {
    if (event.type === 'retry') {
      // A 429 restarts the pipeline from the top, so the progress list restarts
      // with it. Saying so beats watching rows tick backwards unexplained.
      setRetrying(true)
      setStageStates({})
      return
    }
    setStageStates((prev) => ({ ...prev, [event.id]: event.state }))
  }, [])

  const handleRun = useCallback(
    async (rawJd) => {
      setError(null)
      setRetrying(false)
      setStageStates({})
      setLoading(true)

      try {
        let data
        try {
          data = await streamKit(rawJd, { onStage: handleStage })
        } catch (err) {
          if (err?.name === 'AbortError') throw err
          // Hosts that will not stream are not worth an error message — the
          // same request made plainly works.
          if (!err?.retryWithPlain) throw err
          data = await requestKit(rawJd)
        }

        remember({ id: newId(), result: data, rawJd, isSample: false, at: stampNow() })
        scrollToWorkspace()
      } catch (err) {
        if (err?.name === 'AbortError') return
        setError(err?.message || 'Something went wrong while building the kit.')
      } finally {
        setLoading(false)
      }
    },
    [handleStage, remember, scrollToWorkspace],
  )

  const handleLoadSample = useCallback(() => {
    setError(null)
    remember({
      id: newId(),
      result: cloneSampleResult(),
      rawJd: SAMPLE_JD,
      isSample: true,
      at: stampNow(),
    })
    scrollToWorkspace()
  }, [remember, scrollToWorkspace])

  const handleRegenerate = useCallback(
    async (asset) => {
      if (!kit) return
      setError(null)
      setRegenerating(asset)

      try {
        const patch = await regenerateAsset({
          asset,
          rawJd: kit.rawJd,
          cleanJd: kit.result.clean_jd,
          booleans: kit.result.booleans,
        })

        // Only merge the assets that actually came back. The response model
        // declares every asset as optional, and merging a null would delete a
        // section the user is still looking at.
        const slice = {}
        for (const [key, value] of Object.entries(patch)) {
          if (key === 'asset' || value === null || value === undefined) continue
          slice[key] = value
        }

        setKit((current) =>
          current ? { ...current, result: { ...current.result, ...slice }, at: stampNow() } : current,
        )
      } catch (err) {
        if (err?.name === 'AbortError') return
        setError(err?.message || 'Could not regenerate that part of the kit.')
      } finally {
        setRegenerating(null)
      }
    },
    [kit],
  )

  const handleEditOutreach = useCallback((key, value) => {
    setKit((current) => {
      if (!current) return current
      return {
        ...current,
        result: {
          ...current.result,
          outreach: { ...current.result.outreach, [key]: value },
        },
      }
    })
  }, [])

  const handleRestore = useCallback(
    (entry) => {
      setError(null)
      setKit(entry)
      scrollToWorkspace()
    },
    [scrollToWorkspace],
  )

  const handleForgetHistory = useCallback(() => setHistory([]), [])

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
      <Header status={status} onRetry={retryProbe} />

      <main className="workspace">
        <p className="sr-only" role="status">
          {result ? 'Recruiting kit ready — five sections' : ''}
        </p>

        <section className="page-head" aria-labelledby="page-title">
          <h1 id="page-title" className="page-title">
            Turn one job description into a complete recruiting kit.
          </h1>
          <p className="page-sub">
            Five assets, one run — edit anything before you send it.
          </p>
        </section>

        <InputPanel
          onRun={handleRun}
          onLoadSample={handleLoadSample}
          loading={loading}
          ready={ready}
        />

        <RecentKits
          items={history}
          activeId={kit?.id}
          onRestore={handleRestore}
          onClear={handleForgetHistory}
        />

        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {loading && <LoadingState stageStates={stageStates} retrying={retrying} />}

        {!loading && !result && <EmptyState />}

        {!loading && result && (
          <div className="kit" id="workspace">
            {kit.isSample && (
              <div className="callout callout-sample kit-notice">
                <span className="callout-swatch" aria-hidden="true" />
                <p>
                  <span className="callout-tag">Example kit</span> — a prepared sample showing all
                  five assets. Paste your own job description above and press{' '}
                  <strong>Build kit</strong> to generate a real one.
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
                <button type="button" className="btn btn-quiet btn-sm" onClick={handleStartOver}>
                  Start over
                </button>
              </div>
            </div>

            <div className="kit-grid">
              <WorkspaceNav activeId={activeId} />

              <div className="doc">
                <SourceJd rawJd={kit.rawJd} />

                <RoleBrief
                  id={ROLE_BRIEF.id}
                  num={ROLE_BRIEF.num}
                  cleanJd={result.clean_jd}
                  onRegenerate={handleRegenerate}
                  busy={regenerating === ROLE_BRIEF.id}
                />

                <SearchStrings
                  id={SEARCH_STRINGS.id}
                  num={SEARCH_STRINGS.num}
                  booleans={result.booleans}
                  onRegenerate={handleRegenerate}
                  busy={regenerating === SEARCH_STRINGS.id}
                />

                <OutreachSection
                  id={OUTREACH.id}
                  num={OUTREACH.num}
                  outreach={result.outreach}
                  onRegenerate={handleRegenerate}
                  onEdit={handleEditOutreach}
                  busy={regenerating === OUTREACH.id}
                />

                <LinkedInPost
                  id={LINKEDIN.id}
                  num={LINKEDIN.num}
                  content={result.linkedin_post}
                  onRegenerate={handleRegenerate}
                  busy={regenerating === LINKEDIN.id}
                />

                <RecruiterPrep
                  id={PREP.id}
                  num={PREP.num}
                  brief={result.recruiter_brief}
                  onRegenerate={handleRegenerate}
                  busy={regenerating === PREP.id}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p className="footer-value">
          One raw job description in, five ready-to-send assets out — about 45 minutes of
          recruiting admin saved per req.
        </p>
        <nav className="footer-links" aria-label="Project links">
          <button type="button" className="link-btn" onClick={() => setAboutOpen(true)}>
            About
          </button>
          <a
            href="https://github.com/avisihvam-eng/ai-recruiter-copilot"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </footer>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}
