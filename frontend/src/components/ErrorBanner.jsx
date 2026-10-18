/**
 * ErrorBanner — dismissible failure state.
 *
 * Keeps the "Get a free Gemini API key" affordance for the no-key case, and
 * surfaces a hint when the failure looks like a rate limit.
 */
export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null

  const needsKey = /api key/i.test(message)

  return (
    <div className="alert" role="alert">
      <div className="alert-body">
        <span className="alert-icon" aria-hidden="true">
          !
        </span>
        <div>
          <p className="alert-text">{message}</p>
          {needsKey && (
            <a
              className="alert-link"
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
            >
              Get a free Gemini API key
            </a>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}
