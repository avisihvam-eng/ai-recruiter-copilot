import { COLD_START_HINT } from '../lib/api'

/**
 * Header — slim sticky bar.
 *
 * The status reflects a real GET /api/health probe. It stays silent in the two
 * states nobody needs to act on: while the probe is still in flight (a few
 * hundred ms when the backend is warm) and once it has succeeded. An indicator
 * that is always on is an indicator nobody reads — and "Checking backend"
 * flashing past on every page load read as if something were already broken.
 *
 * The one state worth interrupting for is a slow start. A sleeping serverless
 * backend can take 15-20s to answer, and unexplained silence looks like a hang,
 * so we name the wait and say roughly how long it is.
 */
export default function Header({ status = 'checking', onRetry }) {
  const visible = status === 'warming' || status === 'offline'

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span className="brand-name">MyHiringKit</span>
        </div>

        {visible ? (
          <div className={`header-status is-${status}`}>
            {status === 'warming' ? (
              <span className="status-spinner" aria-hidden="true" />
            ) : (
              <span className="status-dot" aria-hidden="true" />
            )}

            <span className="status-text" aria-hidden="true">
              {status === 'warming' ? `Waking up — ${COLD_START_HINT}` : 'Server not responding'}
            </span>

            {status === 'offline' && onRetry ? (
              <button type="button" className="btn btn-quiet btn-sm" onClick={onRetry}>
                Retry
              </button>
            ) : null}

            {/* Decorative text above is hidden from assistive tech so this is
                announced once, in a sentence, rather than character by character
                as the estimate changes. */}
            <span className="sr-only" role="status">
              {status === 'warming'
                ? `Waking up the server. This usually takes ${COLD_START_HINT}.`
                : 'The server could not be reached. Build kit is paused until it responds.'}
            </span>
          </div>
        ) : (
          <span className="sr-only" role="status">
            {status === 'online' ? 'Server ready.' : 'Checking the server.'}
          </span>
        )}
      </div>
    </header>
  )
}
