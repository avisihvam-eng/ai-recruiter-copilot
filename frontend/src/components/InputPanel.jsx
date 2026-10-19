import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { COLD_START_HINT, ingestFile } from '../lib/api'
import { describeJdProblem } from '../lib/validateJd'

const STORAGE_KEY = 'recruiter-copilot:last-jd'
const MAX_EDITOR_HEIGHT = 420

// Showing ⌘ on Windows makes non-technical users think the shortcut is Mac-only.
const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || '')

const DETAIL_FIELDS = [
  { key: 'seniority', label: 'Seniority', placeholder: 'Senior, 6+ years' },
  { key: 'location', label: 'Location', placeholder: 'Austin, TX (hybrid)' },
  { key: 'mustHaves', label: 'Must-haves', placeholder: 'Python, SQL, Airflow' },
  { key: 'salary', label: 'Salary band', placeholder: '$150k–$180k' },
]

const EMPTY_DETAILS = { seniority: '', location: '', mustHaves: '', salary: '' }

/**
 * InputPanel — the JD editor / composer.
 *
 * Two ways in, both one step: paste the text, or drop in the PDF/Word file the
 * hiring manager sent. Anything more (a link importer, a URL field, an "or"
 * separator) is another decision before the user has seen any value.
 *
 *  - Cmd/Ctrl+Enter runs the kit. Plain Enter inserts a newline, which is what
 *    people expect when pasting or editing a multi-line JD.
 *  - A live counter explains *why* the button is disabled.
 *  - Build is paused until the backend answers, because firing a request into a
 *    sleeping server is the failure that looks most like a broken app.
 *  - "See an example kit" is a first-class action, not a footnote: most visitors
 *    arrive without a JD in hand, and the example needs no server at all.
 */
