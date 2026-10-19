/**
 * booleans.js — translate one Boolean string into the dialect each destination
 * actually parses.
 *
 * The five operators are the whole shared vocabulary (AND, OR, NOT, quotes,
 * parentheses), but the destinations differ in ways that quietly break a search
 * rather than erroring:
 *
 *  - Google does not know NOT. It reads it as an ordinary word, so an exclusion
 *    written the LinkedIn way silently *adds* a required term instead of
 *    removing one. Google wants a minus sign.
 *  - Naukri treats unquoted words inconsistently and expects every keyword in
 *    double quotes, including single words.
 *  - LinkedIn Recruiter and Naukri only honour operators typed in capitals;
 *    lowercase "and" is ignored as a stop word.
 *  - The keyword boxes are size-limited (Naukri around 500 characters, LinkedIn
 *    Recruiter somewhere near 1,000), and what happens past the limit is silent
 *    truncation — the worst possible failure, because the results still look
 *    plausible.
 *
 * Everything here is a pure string transform so it can be unit-checked.
 */

export const PLATFORMS = [
  {
    key: 'linkedin',
    label: 'LinkedIn Recruiter',
    short: 'LinkedIn',
    limit: 1000,
    // One line each: enough to explain a transform the user can see in the
    // string, not a paragraph of platform trivia above the fold.
    note: 'Capitals only — LinkedIn ignores lowercase and/or/not.',
  },
  {
    key: 'naukri',
    label: 'Naukri Resdex',
    short: 'Naukri',
    limit: 500,
    note: 'Every keyword is quoted, as Resdex expects. No wildcards.',
  },
  {
    key: 'google',
    label: 'Google X-ray',
    short: 'Google',
    limit: 0,
    note: 'Searches indexed public profiles. NOT becomes a minus sign.',
  },
]

const isOperator = (word) => ['AND', 'OR', 'NOT'].includes(word.toUpperCase())

/**
 * Wrap every unquoted keyword in double quotes, leaving operators, parentheses
 * and existing quoted phrases untouched. Naukri's convention.
 */
export function quoteBareTerms(query) {
  return query
    .split(/("[^"]*")/g)
    .map((part) => {
      if (part.startsWith('"')) return part
      return part.replace(/[A-Za-z0-9][A-Za-z0-9+#./-]*/g, (word) =>
        isOperator(word) ? word.toUpperCase() : `"${word}"`,
      )
    })
    .join('')
}

/**
 * Restate the query for Google: NOT is not an operator there, so every negation
 * becomes a `-` prefix.
 */
export function toGoogleQuery(query) {
  const body = query
    .replace(/\bNOT\s*\(/gi, '-(')
    .replace(/\bNOT\s+/gi, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return `site:linkedin.com/in/ ${body}`
}

/** The string to paste into the destination. */
export function formatForPlatform(query, platform) {
  if (!query) return ''
  if (platform === 'naukri') return quoteBareTerms(query)
  if (platform === 'google') return toGoogleQuery(query)
  return query
}

export function googleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(toGoogleQuery(query))}`
}

/**
 * How the string sits against the destination's keyword-box limit.
 * @returns {{ count: number, limit: number, over: boolean, nearLimit: boolean }}
 */
export function characterBudget(text, limit) {
  const count = (text || '').length
  if (!limit) return { count, limit: 0, over: false, nearLimit: false }
  const over = count > limit
  return { count, limit, over, nearLimit: !over && count > limit * 0.9 }
}
