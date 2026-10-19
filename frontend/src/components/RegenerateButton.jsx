import { IconRefresh } from './Icons'

/**
 * RegenerateButton — re-run a single asset.
 *
 * Re-running the whole four-agent pipeline to change one message would cost the
 * user four model calls and a minute of waiting. The backend can run the one
 * agent that produces a given asset, so this does exactly that.
 */
export default function RegenerateButton({ asset, onRegenerate, busy = false, label = 'Regenerate' }) {
  return (
    <button
      type="button"
      className="btn btn-quiet btn-sm"
      onClick={() => onRegenerate?.(asset)}
      disabled={busy}
    >
      <span className={busy ? 'spin' : undefined}>
        <IconRefresh />
      </span>
      {busy ? 'Regenerating…' : label}
    </button>
  )
}