export default function InputPanel({ onRun, onLoadSample, loading, ready }) {
  const [jd, setJd] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || ''
    } catch {
      return ''
    }
  })
  const [override, setOverride] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importNote, setImportNote] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [details, setDetails] = useState(EMPTY_DETAILS)
  const textareaRef = useRef(null)

  const problem = useMemo(() => describeJdProblem(jd), [jd])

  // Persist drafts so a refresh never loses a pasted JD.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, jd)
    } catch {
      /* storage full or blocked — drafts are a convenience, not a requirement */
    }
  }, [jd])

  // Auto-grow the editor.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_EDITOR_HEIGHT)}px`
  }, [jd])

  const blocked = !problem.ok && !override
  const canRun = ready && !loading && !blocked

  /**
   * The text the pipeline actually receives.
   *
   * The optional fields are appended rather than merged into the JD body: the
   * user's own wording is the thing the assets are built around, and it should
   * stay recognisably theirs at the top of the request.
   */
  const composed = useMemo(() => {
    const extras = DETAIL_FIELDS.map(({ key, label }) => {
      const value = details[key].trim()
      return value ? `${label}: ${value}` : null
    }).filter(Boolean)

    const body = jd.trim()
    if (!extras.length) return body
    return `${body}\n\nAdditional context from the recruiter:\n${extras.join('\n')}`
  }, [jd, details])

  const counter = useMemo(() => {
    const count = jd.trim().length
    switch (problem.code) {
      case 'empty':
        return { text: 'Paste a job description to begin', tone: 'idle' }
      case 'short':
        return { text: `${count} characters · ${problem.remaining} more to go`, tone: 'short' }
      case 'not-a-jd':
        return {
          text: 'This does not read like a job description — no responsibilities, requirements or skills found.',
          tone: 'warn',
        }
      default:
        return { text: `${count} characters · looks good`, tone: 'ready' }
    }
  }, [problem, jd])

  const handleRun = useCallback(() => {
    if (!canRun) return
    onRun(composed)
  }, [canRun, composed, onRun])

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleRun()
    }
  }

  const handleClear = () => {
    setJd('')
    setOverride(false)
    setImportNote(null)
    textareaRef.current?.focus()
  }

  const handleChange = (event) => {
    setJd(event.target.value)
    // "Build it anyway" is a decision about *this* text, not a sticky
    // preference — so editing puts the question again.
    if (override) setOverride(false)
    setImportNote(null)
  }

  const setDetail = (key, value) => setDetails((prev) => ({ ...prev, [key]: value }))

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    // Reset first, so choosing the same file twice still fires a change event.
    event.target.value = ''
    if (!file || importing) return

    // Replacing typed work without asking would be the rudest thing here.
    if (jd.trim() && !window.confirm('Replace the job description currently in the box?')) return

    setImporting(true)
    setImportNote(null)
    try {
      const result = await ingestFile(file)
      if (!result?.text) {
        setImportNote({ text: `Nothing readable came back from ${file.name}. Paste the text instead.`, tone: 'warn' })
      } else {
        setJd(result.text)
        setOverride(false)
        setImportNote({
          tone: result.warning ? 'warn' : 'ok',
          text: result.warning
            ? `Imported from ${file.name}. ${result.warning}`
            : `Imported ${result.chars.toLocaleString()} characters from ${file.name}. Check it reads right, then build.`,
        })
      }
    } catch (err) {
      setImportNote({ text: err?.message || 'Could not read that file.', tone: 'warn' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <div className="composer">
        <div className="composer-head">
          <label className="composer-label" htmlFor="jd-input">
            Job description
          </label>

          <label className="composer-upload">
            {importing ? 'Reading…' : 'Upload PDF or Word'}
            <input
              type="file"
              className="sr-only"
              accept=".pdf,.docx,.txt,.md"
              disabled={importing || loading}
              onChange={handleFile}
            />
          </label>
        </div>

        <textarea
          id="jd-input"
          ref={textareaRef}
          value={jd}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-describedby="jd-counter jd-readiness"
          placeholder={
            'Paste the raw job description here — messy formatting is fine.\n\n' +
            'We keep your wording untouched and build the recruiter assets around it.'
          }
          className="jd-editor"
          spellCheck={false}
        />

        {importNote ? (
          <p className={`import-note is-${importNote.tone}`} role="status">
            {importNote.text}
          </p>
        ) : null}

        <div className="composer-footer">
          <span
            id="jd-counter"
            className={`char-counter tone-${counter.tone}`}
            aria-live="polite"
          >
            {counter.text}
          </span>

          <div className="composer-actions">
            {jd ? (
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            ) : null}

            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={onLoadSample}
              disabled={loading}
            >
              See an example kit
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRun}
              disabled={!canRun}
              aria-describedby="jd-readiness"
            >
              {loading ? 'Building…' : 'Build kit'}
            </button>
          </div>
        </div>

        {problem.code === 'not-a-jd' && !override ? (
          <p className="composer-warn">
            Check you pasted the posting itself, not a message about it.{' '}
            <button type="button" className="link-btn" onClick={() => setOverride(true)}>
              Build it anyway
            </button>
          </p>
        ) : null}

        <button
          type="button"
          className="link-btn composer-toggle"
          aria-expanded={showDetails}
          aria-controls="jd-details"
          onClick={() => setShowDetails((open) => !open)}
        >
          {showDetails ? 'Hide extra details' : 'Add details the posting leaves out'}
        </button>

        {showDetails ? (
          <div className="composer-details" id="jd-details">
            {DETAIL_FIELDS.map(({ key, label, placeholder }) => (
              <label key={key} className="field">
                <span className="field-label">{label}</span>
                <input
                  type="text"
                  className="field-input"
                  placeholder={placeholder}
                  value={details[key]}
                  onChange={(event) => setDetail(key, event.target.value)}
                />
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <p className="composer-hint" id="jd-readiness">
        {ready ? (
          <>
            Run with <kbd>{IS_MAC ? '⌘' : 'Ctrl'}</kbd> + <kbd>Enter</kbd>
          </>
        ) : (
          <>
            Waking up the server — {COLD_START_HINT}. Build kit unlocks on its own; the example
            kit works right now.
          </>
        )}
      </p>
    </>
  )
}
