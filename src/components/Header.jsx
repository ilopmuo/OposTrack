export default function Header({ stats }) {
  const { pct, doneRounds, totalRounds, completedTopics, totalTopics } = stats

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto">
        {/* Title + chips */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-extrabold text-indigo-600 tracking-tight">OpoTracker</h1>
            <span className="text-xs text-slate-400 font-normal hidden sm:inline">seguimiento de vueltas</span>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200 whitespace-nowrap">
              <strong className="text-slate-700">{doneRounds}</strong> / {totalRounds} vueltas
            </span>
            <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200 whitespace-nowrap hidden sm:inline">
              <strong className="text-slate-700">{completedTopics}</strong> / {totalTopics} temas completos
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-bold text-indigo-600 min-w-[38px] text-right">{pct}%</span>
        </div>
      </div>
    </header>
  )
}
