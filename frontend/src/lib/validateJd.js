/**
 * Cheap, local sanity checks on pasted job-description text.
 *
 * The point is not to judge quality — it is to catch the obvious mistake (the
 * wrong clipboard entry, a cover letter, a chat message) *before* we spend a
 * Gemini call and 40 seconds of the user's time on it.
 *
 * Deliberately permissive: we only object when the text contains none of the
 * vocabulary that appears in essentially every real posting. A false alarm here
 * blocks a legitimate user, which is far worse than occasionally paying for a
 * call that was never going to work.
 */

export const MIN_CHARS = 50

const JD_SIGNALS = [
  /responsibilit/i,
  /requirement/i,
  /qualification/i,
  /skills?\b/i,
  /experience/i,
  /years?\b/i,
  /duties/i,
  /candidate/i,
  /applicant/i,
  /we(?:'| a)?re (?:looking|hiring|seeking|searching)/i,
  /you(?:'| wi)?ll\b/i,
  /must[- ]have/i,
  /preferred/i,
  /nice to have/i,
  /\brole\b/i,
  /\bposition\b/i,
  /job description/i,
  /\bapply\b/i,
  /\bhire\b/i,
  /\brecruit/i,
  /\bsalary\b/i,
  /\bteam\b/i,
  /\bcompany\b/i,
  /\bopportunit/i,
]

/**
 * @param {string} text
 * @returns {{ ok: boolean, code: 'empty'|'short'|'not-a-jd'|'ok', remaining?: number }}
 */
export function describeJdProblem(text) {
  const value = (text || '').trim()

  if (!value) return { ok: false, code: 'empty' }

  if (value.length < MIN_CHARS) {
    return { ok: false, code: 'short', remaining: MIN_CHARS - value.length }
  }

  const words = value.split(/\s+/).filter(Boolean).length
  const signals = JD_SIGNALS.reduce((count, re) => count + (re.test(value) ? 1 : 0), 0)

  if (signals === 0 && words >= 25) return { ok: false, code: 'not-a-jd' }

  return { ok: true, code: 'ok' }
}
