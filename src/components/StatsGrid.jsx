const CARDS = [
  {
    label: 'Progreso global',
    bg: 'linear-gradient(135deg, #F2BED1 0%, #FDCEDF 100%)',
    valueColor: '#7A2848',
    subColor: '#C07098',
    border: 'rgba(242,190,209,0.8)',
  },
  {
    label: 'Completados',
    bg: 'linear-gradient(135deg, #FDCEDF 0%, #F8E8EE 100%)',
    valueColor: '#7A2848',
    subColor: '#C07098',
    border: 'rgba(242,190,209,0.5)',
  },
  {
    label: 'En progreso',
    bg: 'linear-gradient(135deg, #F8E8EE 0%, #FDF4F7 100%)',
    valueColor: '#9B4569',
    subColor: '#C07098',
    border: 'rgba(242,190,209,0.4)',
  },
  {
    label: 'Sin empezar',
    bg: 'linear-gradient(135deg, #F9F5F6 0%, #F8E8EE 100%)',
    valueColor: '#C4A4B0',
    subColor: '#D4B8C0',
    border: 'rgba(242,190,209,0.3)',
  },
]

export default function StatsGrid({ stats }) {
  const { pct, doneRounds, totalRounds, completedTopics, totalTopics, startedTopics } = stats
  const pending = totalTopics - completedTopics - startedTopics

  const values = [
    { value: `${pct}%`,       sub: `${doneRounds} de ${totalRounds} vueltas` },
    { value: completedTopics, sub: `de ${totalTopics} temas` },
    { value: startedTopics,   sub: 'con vueltas parciales' },
    { value: pending,         sub: 'temas pendientes' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {CARDS.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl p-5"
          style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
            boxShadow: '0 2px 12px rgba(242,190,209,0.2)',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: card.subColor, marginBottom: 6 }}>
            {card.label}
          </p>
          <p style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', color: card.valueColor, lineHeight: 1.1 }}>
            {values[i].value}
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: card.subColor, marginTop: 3 }}>
            {values[i].sub}
          </p>
        </div>
      ))}
    </div>
  )
}
