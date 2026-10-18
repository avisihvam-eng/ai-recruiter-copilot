/**
 * outlook.js — clipboard HTML that survives Microsoft Word and Outlook.
 *
 * Word's renderer is not a browser. It ignores border-radius, box-shadow,
 * flex/grid and background colours on inline elements, it does not honour
 * padding-left on lists (bullet indent comes from the destination document's
 * list style), and it re-derives paragraph spacing from its own "HTML paragraph
 * auto spacing" rule unless we mirror our margins in mso-margin-*-alt.
 *
 * So everything here is: inline styles only, pt units (never px), explicit
 * margins mirrored with the mso-*-alt pair, and native <ul><li> only where a
 * Word-native list is genuinely wanted (the role brief). Everywhere else we use
 * a literal bullet with a hanging indent, which Word cannot reflow or renumber.
 *
 * Every payload is wrapped in a minimal HTML document with a declared charset
 * and ASCII-only text. The clipboard path itself is always UTF-8 (Windows
 * CF_HTML), so the wrapper is belt-and-braces: it also covers Paste Special and
 * "save as .htm", where Word guesses the code page and would otherwise mojibake
 * a "·" or an em dash.
 */

const SANS = 'Calibri,Arial,sans-serif'
const MONO = "Consolas,'Courier New',monospace"

const BODY = `font-family:${SANS};font-size:11pt;color:#000000;`

/**
 * Paragraph style. Word mirrors our margins only if we give it the -alt pair;
 * without them its "HTML paragraph auto spacing" rule can silently replace the
 * gap we asked for.
 */
const p = ({ mt = 0, mb = 10, size = 11, bold = false, mono = false, extra = '' } = {}) =>
  `margin:${mt}pt 0 ${mb}pt 0;` +
  `mso-margin-top-alt:${mt}pt;mso-margin-bottom-alt:${mb}pt;` +
  `font-family:${mono ? MONO : SANS};font-size:${size}pt;color:#000000;` +
  (bold ? 'font-weight:bold;' : '') +
  extra

/** List item. mso-special-format stops Outlook rewriting the bullet on paste. */
const li = (mb = 4) =>
  `margin:0 0 ${mb}pt 0;mso-margin-top-alt:0;mso-margin-bottom-alt:${mb}pt;` +
  `font-family:${SANS};font-size:11pt;color:#000000;mso-special-format:bullet;`

const ul = (mb = 10) => `margin:0 0 ${mb}pt 0;mso-margin-top-alt:0;mso-margin-bottom-alt:${mb}pt;`

const wrap = (inner) =>
  '<html xmlns:o="urn:schemas-microsoft-com:office:office"><head>' +
  '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
  '<meta name="Generator" content="Recruiter Copilot"></head>' +
  `<body><div style="${BODY}">${inner}</div></body></html>`

/* ── text safety ─────────────────────────────────────────────────────────── */

export const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Strip platform junk and normalise Unicode. Call before anything looks at it. */
export function normaliseText(s = '') {
  return String(s)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u2028\u2029]/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\t/g, '    ')
    .normalize('NFC')
}

/**
 * CRLF for the text/plain clipboard flavour. Chromium already rewrites lone LF
 * for CF_UNICODETEXT on Windows, and it only touches lone LF, so this is safe to
 * apply unconditionally and fixes Firefox, Safari and native non-Word targets.
 */
export const toCrlf = (s = '') => normaliseText(s).replace(/\n/g, '\r\n')

/** ASCII-only HTML text, so no charset guess on any path can mojibake it. */
export function encodeNonAscii(s = '') {
  // Array.from walks code points, so a surrogate pair (emoji) becomes a single
  // numeric reference rather than two broken halves.
  return Array.from(String(s), (ch) => {
    const cp = ch.codePointAt(0)
    return cp > 0x7f ? `&#${cp};` : ch
  }).join('')
}

