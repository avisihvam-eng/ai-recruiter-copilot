import { useState } from 'react'

import SectionCard from './SectionCard'
import CopyButton from './CopyButton'
import RegenerateButton from './RegenerateButton'
import { IconPencil } from './Icons'
import { messagesToOutlookHtml, toOutlookHtml } from '../lib/outlook'

const FIRSTNAME = '%FIRSTNAME%'

const MESSAGES = [
  {
    key: 'short',
    label: 'Short message',
    hint: 'LinkedIn connection note',
    limit: 300,
  },
  {
    key: 'detailed',
    label: 'Detailed message',
    hint: 'InMail or email',
    limit: 1900,
  },
]

/**
 * Split a message around the personalisation token so %FIRSTNAME% stands out.
 *
 * The token is the one part of the message a recruiter must leave exactly as
 * written — it is replaced automatically on send, and any edit to it silently
 * breaks that. Highlighting it is cheaper than a warning about it, which is why
 * this section no longer needs a paragraph explaining itself.
 */
function withTokenHighlight(text) {
  const nodes = []
  text.split(FIRSTNAME).forEach((part, i) => {
    if (i > 0) {
      nodes.push(
        <mark key={`token-${i}`} className="token">
          {FIRSTNAME}
        </mark>,
      )
    }
    if (part) nodes.push(<span key={`text-${i}`}>{part}</span>)
  })
  return nodes
}

/**
 * OutreachSection — the two candidate messages.
 *
 * Both are editable in place: the generated draft is a starting point, and a
 * recruiter who cannot tweak a word without leaving the page will just copy it
 * into their own editor and never come back. Edits flow up to the kit, so
 * "Copy kit" stays in step with what is on screen.
 */
export default function OutreachSection({ id, num, outreach, onRegenerate, onEdit, busy }) {
  const [editing, setEditing] = useState(null)

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
      busy={busy}
      actions={
        <>
          <CopyButton text={combined} html={combinedHtml} label="Copy both" />
          <RegenerateButton asset={id} onRegenerate={onRegenerate} busy={busy} />
        </>
      }
    >
      {messages.map((m) => {
        const value = outreach[m.key] ?? ''
        const isEditing = editing === m.key
        const over = value.length > m.limit

        return (
          <div key={m.key} className="msg">
            <div className="msg-head">
              <div className="msg-meta">
                <span className="msg-label">{m.label}</span>
                <span className="msg-hint">{m.hint}</span>
              </div>

              <div className="msg-actions">
                <span className={`char-count${over ? ' is-over' : ''}`}>
                  {value.length.toLocaleString()}{' '}
                  <span className="char-unit">of {m.limit.toLocaleString()}</span>
                </span>

                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => setEditing(isEditing ? null : m.key)}
                  aria-expanded={isEditing}
                >
                  <IconPencil />
                  {isEditing ? 'Done' : 'Edit'}
                </button>

                <CopyButton text={value} html={toOutlookHtml(value)} />
              </div>
            </div>

            {isEditing ? (
              <textarea
                className="msg-editor"
                value={value}
                rows={4}
                aria-label={`${m.label} text`}
                onChange={(event) => onEdit(m.key, event.target.value)}
              />
            ) : (
              <p className="text-body">{withTokenHighlight(value)}</p>
            )}
          </div>
        )
      })}
    </SectionCard>
  )
}
