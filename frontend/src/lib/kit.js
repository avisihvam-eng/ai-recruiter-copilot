/**
 * kit.js — turns a pipeline result into a portable document.
 *
 * Used by the "Copy entire kit" and "Download .md" actions so a recruiter can
 * move everything into Notion, Slack, an ATS note, or a doc in one move.
 */

const bullets = (items = []) => items.map((i) => `- ${i}`).join('\n')

const numbered = (items = []) => items.map((i, n) => `${n + 1}. ${i}`).join('\n')

/**
 * @param {object} result  the GenerateResponse payload
 * @returns {string} Markdown for the whole kit
 */
export function buildMarkdownKit(result) {
  if (!result) return ''

  const jd = result.clean_jd || {}
  const booleans = result.booleans || {}
  const outreach = result.outreach || {}
  const brief = result.recruiter_brief || {}

  const out = []

  if (jd.title) out.push(`# ${jd.title}`)

  const meta = [
    jd.location && `**Location:** ${jd.location}`,
    jd.experience && `**Experience:** ${jd.experience}`,
  ]
    .filter(Boolean)
    .join('  ·  ')
  if (meta) out.push(meta)

  const intro = jd.objective || jd.summary
  if (intro) out.push(`## Objective\n\n${intro}`)

  const duties = jd.responsibilities?.length ? jd.responsibilities : jd.duties || []
  if (duties.length) out.push(`## Job duties\n\n${bullets(duties)}`)
  if (jd.required_skills?.length) out.push(`## Required skills\n\n${bullets(jd.required_skills)}`)
  if (jd.preferred_skills?.length) out.push(`## Preferred skills\n\n${bullets(jd.preferred_skills)}`)

  const variants = [
    ['Strict', booleans.strict],
    ['Balanced', booleans.balanced],
    ['Broad', booleans.broad],
  ].filter(([, value]) => value)

  if (variants.length) {
    out.push(
      `## Search strings\n\n${variants
        .map(([label, value]) => `**${label}**\n\n\`\`\`\n${value}\n\`\`\``)
        .join('\n\n')}`,
    )
  }

  const messages = [
    ['Short message', outreach.short],
    ['Detailed message', outreach.detailed],
  ].filter(([, value]) => value)

  if (messages.length) {
    out.push(`## Candidate outreach\n\n${messages.map(([label, value]) => `### ${label}\n\n${value}`).join('\n\n')}`)
  }

  if (result.linkedin_post) out.push(`## LinkedIn post\n\n${result.linkedin_post}`)

  const prepParts = []
  if (brief.ideal_candidate) prepParts.push(`**Strongest-fit profile**\n\n${brief.ideal_candidate}`)
  if (brief.screening_questions?.length) {
    prepParts.push(`**Screening questions**\n\n${numbered(brief.screening_questions)}`)
  }
  if (brief.watchouts?.length) prepParts.push(`**Clarify before you search**\n\n${bullets(brief.watchouts)}`)
  if (prepParts.length) out.push(`## Recruiter prep\n\n${prepParts.join('\n\n')}`)

  return `${out.join('\n\n')}\n`
}

