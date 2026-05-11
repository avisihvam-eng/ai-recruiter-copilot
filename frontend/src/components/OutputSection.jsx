import CopyButton from './CopyButton'

/**
 * OutputSection — generic collapsible section card.
 * Used for Outreach Short, Outreach Detailed, LinkedIn Post.
 */
export default function OutputSection({ title, icon, content, mono = false }) {
  if (!content) return null
  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-accent text-base">{icon}</span>}
          <h3 className="text-sm font-semibold text-text">{title}</h3>
        </div>
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
