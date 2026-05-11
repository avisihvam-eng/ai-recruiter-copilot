import { useState, useCallback } from 'react'

/**
 * CopyButton — universal copy-to-clipboard button.
 * Shows green "✓ Copied" for 2s then resets.
 */
export default function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${copied ? 'copied' : ''} ${className}`}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
