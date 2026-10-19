import { SECTIONS } from '../lib/sections'

const STATE_LABEL = {
  pending: 'Waiting',
  running: 'Working…',
  done: 'Done',
}

/**
 * LoadingState — real progress, not a moving bar.
 *
 * The backend streams a stage event as each agent starts and finishes, so every
 * row here reflects work that has actually happened. When the host cannot stream
 * (some serverless runtimes buffer the whole response) every row simply stays
 * "Waiting" until the kit arrives — which is honest, and still tells the user
 * what is being built.
 *
 * The visible rows are hidden from assistive tech and a single live region
 * announces the current step instead, so a screen reader hears five short
 * sentences rather than a list being rewritten underneath it.
 */
export default function LoadingState({ stageStates = {}, retrying = false }) {
  const running = SECTIONS.find((section) => stageStates[section.id] === 'running')

  const announcement = running
    ? `${running.progress}. ${SECTIONS.filter((s) => stageStates[s.id] === 'done').length} of ${SECTIONS.length} done.`
    : 'Building your recruiting kit.'

  return (
    <div className="loading fade-in" aria-busy="true">
      <p className="sr-only" role="status">
        {announcement}
      </p>

      <div className="loading-head">
        <div className="loading-dots" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} />
          ))}
        </div>
        <div>
          <p className="loading-title">Four specialists are building your kit…</p>
          <p className="loading-sub">This usually takes 20–40 seconds. Keep this tab open.</p>
        </div>
      </div>

      <ul className="loading-steps" aria-hidden="true">
        {SECTIONS.map((section) => {
          const state = stageStates[section.id] ?? 'pending'
          return (
            <li key={section.id} className={`loading-step is-${state}`}>
              <span className="loading-tick">{state === 'done' ? '✓' : ''}</span>
              <span className="loading-step-label">{section.progress}</span>
              <span className="loading-step-state">{STATE_LABEL[state]}</span>
            </li>
          )
        })}
      </ul>

      {retrying ? (
        <p className="loading-note">
          Gemini is rate limiting us — retrying automatically in a few seconds.
        </p>
      ) : null}
    </div>
  )
}
