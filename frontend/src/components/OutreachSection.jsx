import SectionCard from './SectionCard'
import CopyButton from './CopyButton'
import { messagesToOutlookHtml, toOutlookHtml } from '../lib/outlook'

const MESSAGES = [
  { key: 'short', label: 'Short message', hint: 'Best for a quick LinkedIn touch' },
  { key: 'detailed', label: 'Detailed message', hint: 'Best for InMail or email' },
]

/**
 * OutreachSection — the two candidate messages, each independently copyable.
 *
 * The HTML flavour is built by outlook.js so both messages paste into Word and
 * Outlook with the paragraph breaks intact.
 */
export default function OutreachSection({ id, num, outreach }) {
  if (!outreach) return null

  const messages = MESSAGES.filter((m) => outreach[m.key])
  if (!messages.length) return null

  const combined = messages.map((m) => `${m.label.toUpperCase()}\n\n${outreach[m.key]}`).join('\n\n———\n\n')
  const combinedHtml = messagesToOutlookHtml(
    messages.map((m) => ({ label: m.label, body: outreach[m.key] })),
  )

  return (
    <SectionCard
      id={id}
      num={num}
      title="Candidate outreach"
      subtitle="Written to sound like a person, not a template"
      actions={<CopyButton text={combined} html={combinedHtml} label="Copy both" />}
    >
      <div className="callout">
        <span className="callout-swatch" aria-hidden="true" />
        <p>
          Messages open with <code>%FIRSTNAME%</code> — LinkedIn Recruiter&rsquo;s native
          personalisation token, which fills in automatically when you send. Pasting into email
          instead? Swap it for the candidate&rsquo;s name.
        </p>
      </div>

      {messages.map((m) => (
        <div key={m.key} className="msg">
          <div className="msg-head">
            <div className="msg-meta">
              <span className="msg-label">{m.label}</span>
              <span className="msg-hint">{m.hint}</span>
            </div>
            <CopyButton text={outreach[m.key]} html={toOutlookHtml(outreach[m.key])} />
          </div>
          <p className="text-body">{outreach[m.key]}</p>
        </div>
      ))}
    </SectionCard>
  )
}
