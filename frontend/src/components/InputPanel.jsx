import { useState, useCallback, useRef, useEffect } from 'react'
import CopyButton from './CopyButton'

const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api'

/**
 * InputPanel — JD textarea + Build button.
 */
export default function InputPanel({ onResult, onLoading, onError }) {
  const [jd, setJd] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  const handleJdChange = (e) => {
    setJd(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 420) + 'px'
    }
  }

  const handleGenerate = useCallback(async () => {
    const trimmedJd = jd.trim()
    if (!trimmedJd || trimmedJd.length < 50) {
      onError('Please paste a full job description (at least 50 characters).')
      return
    }

    onLoading(true)
    onError(null)
    onResult(null)

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_jd: trimmedJd }),
      })
      if (!res.ok) {
        let detail = `Server error ${res.status}`
        try {
          const body = await res.json()
          detail = body.detail || detail
        } catch (_) {}

        // Friendly message for Gemini rate limits
        if (res.status === 429 || detail.includes('RESOURCE_EXHAUSTED') || detail.includes('429')) {
          throw new Error('Gemini API rate limit hit — the free tier allows 5 requests per minute. Wait 10 seconds and try again.')
        }
        throw new Error(detail)
      }
      const data = await res.json()
      onResult(data)
    } catch (err) {
      onError(err.message)
    } finally {
      onLoading(false)
    }
  }, [jd, onResult, onLoading, onError])

  // Enter key to submit (when textarea is focused)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="glass-card p-5 mb-6">
      {/* JD Textarea */}
      <textarea
        ref={textareaRef}
        value={jd}
        onChange={handleJdChange}
        onKeyDown={handleKeyDown}
        placeholder={`Paste your job description here…\n\nHit Enter to run.`}
        className="w-full min-h-[180px] max-h-[420px] resize-none bg-transparent text-sm
                   text-text placeholder:text-muted/50 focus:outline-none leading-relaxed
                   font-sans"
        spellCheck={false}
      />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted">
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-xs font-mono">Enter</kbd>
          <span className="ml-1.5">to run</span>
          <span className="mx-1.5 text-border">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-xs font-mono">Shift + Enter</kbd>
          <span className="ml-1.5">new line</span>
        </span>
        <div className="flex items-center gap-3">
          {jd.trim() && (
            <button
              onClick={() => setJd('')}
              className="text-xs text-muted hover:text-text transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={!jd.trim()}
            className="generate-btn"
          >
            Build my recruiter kit →
          </button>
        </div>
      </div>
    </div>
  )
}
