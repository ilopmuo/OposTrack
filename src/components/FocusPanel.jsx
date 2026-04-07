import { MAX_ROUNDS } from '../hooks/useData'

export default function FocusPanel({ suggestions }) {
  return (
    <div
      className="rounded-2xl p-4 mb-5"
      style={{
        background: '#FFF5F8',
        border: '1px solid rgba(242,190,209,0.5)',
        boxShadow: '0 2px 12px rgba(242,190,209,0.12)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#C07098' }}>
        ⚡ Modo Focus — Estudia esto ahora
      </p>

      {suggestions.length === 0 ? (
        <p className="text-sm font-medium" style={{ color: '#7A6B7E' }}>
          ¡Todas las vueltas completadas! 🎉
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(({ topic, done }) => (
            <span
              key={topic.id}
              className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(242,190,209,0.6)',
                color: '#6C4E5C',
              }}
            >
              <span className="font-bold" style={{ color: '#C07098' }}>{done}/{MAX_ROUNDS}</span>
              {topic.name.split('.')[0]?.trim()}. {topic.name.split('.').slice(1).join('.').trim().slice(0, 48)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
