import CopyButton from './CopyButton'

/**
 * OutputSection — generic collapsible section card.
 * Used for Outreach Short, Outreach Detailed, LinkedIn Post.
 */
export default function OutputSection({ title, content, mono = false }) {
  if (!content) return null
  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <CopyButton text={content} />
      </div>
      <p
        className={`text-sm leading-relaxed whitespace-pre-wrap text-text-dim ${
          mono ? 'font-mono' : ''
        }`}
      >
        {content}
      </p>
    </div>
  )
}
