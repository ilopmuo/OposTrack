export default function Header({ stats }) {
  const { pct, doneRounds, totalRounds, completedTopics, totalTopics } = stats

  return (
    <header
      className="sticky top-0 z-50 px-6 py-4"
      style={{
        background: 'rgba(249,245,246,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(242,190,209,0.3)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-baseline gap-2">
            <h1
              className="text-xl font-semibold tracking-tight"
              style={{ color: '#1C1C1E', letterSpacing: '-0.4px' }}
            >
              OpoTracker
            </h1>
            <span className="text-xs hidden sm:inline" style={{ color: '#AEAEB2' }}>
              seguimiento de vueltas
            </span>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <Chip><b style={{ color: '#1C1C1E' }}>{doneRounds}</b> / {totalRounds} vueltas</Chip>
            <Chip className="hidden sm:inline-flex">
              <b style={{ color: '#1C1C1E' }}>{completedTopics}</b> / {totalTopics} completos
            </Chip>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: '#F8E8EE' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #FDCEDF, #F2BED1)',
              }}
            />
          </div>
          <span
            className="text-sm font-semibold min-w-[38px] text-right"
            style={{ color: '#C07098' }}
          >
            {pct}%
          </span>
        </div>
      </div>
    </header>
  )
}

function Chip({ children, className = '' }) {
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full inline-flex items-center gap-1 ${className}`}
      style={{
        background: '#F8E8EE',
        color: '#9B6B7E',
        border: '1px solid rgba(242,190,209,0.4)',
      }}
    >
      {children}
    </span>
  )
}
