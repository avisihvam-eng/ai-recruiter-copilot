import CopyButton from './CopyButton'

/**
 * CleanJDSection — Renders the structured clean JD output from Agent 1.
 *
 * The `fullText` exported for copy is formatted to paste cleanly into Outlook:
 * - Proper • bullets on their own lines (no comma-joined lists)
 * - Section headers in ALL CAPS (Outlook convention)
 * - Blank lines between sections for visual breathing room
 */
export default function CleanJDSection({ cleanJd }) {
  if (!cleanJd || !cleanJd.title) return null

  const {
    title,
    location,
    experience,
    objective,
    summary,
    responsibilities = [],
    duties = [],
    required_skills = [],
    preferred_skills = [],
    certifications = [],
    tools = [],
  } = cleanJd

  // Normalise — the agent may return either key
  const respItems = responsibilities.length ? responsibilities : duties
  const objectiveText = objective || summary || ''

  // ── Outlook-ready plain-text (for the Copy button) ──────────────────────────
  // Each section uses proper bullet lines so pasting into Outlook needs zero
  // reformatting. Skills are one per line, NOT comma-joined.
  const buildSection = (heading, items) => {
    if (!items || items.length === 0) return ''
    return `${heading}\n${items.map((i) => `\u2022 ${i}`).join('\n')}`
  }

  const parts = [
    title,
    [location && `Location: ${location}`, experience && `Experience: ${experience}`]
      .filter(Boolean)
      .join('  |  '),
    objectiveText && `\n${objectiveText}`,
    respItems.length && `\nRESPONSIBILITIES\n${respItems.map((d) => `\u2022 ${d}`).join('\n')}`,
    required_skills.length && `\nREQUIRED SKILLS\n${required_skills.map((s) => `\u2022 ${s}`).join('\n')}`,
    preferred_skills.length && `\nPREFERRED SKILLS\n${preferred_skills.map((s) => `\u2022 ${s}`).join('\n')}`,
    certifications.length && buildSection('\nCERTIFICATIONS', certifications),
    tools.length && buildSection('\nTOOLS', tools),
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent text-base">📋</span>
          <h3 className="text-sm font-semibold text-text">Clean JD</h3>
          <span className="text-xs text-muted/60 ml-1">· Outlook-ready</span>
        </div>
        <CopyButton text={parts} />
      </div>

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-text">{title}</h2>
        <div className="flex gap-3 mt-1 flex-wrap">
          {location && (
            <span className="text-xs text-muted flex items-center gap-1">
              📍 {location}
            </span>
          )}
          {experience && (
            <span className="text-xs text-muted flex items-center gap-1">
              🕐 {experience}
            </span>
          )}
        </div>
        {objectiveText && (
          <p className="text-sm text-text-dim mt-2 leading-relaxed">{objectiveText}</p>
        )}
      </div>

      {/* Responsibilities */}
      {respItems.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Responsibilities
          </h4>
          <ul className="space-y-1">
            {respItems.map((d, i) => (
              <li key={i} className="text-sm text-text-dim flex gap-2">
                <span className="text-accent mt-0.5 flex-shrink-0">›</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Skills */}
      {required_skills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Required Skills
          </h4>
          <ul className="space-y-1">
            {required_skills.map((s, i) => (
              <li key={i} className="text-sm text-text-dim flex gap-2">
                <span className="text-accent mt-0.5 flex-shrink-0">›</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preferred Skills */}
      {preferred_skills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Preferred Skills
          </h4>
          <ul className="space-y-1">
            {preferred_skills.map((s, i) => (
              <li key={i} className="text-sm text-text-dim flex gap-2">
                <span className="text-muted/60 mt-0.5 flex-shrink-0">›</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Certs + Tools row */}
      <div className="flex flex-wrap gap-4">
        {certifications.length > 0 && (
          <div className="flex-1 min-w-32">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Certifications
            </h4>
            <ul className="space-y-1">
              {certifications.map((c, i) => (
                <li key={i} className="text-sm text-text-dim flex gap-2">
                  <span className="text-amber-400/80 mt-0.5 flex-shrink-0">›</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tools.length > 0 && (
          <div className="flex-1 min-w-32">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Tools
            </h4>
            <ul className="space-y-1">
              {tools.map((t, i) => (
                <li key={i} className="text-sm text-text-dim flex gap-2">
                  <span className="text-muted/60 mt-0.5 flex-shrink-0">›</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
