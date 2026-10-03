import { useState, useCallback } from 'react'

/**
 * CopyButton — universal copy-to-clipboard button.
 *
 * When `html` is provided, the clipboard receives BOTH text/html and text/plain.
 * Outlook (and Word/Gmail) pick the HTML version, so bullets paste as real
 * native bullet lists and paragraphs keep their spacing — no reformatting.
 */
export default function CopyButton({ text, html, className = '' }) {
  const [copied, setCopied] = useState(false)

  const flash = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopy = useCallback(async () => {
    if (!text) return
    try {
      if (html && window.ClipboardItem && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ])
      } else {
        await navigator.clipboard.writeText(text)
      }
      flash()
    } catch {
      // Fallback: copy rendered HTML via a hidden contenteditable (keeps formatting)
      const el = document.createElement('div')
      el.contentEditable = 'true'
      el.style.position = 'fixed'
      el.style.left = '-9999px'
      if (html) el.innerHTML = html
      else el.innerText = text
      document.body.appendChild(el)
      const range = document.createRange()
      range.selectNodeContents(el)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
      document.execCommand('copy')
      sel.removeAllRanges()
      document.body.removeChild(el)
      flash()
    }
  }, [text, html])

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${copied ? 'copied' : ''} ${className}`}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
