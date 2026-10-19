import SectionCard from './SectionCard'
import CopyButton from './CopyButton'
import RegenerateButton from './RegenerateButton'
import { toOutlookHtml } from '../lib/outlook'

/**
 * LinkedInPost — the generated post, previewed as it will actually appear.
 *
 * The post is mostly line breaks and emoji bullets, and those are exactly what
 * gets lost when text is pasted somewhere that collapses whitespace. Showing it
 * in a card that preserves the line breaks — and copying with the same
 * guarantee — means what the recruiter sees here is what their audience sees.
 */
export default function LinkedInPost({ id, num, content, onRegenerate, busy }) {
  if (!content) return null

  return (
    <SectionCard
      id={id}
      num={num}
      title="LinkedIn post"
      busy={busy}
      actions={
        <>
          <CopyButton text={content} html={toOutlookHtml(content)} label="Copy post" />
          <RegenerateButton asset={id} onRegenerate={onRegenerate} busy={busy} />
        </>
      }
    >
      <div className="li-card">
        <div className="li-head">
          <span className="li-avatar" aria-hidden="true">
            Y
          </span>
          <div className="li-identity">
            <span className="li-name">Your name</span>
            <span className="li-meta">Recruiter &middot; just now</span>
          </div>
        </div>

        {/* pre-wrap is the whole point: the post is line breaks and bullets. */}
        <p className="li-body">{content}</p>

        <div className="li-foot" aria-hidden="true">
          <span>Like</span>
          <span>Comment</span>
          <span>Repost</span>
        </div>
      </div>

      <p className="doc-note">
        The preview keeps the line breaks the post was written with, and so does the copy button —
        paste it straight into LinkedIn without fixing the spacing by hand.
      </p>
    </SectionCard>
  )
}
