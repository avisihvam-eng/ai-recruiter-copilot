import CopyButton from './CopyButton'

/**
 * CleanJDSection — Renders the structured clean JD output from Agent 1.
 */
export default function CleanJDSection({ cleanJd }) {
  if (!cleanJd || !cleanJd.title) return null

  const {
    title,
    location,
    experience,
    summary,
    duties = [],
    required_skills = [],
    preferred_skills = [],
    certifications = [],
    tools = [],
  } = cleanJd

  const fullText = [
    `${title}`,
    location && `Location: ${location}`,
    experience && `Experience: ${experience}`,
    summary && `\n${summary}`,
    duties.length && `\nResponsibilities:\n${duties.map((d) => `• ${d}`).join('\n')}`,
    required_skills.length && `\nRequired Skills:\n${required_skills.join(', ')}`,
    preferred_skills.length && `\nPreferred Skills:\n${preferred_skills.join(', ')}`,
    certifications.length && `\nCertifications:\n${certifications.join(', ')}`,
    tools.length && `\nTools:\n${tools.join(', ')}`,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent text-base">📋</span>
          <h3 className="text-sm font-semibold text-text">Clean JD</h3>
        </div>
        <CopyButton text={fullText} />
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
        {summary && (
          <p className="text-sm text-text-dim mt-2 leading-relaxed">{summary}</p>
        )}
      </div>

      {/* Duties */}
      {duties.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Responsibilities
          </h4>
          <ul className="space-y-1">
            {duties.map((d, i) => (
              <li key={i} className="text-sm text-text-dim flex gap-2">
                <span className="text-accent mt-0.5 flex-shrink-0">›</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills Grid */}
      {required_skills.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Required Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {required_skills.map((s, i) => (
              <span key={i} className="skill-chip border-accent/30 text-accent/80">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {preferred_skills.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Preferred Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {preferred_skills.map((s, i) => (
              <span key={i} className="skill-chip">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certs + Tools row */}
      <div className="flex flex-wrap gap-4">
        {certifications.length > 0 && (
          <div className="flex-1 min-w-32">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Certifications
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {certifications.map((c, i) => (
                <span
                  key={i}
                  className="skill-chip border-amber-400/30 text-amber-400/80"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {tools.length > 0 && (
          <div className="flex-1 min-w-32">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Tools
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((t, i) => (
                <span key={i} className="skill-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
