import { SECTIONS } from '../lib/sections'

/**
 * EmptyState — tells the user what they are about to get, and gives them a
 * zero-effort way to see a finished kit.
 *
 * Deliberately a plain spec list rather than a feature-card grid: this is a
 * tool's starting state, not a marketing page.
 */
export default function EmptyState({ onLoadSample }) {
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

      <div className="empty-action">
        <button type="button" className="btn btn-quiet btn-sm" onClick={onLoadSample}>
          No job description handy? See a filled-in example
        </button>
      </div>
    </div>
  )
}
