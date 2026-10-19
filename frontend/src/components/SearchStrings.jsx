import { useState } from 'react'

import SectionCard from './SectionCard'
import CopyButton from './CopyButton'
import RegenerateButton from './RegenerateButton'
import { IconExternalLink } from './Icons'
import { straightenQuotes } from '../lib/outlook'
import { PLATFORMS, characterBudget, formatForPlatform, googleSearchUrl } from '../lib/booleans'

const TABS = [
  { key: 'strict', label: 'Strict' },
  { key: 'balanced', label: 'Balanced' },
  { key: 'broad', label: 'Broad' },
]

/**
 * SearchStrings — Strict / Balanced / Broad Boolean, formatted per destination.
 *
 * The three destinations are not interchangeable. Google does not know NOT, so
 * a LinkedIn string pasted into Google quietly adds a required term instead of
 * excluding one; Naukri expects every keyword quoted and truncates past roughly
 * 500 characters. Translating here is worth more than handing over one string
 * and letting the search silently return the wrong people.
 *
 * The section deliberately shows the string, not a lecture about the string:
 * one line of context under the controls, and the destination's own limits
 * expressed as a counter rather than a paragraph.
 */
export default function SearchStrings({ id, num, booleans, onRegenerate, busy }) {
  const [requested, setRequested] = useState('strict')
  const [platform, setPlatform] = useState('linkedin')

  if (!booleans) return null

  const available = TABS.filter((tab) => booleans[tab.key])
  if (!available.length) return null

  const activeKey = available.some((tab) => tab.key === requested) ? requested : available[0].key
  const activePlatform = PLATFORMS.find((p) => p.key === platform) ?? PLATFORMS[0]

  const base = straightenQuotes(booleans[activeKey])
  const query = formatForPlatform(base, platform)
  const { count, limit, over, nearLimit } = characterBudget(query, activePlatform.limit)

  const allThree = available
    .map((tab) => `${tab.label.toUpperCase()}\n${formatForPlatform(straightenQuotes(booleans[tab.key]), platform)}`)
    .join('\n\n')

  return (
    <SectionCard
      id={id}
      num={num}
      title="Search strings"
      busy={busy}
      actions={
        <>
          {available.length > 1 && (
            <CopyButton
              text={allThree}
              label="Copy all three"
              copiedLabel="Copied all three"
              className="btn btn-quiet btn-sm"
            />
          )}
          <RegenerateButton asset={id} onRegenerate={onRegenerate} busy={busy} />
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

      <div className="bool-string">{query}</div>

      <div className="bool-bar">
        <div className="platform-picker" role="group" aria-label="Destination platform">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`chip${p.key === platform ? ' is-active' : ''}`}
              aria-pressed={p.key === platform}
              onClick={() => setPlatform(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <span className={`char-count${over ? ' is-over' : nearLimit ? ' is-near' : ''}`}>
          {limit
            ? `${count.toLocaleString()} / ${limit.toLocaleString()}`
            : `${count.toLocaleString()} characters`}
        </span>
      </div>

      <div className="bool-actions">
        <CopyButton text={query} label={`Copy for ${activePlatform.short}`} className="btn btn-sm" />
        {platform === 'google' && (
          <a
            className="btn btn-quiet btn-sm"
            href={googleSearchUrl(base)}
            target="_blank"
            rel="noreferrer"
          >
            <IconExternalLink />
            Open in Google
          </a>
        )}
      </div>

      {over && (
        <p className="char-warn" role="status">
          Over {activePlatform.label}&rsquo;s limit — the box truncates silently. Trim a group or split
          the search.
        </p>
      )}

      <p className="doc-note">{activePlatform.note}</p>
    </SectionCard>
  )
}
