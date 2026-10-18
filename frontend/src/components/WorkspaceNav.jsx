import { SECTIONS } from '../lib/sections'

/**
 * WorkspaceNav — sticky table of contents for the generated kit.
 *
 * Uses plain anchor links so it degrades to normal in-page navigation, and
 * exposes aria-current="location" for the active section. The active item is the
 * only place in the entire interface that spends colour, so it must read as
 * navigation rather than as a heading: tinted pill + accent icon + heavier label.
 */
export default function WorkspaceNav({ activeId, onJump }) {
  return (
    <nav className="kit-nav" aria-label="Recruiter kit sections">
      <p className="kit-nav-label">In this kit</p>
      <ul className="kit-nav-list">
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`kit-nav-link ${isActive ? 'active' : ''}`.trim()}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => onJump?.(section.id)}
              >
                <span className="kit-nav-num" aria-hidden="true">
                  {section.num}
                </span>
                <span className="kit-nav-icon" aria-hidden="true">
                  <section.Icon />
                </span>
                <span className="kit-nav-text">
                  <span className="kit-nav-title">{section.label}</span>
                  <span className="kit-nav-blurb">{section.blurb}</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
