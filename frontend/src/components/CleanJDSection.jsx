import CopyButton from './CopyButton'

/**
 * CleanJDSection — Renders the structured clean JD output from Agent 1.
 *
 * Sections: summary, Job Duties, Required Skills, Preferred Skills.
 * The Copy button produces Outlook-ready HTML (native bullet lists, Calibri 11pt)
 * plus a plain-text fallback with "•" bullets.
 */

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const FONT = "font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#000000;"

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
  } = cleanJd

  // The backend sends "responsibilities" + "objective"; older outputs used "duties" + "summary"
  const jobDuties = (responsibilities.length ? responsibilities : duties).filter(Boolean)
  const intro = objective || summary || ''
  const meta = [location && `Location: ${location}`, experience && `Experience: ${experience}`]
    .filter(Boolean)
    .join('  |  ')

  const sections = [
    { heading: 'Job Duties', items: jobDuties },
    { heading: 'Required Skills', items: required_skills.filter(Boolean) },
    { heading: 'Preferred Skills', items: preferred_skills.filter(Boolean) },
  ].filter((s) => s.items.length > 0)

  // ── Plain-text fallback ────────────────────────────────────────────────────
  const plainText = [
    title,
    meta,
    intro && `\n${intro}`,
    ...sections.map((s) => `\n${s.heading}\n${s.items.map((i) => `\u2022 ${i}`).join('\n')}`),
  ]
    .filter(Boolean)
    .join('\n')

  // ── Outlook-ready HTML ─────────────────────────────────────────────────────
  const html = `
<div style="${FONT}">
  <p style="margin:0 0 4pt 0;${FONT}"><b>${escapeHtml(title)}</b></p>
  ${meta ? `<p style="margin:0 0 8pt 0;${FONT}">${escapeHtml(meta)}</p>` : ''}
  ${intro ? `<p style="margin:0 0 10pt 0;${FONT}">${escapeHtml(intro)}</p>` : ''}
  ${sections
    .map(
      (s) => `
  <p style="margin:10pt 0 2pt 0;${FONT}"><b>${escapeHtml(s.heading)}</b></p>
  <ul style="margin-top:0;margin-bottom:0;">
    ${s.items.map((i) => `<li style="${FONT}">${escapeHtml(i)}</li>`).join('\n    ')}
  </ul>`
    )
    .join('')}
</div>`.trim()

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">Clean JD</h3>
        <CopyButton text={plainText} html={html} />
      </div>

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-text">{title}</h2>
        {meta && <p className="text-xs text-muted mt-1">{meta}</p>}
        {intro && <p className="text-sm text-text-dim mt-2 leading-relaxed">{intro}</p>}
      </div>

      {/* Job Duties / Required / Preferred — plain bullet lists (matches what gets pasted) */}
      {sections.map((s) => (
        <div key={s.heading} className="mb-4 last:mb-0">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            {s.heading}
          </h4>
          <ul className="list-disc pl-5 space-y-1 marker:text-muted">
            {s.items.map((item, i) => (
              <li key={i} className="text-sm text-text-dim leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
