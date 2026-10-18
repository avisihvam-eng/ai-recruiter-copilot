import SectionCard from './SectionCard'
import CopyButton from './CopyButton'

/**
 * RecruiterPrep — renders Agent 4's output.
 *
 * This component is the fix for the biggest bug in the previous build: the
 * backend has always returned `recruiter_brief`, but the React UI never read
 * it, so the entire fourth agent was invisible to users.
 */
export default function RecruiterPrep({ id, num, brief }) {
  if (!brief) return null

  const lead = brief.ideal_candidate || ''
  const questions = Array.isArray(brief.screening_questions) ? brief.screening_questions : []
  const watchouts = Array.isArray(brief.watchouts) ? brief.watchouts : []

  if (!lead && !questions.length && !watchouts.length) return null

  const plainText = [
    'STRONGEST-FIT PROFILE',
    lead,
    '',
    'HIGH-SIGNAL SCREENING QUESTIONS',
    ...questions.map((q, i) => `${i + 1}. ${q}`),
    '',
    'CLARIFY BEFORE YOU SEARCH',
    ...watchouts.map((w) => `\u2022 ${w}`),
  ]
    .join('\n')
    .trim()

  return (
    <SectionCard
      id={id}
      num={num}
      title="Recruiter prep"
      subtitle="Use this on the intake call, before you open the search"
      actions={<CopyButton text={plainText} />}
    >
      {lead && (
        <div className="prep-group">
          <h3 className="prep-label">Strongest-fit profile</h3>
          <p className="prep-lead">{lead}</p>
        </div>
      )}

      <div className="prep-grid">
        {questions.length > 0 && (
          <div className="prep-group">
            <h3 className="prep-label">High-signal screening questions</h3>
            <ol className="prep-list">
              {questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </div>
        )}

        {watchouts.length > 0 && (
          <div className="prep-group">
            <h3 className="prep-label">Clarify before you search</h3>
            <ul className="prep-list is-plain">
              {watchouts.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
