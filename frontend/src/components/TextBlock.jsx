import SectionCard from './SectionCard'
import CopyButton from './CopyButton'
import { toOutlookHtml } from '../lib/outlook'

/**
 * TextBlock — a section that is a single body of generated text.
 * Used for the LinkedIn post.
 */
export default function TextBlock({ id, num, title, subtitle, content, note }) {
  if (!content) return null

  return (
    <SectionCard
      id={id}
      num={num}
      title={title}
      subtitle={subtitle}
      actions={<CopyButton text={content} html={toOutlookHtml(content)} />}
    >
      {note && <p className="doc-note doc-note-top">{note}</p>}
      <p className="text-body">{content}</p>
    </SectionCard>
  )
}
