/**
 * RecentKits — the last few kits, kept in the browser.
 *
 * Losing 40 seconds of generation to an accidental refresh is the single most
 * irritating thing this tool can do, so the last five kits survive a reload.
 * Sample kits are excluded: they are our words, not the user's work.
 */
export default function RecentKits({ items, activeId, onRestore, onClear }) {
  if (!items?.length) return null

  return (
    <section className="recent" aria-labelledby="recent-title">
      <div className="recent-head">
        <h2 className="recent-title" id="recent-title">
          Your recent kits
        </h2>
        <button type="button" className="link-btn" onClick={onClear}>
          Clear history
        </button>
      </div>

      <ul className="recent-list">
        {items.map((item) => {
          const title = item.result?.clean_jd?.title?.trim() || 'Untitled role'
          const active = item.id === activeId

          return (
            <li key={item.id}>
              <button
                type="button"
                className={`recent-item${active ? ' is-active' : ''}`}
                onClick={() => onRestore(item)}
                aria-current={active ? 'true' : undefined}
              >
                <span className="recent-item-title">{title}</span>
                <span className="recent-item-meta">{item.at}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
