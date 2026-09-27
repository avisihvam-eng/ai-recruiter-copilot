import { useState, useCallback, useRef, useEffect } from 'react'
import CopyButton from './CopyButton'

const API_BASE = 'http://localhost:8000/api'

/**
 * InputPanel — JD textarea + API key + Generate button.
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
        const err = await res.json()
        throw new Error(err.detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      onResult(data)
    } catch (err) {
      onError(err.message)
    } finally {
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

  return (
    <div className="glass-card p-5 mb-6">
      {/* JD Textarea */}
      <textarea
        ref={textareaRef}
        value={jd}
        onChange={handleJdChange}
        placeholder="Paste your raw job description here…

Include: job title, responsibilities, required skills, certifications, tools, experience, location.

Press Ctrl+Enter or click Generate."
        className="w-full min-h-[180px] max-h-[420px] resize-none bg-transparent text-sm
                   text-text placeholder:text-muted/50 focus:outline-none leading-relaxed
                   font-sans"
        spellCheck={false}
      />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-muted">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">Ctrl</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">Enter</kbd>
          <span className="ml-1">to generate</span>
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
            Generate →
          </button>
        </div>
      </div>
    </div>
  )
}
