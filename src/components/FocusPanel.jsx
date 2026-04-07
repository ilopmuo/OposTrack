import { MAX_ROUNDS } from '../hooks/useData'

export default function FocusPanel({ suggestions }) {
  return (
    <div
      className="rounded-2xl p-4 mb-5"
      style={{
        background: 'linear-gradient(135deg, #F2BED1 0%, #FDCEDF 100%)',
        border: '1px solid rgba(242,190,209,0.7)',
        boxShadow: '0 4px 16px rgba(242,190,209,0.3)',
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 14, fontWeight: 900, color: '#7A2848', marginBottom: 2 }}>
          ✨ Temas prioritarios para hoy
        </p>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#C07098' }}>
          Los que llevas menos vueltas — empieza por estos
        </p>
      </div>

      {suggestions.length === 0 ? (
        <p style={{ fontSize: 13, fontWeight: 700, color: '#7A2848' }}>¡Todas las vueltas completadas! 🎉</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(({ topic, done }) => (
            <span
              key={topic.id}
              className="text-xs flex items-center gap-1.5"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.8)',
                borderRadius: 99,
                padding: '5px 12px',
                color: '#6C2840',
                fontWeight: 600,
              }}
            >
              <span style={{ fontWeight: 900, color: '#9B4569' }}>{done}/{MAX_ROUNDS}</span>
              {topic.name.split('.')[0]}. {topic.name.split('.').slice(1).join('.').trim().slice(0, 46)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
