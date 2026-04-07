function StatCard({ label, value, sub, valueColor = '#1C1C1E' }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: '#ffffff',
        boxShadow: '0 2px 16px rgba(242,190,209,0.18), 0 1px 4px rgba(0,0,0,0.04)',
        border: '1px solid rgba(248,232,238,0.8)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#AEAEB2' }}>
        {label}
      </p>
      <p className="text-3xl font-bold tracking-tight mb-0.5" style={{ color: valueColor }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: '#C4A4B0' }}>{sub}</p>
    </div>
  )
}

export default function StatsGrid({ stats }) {
  const { pct, doneRounds, totalRounds, completedTopics, totalTopics, startedTopics } = stats
  const pending = totalTopics - completedTopics - startedTopics

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <StatCard label="Progreso"       value={`${pct}%`}       sub={`${doneRounds} de ${totalRounds} vueltas`} valueColor="#C07098" />
      <StatCard label="Completados"    value={completedTopics} sub={`de ${totalTopics} temas`}                 valueColor="#7A6B7E" />
      <StatCard label="En progreso"    value={startedTopics}   sub="con vueltas parciales"                     valueColor="#9B7E8A" />
      <StatCard label="Sin empezar"    value={pending}         sub="temas pendientes"                          valueColor="#AEAEB2" />
    </div>
  )
}
