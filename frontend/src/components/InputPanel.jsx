import { useState, useCallback, useRef, useEffect } from 'react'

const API_BASE = 'http://localhost:8000/api'
const TIMEOUT_MS = 120_000 // 2 min — enough for the 4-agent pipeline

/**
 * InputPanel — JD textarea + Build button.
 */
export default function InputPanel({ onResult, onLoading, onError }) {
  const [jd, setJd] = useState('')
  const textareaRef = useRef(null)
  const abortRef = useRef(null)

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
      onError("That JD looks a bit short — paste the full description so the agents have enough to work with.")
      return
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Timeout bomb
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    onLoading(true)
    onError(null)
    onResult(null)

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_jd: trimmedJd }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        let detail = `Server error ${res.status}`
        try { detail = (await res.json()).detail || detail } catch (_) {}
        throw new Error(detail)
      }
      const data = await res.json()
      onResult(data)
    } catch (err) {
      if (err.name === 'AbortError') {
        onError('The pipeline took too long to respond. Try again — the agents are probably just having a moment.')
      } else {
        onError(err.message)
      }
    } finally {
      clearTimeout(timeoutId)
      onLoading(false)
    }
  }, [jd, onResult, onLoading, onError])

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter') handleGenerate()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleGenerate])

  // Cleanup on unmount
  useEffect(() => () => abortRef.current?.abort(), [])

  return (
    <div className="glass-card p-5 mb-6">
      {/* JD Textarea */}
      <textarea
        ref={textareaRef}
        value={jd}
        onChange={handleJdChange}
        placeholder={`Drop in a job description — the messier the better.\n\nThe agents will clean it up, write Boolean strings, draft outreach, and build a LinkedIn post. All Outlook-ready, no reformatting needed.\n\nCtrl + Enter to run.`}
        className="w-full min-h-[180px] max-h-[420px] resize-none bg-transparent text-sm
                   text-text placeholder:text-muted/40 focus:outline-none leading-relaxed
                   font-sans"
        spellCheck={false}
      />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-muted">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">Ctrl</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">Enter</kbd>
          <span className="ml-1">to run</span>
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
