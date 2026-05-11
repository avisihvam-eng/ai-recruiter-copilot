import { useState } from 'react'
import CopyButton from './CopyButton'

const TABS = [
  { key: 'strict', label: 'Strict', desc: 'Tightest match — must-have skills only' },
  { key: 'balanced', label: 'Balanced', desc: 'Core skills + some flexibility' },
  { key: 'broad', label: 'Broad', desc: 'Wide net — passive candidates' },
]

/**
 * BooleanTabs — Strict / Balanced / Broad tab switcher.
 */
export default function BooleanTabs({ booleans }) {
  const [active, setActive] = useState('strict')
  if (!booleans) return null

  const current = booleans[active] || ''

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-accent text-base">⚡</span>
          <h3 className="text-sm font-semibold text-text">Boolean Strings</h3>
        </div>
        <CopyButton text={current} />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-4 p-1 bg-white/5 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`tab-btn ${active === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs text-muted mb-3">
        {TABS.find((t) => t.key === active)?.desc}
      </p>

      {/* Boolean Display */}
      <div className="bool-display">
        {current || <span className="text-muted italic">No boolean generated</span>}
      </div>
    </div>
  )
}
