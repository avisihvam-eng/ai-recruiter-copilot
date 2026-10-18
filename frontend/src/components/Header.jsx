const STATUS = {
  checking: { className: 'is-checking', label: 'Checking backend' },
  online: { className: 'is-online', label: 'Connected' },
  offline: { className: 'is-offline', label: 'Backend offline' },
}

/**
 * Header — slim sticky bar.
 *
 * The status reflects a real GET /api/health probe. The previous build showed an
 * unconditional green dot, which lied to the user whenever the API was down.
 *
 * A lone dot with a tooltip means nothing to a recruiter, and "connected" is the
 * expected steady state anyway — so we render the indicator only when something
 * is actually wrong, and always with words attached.
 */
export default function Header({ status = 'checking' }) {
  const state = STATUS[status] ?? STATUS.checking
  // Only a failure is worth interrupting someone for. The probe resolves in a
  // few hundred ms, so "Checking backend" would flash in and out on every load
  // — too brief to read, long enough to look like a glitch. Screen readers
  // still hear every state through the live region below.
  const showStatus = status === 'offline'

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            R
          </span>
          <span className="brand-name">Recruiter Copilot</span>
        </div>

        {showStatus ? (
          <div className={`header-status ${state.className}`}>
            <span className="status-dot" aria-hidden="true" />
            <span className="status-text" aria-hidden="true">
              {state.label}
            </span>
            <span className="sr-only" role="status">
              {state.label}
            </span>
          </div>
        ) : (
          <span className="sr-only" role="status">
            {state.label}
          </span>
        )}
      </div>
    </header>
  )
}
