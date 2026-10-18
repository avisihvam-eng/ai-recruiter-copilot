import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const MIN_CHARS = 50
const STORAGE_KEY = 'recruiter-copilot:last-jd'
const MAX_EDITOR_HEIGHT = 420

// Showing ⌘ on Windows makes non-technical users think the shortcut is Mac-only.
const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || '')

/**
 * InputPanel — the JD editor / composer.
 *
 *  - Cmd/Ctrl+Enter runs the kit. Plain Enter inserts a newline, which is what
 *    people expect when pasting or editing a multi-line JD.
 *  - A live character counter explains *why* the button is disabled.
 *
 * The "load a sample JD" affordance deliberately lives only in the empty state,
 * next to the action that actually shows a finished kit. Two controls that both
 * said "sample" but did different things was the most confusing thing on the page.
 */
export default function InputPanel({ onRun, loading }) {
  const [jd, setJd] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || ''
    } catch {
      return ''
    }
  })
  const textareaRef = useRef(null)

  const count = jd.trim().length
  const tooShort = count < MIN_CHARS

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

  const counter = useMemo(() => {
    if (count === 0) return { text: 'Paste a job description to begin', tone: 'idle' }
    if (tooShort) return { text: `${count} characters · ${MIN_CHARS - count} more to go`, tone: 'short' }
    return { text: `${count} characters · looks good`, tone: 'ready' }
  }, [count, tooShort])

  const handleRun = useCallback(() => {
    if (loading || tooShort) return
    onRun(jd.trim())
  }, [jd, loading, tooShort, onRun])

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleRun()
    }
  }

  const handleClear = () => {
    setJd('')
    textareaRef.current?.focus()
  }

  return (
    <>
      <div className="composer">
        <label className="composer-label" htmlFor="jd-input">
          Job description
        </label>

        <textarea
          id="jd-input"
          ref={textareaRef}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby="jd-counter"
          placeholder={
            'Paste the raw job description here — messy formatting is fine.\n\n' +
            'We keep your wording untouched and build the recruiter assets around it.'
          }
          className="jd-editor"
          spellCheck={false}
        />

        <div className="composer-footer">
          <span id="jd-counter" className={`char-counter tone-${counter.tone}`} aria-live="polite">
            {counter.text}
          </span>

          <div className="composer-actions">
            {jd && (
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRun}
              disabled={loading || tooShort}
            >
              {loading ? 'Building…' : 'Build kit'}
            </button>
          </div>
        </div>
      </div>

      <p className="composer-hint">
        Run with <kbd>{IS_MAC ? '⌘' : 'Ctrl'}</kbd> + <kbd>Enter</kbd>
      </p>
    </>
  )
}
