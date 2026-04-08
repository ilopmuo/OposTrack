const TABS = [
  { key: 'tracker',  label: 'Mis vueltas' },
  { key: 'pomodoro', label: '🍅 Pomodoro' },
]

export default function Header({ stats, userEmail, onSignOut, tab, onTab }) {
  const { pct, doneRounds, totalRounds, completedTopics, totalTopics } = stats

  return (
    <header
      className="sticky top-0 z-50 px-6 py-4"
      style={{
        background: 'rgba(253,206,223,0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(242,190,209,0.5)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4">
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#7A2848', letterSpacing: '-0.5px' }}>
              OpoTracker
            </h1>

            {/* Tabs */}
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(242,190,209,0.55)' }}
            >
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => onTab(t.key)}
                  className="px-3 py-1 rounded-[10px] text-xs transition-all duration-150"
                  style={{
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    ...(tab === t.key
                      ? { background: '#7A2848', color: '#fff' }
                      : { background: 'transparent', color: '#9B4569' }),
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {tab === 'tracker' && (
              <>
                <Chip className="hidden sm:inline-flex"><b>{doneRounds}</b> / {totalRounds} vueltas</Chip>
                <Chip className="hidden sm:inline-flex"><b>{completedTopics}</b> / {totalTopics} completos</Chip>
              </>
            )}
            <button
              onClick={onSignOut}
              title={userEmail}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{ background: 'rgba(255,255,255,0.4)', color: '#9B4569', border: '1px solid rgba(242,190,209,0.5)', fontWeight: 700 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)' }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {tab === 'tracker' && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(242,190,209,0.4)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #F2BED1, #C06090)',
                }}
              />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#7A2848', minWidth: 38, textAlign: 'right' }}>
              {pct}%
            </span>
          </div>
        )}
      </div>
    </header>
  )
}

function Chip({ children, className = '' }) {
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full inline-flex items-center gap-1 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.5)',
        color: '#9B4569',
        fontWeight: 700,
        border: '1px solid rgba(242,190,209,0.6)',
      }}
    >
      {children}
    </span>
  )
}