/** Escape + normalise + encode: the only way text should enter a payload. */
export const htmlText = (s = '') => encodeNonAscii(escapeHtml(normaliseText(s)))

/**
 * Straighten typographic punctuation. For Boolean strings and ATS fields ONLY:
 * a model-emitted “Data Engineer” silently fails in LinkedIn's query parser,
 * whereas a ’ in prose pasted into Word is exactly what you want to keep.
 */
export function straightenQuotes(s = '') {
  return String(s)
    .replace(/[\u2018\u2019\u02BC\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\u00A0/g, ' ')
}

/* ── prose ───────────────────────────────────────────────────────────────── */

const BULLET = /^\s*(?:\u2022|\u25CF|-|\*)\s+/

/**
 * Inner fragment for free prose: blank lines separate paragraphs, a
 * bullet-prefixed line becomes a hanging-indent paragraph with a literal bullet.
 * We deliberately do NOT build a <ul> here — the destination is usually Outlook
 * or LinkedIn, where a real Word list would fight the surrounding text and pick
 * up the destination document's list style.
 */
export function blocksToHtml(text = '') {
  const parts = []

  for (const block of normaliseText(text).split(/\n\s*\n/)) {
    const lines = block.split('\n').filter((l) => l.trim() !== '')
    if (!lines.length) continue

    let para = []
    const flush = () => {
      if (!para.length) return
      parts.push(`<p style="${p({ mb: 10 })}">${para.map(htmlText).join('<br>')}</p>`)
      para = []
    }

    for (const line of lines) {
      if (BULLET.test(line)) {
        flush()
        parts.push(
          `<p style="${p({ mb: 4, extra: 'text-indent:-0.18in;margin-left:0.25in;' })}">` +
            `&#8226;&nbsp;&nbsp;${htmlText(line.replace(BULLET, ''))}</p>`,
        )
      } else {
        para.push(line)
      }
    }
    flush()
  }

  return parts.join('')
}

export function toOutlookHtml(text = '') {
  return wrap(blocksToHtml(text))
}

/* ── role brief ──────────────────────────────────────────────────────────── */

/**
 * The labelled header of the formatted job description. Exported so the visible
 * text, the plain-text copy and the Outlook HTML are all generated from this one
 * list and can never drift apart.
 */
export function briefFields({ title, location } = {}) {
  return [
    { label: 'Job title', value: title },
    { label: 'Location', value: location },
  ].filter((field) => field.value)
}

function roleBriefInner({ title, location, intro, sections = [], fieldSize = 12 } = {}) {
  const parts = []

  // Whole line bold and a step above body copy, matching the on-screen header.
  const fields = briefFields({ title, location })
  for (const field of fields) {
    parts.push(
      `<p style="${p({ mb: 2, size: fieldSize, bold: true })}">${htmlText(`${field.label} \u2013 ${field.value}`)}</p>`,
    )
  }

  if (intro) parts.push(`<p style="${p({ mt: fields.length ? 8 : 0, mb: 10 })}">${htmlText(intro)}</p>`)

  for (const section of sections) {
    const items = (section?.items ?? []).filter(Boolean)
    if (!items.length) continue
    parts.push(`<p style="${p({ mt: 10, mb: 2, bold: true })}">${htmlText(section.heading)}</p>`)
    parts.push(
      `<ul style="${ul(10)}">${items
        .map((item) => `<li style="${li()}">${htmlText(item)}</li>`)
        .join('')}</ul>`,
    )
  }

  return parts.join('')
}

/** Outlook HTML for the structured role brief (headings + bullet lists). */
export function roleBriefToOutlookHtml(brief = {}) {
  return wrap(roleBriefInner(brief))
}

/* ── outreach ────────────────────────────────────────────────────────────── */

/** Two labelled messages separated by a rule — the "Copy both" payload. */
export function messagesToOutlookHtml(messages = []) {
  const parts = []
  messages.forEach((message, index) => {
    if (index > 0) parts.push(`<p style="${p({ mt: 8, mb: 10 })}">&#8212;&#8212;&#8212;</p>`)
    parts.push(`<p style="${p({ mb: 4, bold: true })}">${htmlText(message.label)}</p>`)
    parts.push(blocksToHtml(message.body))
  })
  return wrap(parts.join(''))
}

/* ── whole kit ───────────────────────────────────────────────────────────── */

/**
 * The complete kit as one Outlook-safe document, for pasting into an email to a
 * hiring manager. Shares the same inner builders as the per-section payloads so
 * a single asset and the kit can never render differently.
 */
export function kitToOutlookHtml(result) {
  if (!result) return ''

  const jd = result.clean_jd || {}
  const booleans = result.booleans || {}
  const outreach = result.outreach || {}
  const brief = result.recruiter_brief || {}

  const parts = []
  const heading = (label) => parts.push(`<p style="${p({ mt: 18, mb: 6, size: 13, bold: true })}">${htmlText(label)}</p>`)
  const subheading = (label) => parts.push(`<p style="${p({ mt: 8, mb: 2, bold: true })}">${htmlText(label)}</p>`)

  const duties = jd.responsibilities?.length ? jd.responsibilities : jd.duties || []
  const skillGroups = [
    { heading: 'Job duties', items: duties },
    { heading: 'Required skills', items: jd.required_skills || [] },
    { heading: 'Preferred skills', items: jd.preferred_skills || [] },
  ].filter((group) => group.items.filter(Boolean).length)

  if (jd.title || skillGroups.length) {
    heading('Formatted job description')
    parts.push(
      roleBriefInner({
        title: jd.title,
        location: jd.location,
        intro: jd.objective || jd.summary,
        sections: skillGroups,
      }),
    )
  }

  const variants = [
    ['Strict', booleans.strict],
    ['Balanced', booleans.balanced],
    ['Broad', booleans.broad],
  ].filter(([, value]) => value)

  if (variants.length) {
    heading('Search strings')
    for (const [label, value] of variants) {
      subheading(label)
      parts.push(`<p style="${p({ mono: true })}">${htmlText(value)}</p>`)
    }
  }

  const messages = [
    ['Short message', outreach.short],
    ['Detailed message', outreach.detailed],
  ].filter(([, value]) => value)

  if (messages.length) {
    heading('Candidate outreach')
    messages.forEach(([label, body], index) => {
      if (index > 0) parts.push(`<p style="${p({ mt: 8, mb: 8 })}">&#8212;&#8212;&#8212;</p>`)
      subheading(label)
      parts.push(blocksToHtml(body))
    })
  }

  if (result.linkedin_post) {
    heading('LinkedIn post')
    parts.push(blocksToHtml(result.linkedin_post))
  }

  const prepGroups = []
  if (brief.ideal_candidate) prepGroups.push({ heading: 'Strongest-fit profile', body: brief.ideal_candidate })
  if (brief.screening_questions?.length) {
    prepGroups.push({ heading: 'Screening questions', items: brief.screening_questions, ordered: true })
  }
  if (brief.watchouts?.length) prepGroups.push({ heading: 'Clarify before you search', items: brief.watchouts })

  if (prepGroups.length) {
    heading('Recruiter prep')
    for (const group of prepGroups) {
      subheading(group.heading)
      if (group.body) parts.push(`<p style="${p({ mb: 8 })}">${htmlText(group.body)}</p>`)
      if (group.items?.length) {
        // Literal markers, not a Word list: Word would renumber from its own list
        // style, and these are quotations rather than a document outline.
        parts.push(
          group.items
            .map(
              (item, index) =>
                `<p style="${p({ mb: 4, extra: 'text-indent:-0.22in;margin-left:0.28in;' })}">` +
                `${group.ordered ? `${index + 1}.` : '&#8226;'}&nbsp;&nbsp;${htmlText(item)}</p>`,
            )
            .join(''),
        )
      }
    }
  }

  return wrap(parts.join(''))
}
