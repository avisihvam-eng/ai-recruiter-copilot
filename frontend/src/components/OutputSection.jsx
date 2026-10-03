import CopyButton from './CopyButton'

/**
 * OutputSection — generic section card.
 * Used for Outreach Short, Outreach Detailed, LinkedIn Post.
 *
 * Copy produces Outlook-ready HTML: blank lines become paragraphs, single
 * line breaks become <br>, and "•" / "-" lines become a native bullet list.
 */

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const FONT = "font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#000000;"
const BULLET = /^\s*(?:\u2022|-|\*)\s+/

function toOutlookHtml(text) {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n\s*\n/)
  const body = blocks
    .map((block) => {
      const lines = block.split('\n').filter((l) => l.trim() !== '')
      if (lines.length && lines.every((l) => BULLET.test(l))) {
        return `<ul style="margin-top:0;margin-bottom:8pt;">${lines
          .map((l) => `<li style="${FONT}">${escapeHtml(l.replace(BULLET, ''))}</li>`)
          .join('')}</ul>`
      }
      return `<p style="margin:0 0 10pt 0;${FONT}">${lines.map(escapeHtml).join('<br>')}</p>`
    })
    .join('')
  return `<div style="${FONT}">${body}</div>`
}

export default function OutputSection({ title, content, mono = false }) {
  if (!content) return null
  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <CopyButton text={content} html={mono ? undefined : toOutlookHtml(content)} />
      </div>
      <p
        className={`text-sm leading-relaxed whitespace-pre-wrap text-text-dim ${
          mono ? 'font-mono' : ''
        }`}
      >
        {content}
      </p>
    </div>
  )
}
