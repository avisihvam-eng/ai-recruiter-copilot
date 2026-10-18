import { useCallback, useEffect, useRef, useState } from 'react'

import { IconCheck, IconCopy } from './Icons'
import { toCrlf } from '../lib/outlook'

/** Minimal escape for the execCommand fallback's plain-text path. */
const asHtmlFragment = (s = '') =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]).replace(/\n/g, '<br>')

/**
 * CopyButton — universal copy-to-clipboard control.
 *
 * When `html` is provided the clipboard receives BOTH text/html and text/plain.
 * Word, Outlook and Gmail prefer the HTML flavour, so bullets paste as real
 * native lists and paragraph spacing survives — no reformatting required.
 *
 * The plain flavour is CRLF-normalised. Chromium already rewrites lone LF for
 * CF_UNICODETEXT on Windows and only touches lone LF, so this is safe and it
 * fixes Firefox, Safari and native non-Word targets.
 */
export default function CopyButton({
  text,
  html,
  label = 'Copy',
  copiedLabel = 'Copied',
  className = '',
  disabled = false,
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleCopy = useCallback(async () => {
    if (!text) return

    const plain = toCrlf(text)

    try {
      // The ClipboardItem must be constructed synchronously inside the user
      // gesture — Safari rejects it otherwise — so it stays before the await.
      if (html && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plain], { type: 'text/plain' }),
          }),
        ])
      } else {
        await navigator.clipboard.writeText(plain)
      }
    } catch {
      // Safari/Firefox fallback: copy a real selection from a rendered node, so
      // the HTML flavour — and therefore the Outlook formatting — survives.
      // It must be rendered (not display:none) for execCommand to see it.
      const holder = document.createElement('div')
      holder.setAttribute('aria-hidden', 'true')
      holder.contentEditable = 'true'
      holder.style.position = 'fixed'
      holder.style.top = '0'
      holder.style.left = '-9999px'
      holder.innerHTML = html || asHtmlFragment(plain)
      document.body.appendChild(holder)

      holder.focus()
      const range = document.createRange()
      range.selectNodeContents(holder)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.execCommand('copy')
      selection.removeAllRanges()
      holder.remove()
    }

    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }, [text, html])

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        disabled={disabled || !text}
        className={`copy-btn ${copied ? 'copied' : ''} ${className}`.trim()}
      >
        {copied ? <IconCheck /> : <IconCopy />}
        <span>{copied ? copiedLabel : label}</span>
      </button>
      {/* Announce the state change for screen readers without moving focus. */}
      <span className="sr-only" role="status">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  )
}
