import { SECTIONS } from '../lib/sections'

/**
 * EmptyState — tells the visitor what they are about to get.
 *
 * The sample affordance is deliberately not repeated here. It now sits beside
 * Build, where the visitor is already looking, and two controls that both said
 * "sample" while doing different things was the most confusing thing on the
 * page.
 */
export default function EmptyState() {
  return (
    <div className="empty">
      <p className="empty-lead">Paste a job description above and you&rsquo;ll get five assets:</p>

      <ul className="empty-list">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <span className="empty-num" aria-hidden="true">
              {section.num}
            </span>
            <span className="empty-label">{section.label}</span>
            <span className="empty-blurb">{section.blurb}</span>
          </li>
        ))}
      </ul>

      <p className="empty-foot">
        Nothing to paste yet? <strong>See an example kit</strong> is next to the Build button, and it
        works without a job description.
      </p>
    </div>
  )
}
