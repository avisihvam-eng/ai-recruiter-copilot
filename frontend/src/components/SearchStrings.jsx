import { useState } from 'react'

import SectionCard from './SectionCard'
import CopyButton from './CopyButton'
import { straightenQuotes } from '../lib/outlook'

const TABS = [
  {
    key: 'strict',
    label: 'Strict',
    desc: 'Tightest match — explicit must-have skills only. Highest precision, smallest pool.',
  },
  {
    key: 'balanced',
    label: 'Balanced',
    desc: 'Core skills plus genuinely adjacent titles and technologies. The usual starting point.',
  },
  {
    key: 'broad',
    label: 'Broad',
    desc: 'Widest relevant net — useful for passive candidates and hard-to-fill roles.',
  },
]

/**
 * SearchStrings — Strict / Balanced / Broad Boolean switcher.
 *
 * Falls back to the first tab that actually has content, so a partial payload
 * can never render an empty panel.
 *
 * Quotes are straightened for display AND copy: the destination is LinkedIn
 * Recruiter or an ATS query parser, where a model-emitted curly quote silently
 * fails to match. There is no HTML flavour on purpose — the target is a query
 * box, not an email body, so plain text is the correct flavour.
 */
export default function SearchStrings({ id, num, booleans }) {
  const [requested, setRequested] = useState('strict')

  if (!booleans) return null

  const available = TABS.filter((tab) => booleans[tab.key])
  if (!available.length) return null

  const activeKey = available.some((tab) => tab.key === requested) ? requested : available[0].key
  const current = straightenQuotes(booleans[activeKey])
  const activeTab = TABS.find((tab) => tab.key === activeKey)

  const allThree = available
    .map((tab) => `${tab.label.toUpperCase()}\n${straightenQuotes(booleans[tab.key])}`)
    .join('\n\n')

  return (
    <SectionCard
      id={id}
      num={num}
      title="Search strings"
      subtitle="Paste straight into LinkedIn Recruiter or your ATS"
      actions={
        <>
          <CopyButton text={current} label={`Copy ${activeTab.label.toLowerCase()}`} />
          {available.length > 1 && <CopyButton text={allThree} label="Copy all three" />}
        </>
      }
    >
      <div className="bool-tabs" role="tablist" aria-label="Boolean string variants">
        {available.map((tab) => {
          const isActive = tab.key === activeKey
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className="tab"
              onClick={() => setRequested(tab.key)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <p className="bool-desc">{activeTab?.desc}</p>

      <div className="bool-string">{current}</div>

      <p className="doc-note">
        Quotation marks, <code>AND</code>, <code>OR</code> and parentheses behave the same way in
        LinkedIn Recruiter and most ATS query builders. Trim the parentheses if your ATS prefers
        plain keywords.
      </p>
    </SectionCard>
  )
}
