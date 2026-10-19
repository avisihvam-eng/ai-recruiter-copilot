import { useEffect, useRef } from 'react'

/**
 * AboutDialog — where the engineering detail lives.
 *
 * The footer used to lead with "Google ADK + Gemini", which is a fact about how
 * the thing was built and means nothing to the recruiter using it. Recruiters
 * want to know what it does for their week, so the footer says that and the
 * stack moved in here, one click away, for the people who do want it.
 *
 * A native <dialog> is used deliberately: showModal() gives focus trapping,
 * inertness, Esc-to-close and correct screen-reader semantics for free.
 */
export default function AboutDialog({ open, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="about"
      aria-labelledby="about-title"
      onClose={onClose}
      onClick={(event) => {
        // Clicks that land on the dialog element itself are backdrop clicks.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <h2 id="about-title" className="about-title">
        About MyHiringKit
      </h2>

      <p className="about-body">
        Paste one raw job description and you get five assets a recruiter would otherwise write by
        hand: a formatted job description, three Boolean searches, two outreach messages, a LinkedIn
        post, and an intake brief with screening questions.
      </p>

      <p className="about-body">
        Your wording is never rewritten — the formatted job description is built around your text,
        not instead of it.
      </p>

      <dl className="about-specs">
        <div>
          <dt>Pipeline</dt>
          <dd>Four Google ADK agents in sequence</dd>
        </div>
        <div>
          <dt>Model</dt>
          <dd>Gemini 2.5 Flash</dd>
        </div>
        <div>
          <dt>Serving</dt>
          <dd>FastAPI on Vercel, React front end</dd>
        </div>
      </dl>

      <div className="about-actions">
        <a
          className="btn btn-quiet btn-sm"
          href="https://github.com/avisihvam-eng/ai-recruiter-copilot"
          target="_blank"
          rel="noreferrer"
        >
          Source on GitHub
        </a>
        <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  )
}
