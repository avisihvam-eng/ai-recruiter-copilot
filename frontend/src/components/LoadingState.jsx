/**
 * LoadingState — animated dots while the pipeline is running.
 */
export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in">
      {/* Animated dots */}
      <div className="flex gap-2 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-accent"
            style={{
              animation: 'pulseDot 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <div className="text-center">
        <p className="text-text font-medium text-sm">Running recruiter pipeline…</p>
        <p className="text-muted text-xs mt-1">Agent 1 → JD + Boolean · Agent 2 → Outreach + LinkedIn</p>
      </div>
    </div>
  )
}
