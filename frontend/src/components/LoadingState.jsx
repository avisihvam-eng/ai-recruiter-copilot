const STEPS = ['Formatted job description', 'Search strings', 'Candidate outreach', 'LinkedIn post', 'Recruiter prep']

/**
 * LoadingState — honest progress feedback.
 *
 * The pipeline is a single request and the backend does not stream partial
 * results, so we deliberately do NOT fake a per-step completion bar (the old
 * single-file UI animated fake timers). We list the five assets being built and
 * show indeterminate progress.
 */
export default function LoadingState() {
  return (
    <div className="loading fade-in" aria-live="polite" aria-busy="true">
      <div className="loading-head">
        <div className="loading-dots" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} />
          ))}
        </div>
        <div>
          <p className="loading-title">Four specialists are building your kit…</p>
          <p className="loading-sub">
            This usually takes 20–40 seconds. Keep this tab open.
          </p>
        </div>
      </div>

      <ul className="loading-steps">
        {STEPS.map((step) => (
          <li key={step}>
            <span className="loading-tick" aria-hidden="true" />
            {step}
          </li>
        ))}
      </ul>
    </div>
  )
}
