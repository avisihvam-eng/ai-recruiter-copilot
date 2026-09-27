/**
 * LoadingState — animated dots while the pipeline is running.
 */

const STEPS = [
  { emoji: '🧹', label: 'Cleaning the JD…' },
  { emoji: '🔍', label: 'Building Boolean strings…' },
  { emoji: '✉️',  label: 'Drafting outreach…' },
  { emoji: '💼', label: 'Writing LinkedIn post…' },
]

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
        <p className="text-text font-medium text-sm">Your agents are on it.</p>
        <p className="text-muted text-xs mt-1 mb-4">This usually takes 20–40 seconds.</p>
        <div className="flex flex-col gap-1.5 items-start text-left">
          {STEPS.map(({ emoji, label }) => (
            <span key={label} className="text-xs text-muted/80 flex items-center gap-2">
              <span>{emoji}</span>
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
