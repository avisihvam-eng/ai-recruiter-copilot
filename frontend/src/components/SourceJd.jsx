import CopyButton from './CopyButton'
import { SOURCE_ID } from '../lib/sections'

/**
 * SourceJd — the untouched original JD, collapsed by default.
 *
 * Uses native <details>/<summary> so it is keyboard accessible for free. It is
 * collapsed because the user already knows what they pasted; it is here to
 * compare against, not to read again.
 *
 * It carries no index number on purpose: an "SRC" label in the same monospace
 * style as "01"–"05" read as a sixth asset, when it is actually the input. A
 * grey panel labelled in words says "this is what you gave me".
 */
export default function SourceJd({ rawJd }) {
  if (!rawJd) return null

  return (
    <details id={SOURCE_ID} className="source scroll-margin">
      <summary className="source-summary">
        <span className="source-text">
          <span className="source-title">Your pasted job description</span>
          <span className="source-hint">Unchanged — click to compare it with the brief below</span>
        </span>
        <span className="source-chevron" aria-hidden="true" />
      </summary>

      <div className="source-body">
        <pre className="source-pre">{rawJd}</pre>
        <div className="source-actions">
          <CopyButton text={rawJd} />
        </div>
      </div>
    </details>
  )
}
