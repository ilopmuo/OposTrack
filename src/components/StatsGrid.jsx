function StatCard({ label, value, sub, color = 'text-slate-800' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-extrabold tracking-tight ${color}`}>{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  )
}

export default function StatsGrid({ stats }) {
  const { pct, doneRounds, totalRounds, completedTopics, totalTopics, startedTopics } = stats
  const pending = totalTopics - completedTopics - startedTopics

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <StatCard label="Progreso global"    value={`${pct}%`}           sub={`${doneRounds} de ${totalRounds} vueltas`} color="text-indigo-600" />
      <StatCard label="Temas completos"    value={completedTopics}     sub={`de ${totalTopics} totales`}               color="text-green-600" />
      <StatCard label="En progreso"        value={startedTopics}       sub="con vueltas parciales"                     color="text-amber-600" />
      <StatCard label="Sin empezar"        value={pending}             sub="temas pendientes"                          color="text-slate-500" />
    </div>
  )
}
