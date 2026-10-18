import SectionCard from './SectionCard'
import CopyButton from './CopyButton'
import { briefFields, roleBriefToOutlookHtml } from '../lib/outlook'

/**
 * RoleBrief — renders the formatted job description (Agent 1).
 *
 * The backend normalises the legacy "duties"/"summary" keys to
 * "responsibilities"/"objective", but we still accept both so an older cached
 * payload can never render blank.
 *
 * The header is a labelled field list ("Job title – …", "Location – …") rather
 * than a display heading, because this text is pasted straight into Outlook,
 * where a labelled line reads as a field and an oversized bare title reads as
 * decoration. The labels come from outlook.js so the visible text, the plain
 * copy and the Outlook HTML are generated from one list.
 */
export default function RoleBrief({ id, num, cleanJd }) {
  if (!cleanJd?.title) return null

  const {
    title,
    location,
    objective,
    summary,
    responsibilities = [],
    duties = [],
    required_skills = [],
    preferred_skills = [],
  } = cleanJd

  const jobDuties = (responsibilities.length ? responsibilities : duties).filter(Boolean)
  const intro = objective || summary || ''

  const fields = briefFields({ title, location })

  const sections = [
    { heading: 'Job duties', items: jobDuties },
    { heading: 'Required skills', items: required_skills.filter(Boolean) },
    { heading: 'Preferred skills', items: preferred_skills.filter(Boolean) },
  ].filter((s) => s.items.length > 0)

  const plainText = [
    ...fields.map((f) => `${f.label} \u2013 ${f.value}`),
    intro && `\n${intro}`,
    ...sections.map((s) => `\n${s.heading}\n${s.items.map((i) => `\u2022 ${i}`).join('\n')}`),
  ]
    .filter(Boolean)
    .join('\n')

  const html = roleBriefToOutlookHtml({ title, location, intro, sections })

  return (
    <SectionCard
      id={id}
      num={num}
      title="Formatted job description"
      subtitle="A ready-to-send version of your posting. Your original wording is never rewritten."
      actions={<CopyButton text={plainText} html={html} />}
    >
      {fields.length > 0 && (
        <div className="brief-fields">
          {fields.map((field) => (
            <p key={field.label} className="brief-field">
              <span className="brief-field-label">{field.label}</span>
              {' \u2013 '}
              {field.value}
            </p>
          ))}
        </div>
      )}

      {intro && <p className="brief-intro">{intro}</p>}

      {sections.map((section) => (
        <div key={section.heading} className="brief-group">
          {/* h3, not h4: the job title is no longer a heading, so the group
              labels are the next level down from the section's own h2. */}
          <h3 className="brief-label">{section.heading}</h3>
          <ul className="brief-list">
            {section.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </SectionCard>
  )
}
