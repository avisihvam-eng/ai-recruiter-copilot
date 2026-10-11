/** Loading feedback with the product's existing wording. */
export default function LoadingState() {
  return (
    <div className="loading-state animate-fade-in" aria-live="polite">
      <div className="loading-head">
        <div className="loading-dots" aria-hidden="true">
          {[0, 1, 2].map((index) => <span key={index} />)}
        </div>
        <div>
          <p className="text-text font-medium text-sm">Running recruiter pipeline…</p>
          <p className="text-muted text-xs mt-1">Agent 1 → JD + Boolean · Agent 2 → Outreach + LinkedIn</p>
        </div>
      </div>
    </div>
  )
}
