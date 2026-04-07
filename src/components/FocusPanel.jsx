import { MAX_ROUNDS } from '../hooks/useData'

export default function FocusPanel({ suggestions }) {
  if (suggestions.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm text-green-700 font-medium">
        ¡Todas las vueltas completadas! 🎉
      </div>
    )
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-3">
        ⚡ Modo Focus — Estudia esto ahora
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(({ topic, done }) => (
          <span
            key={topic.id}
            className="bg-white border border-amber-200 rounded-md px-3 py-1.5 text-xs text-slate-700 flex items-center gap-1.5"
          >
            <span className="font-bold text-amber-600">{done}/{MAX_ROUNDS}</span>
            <span>{topic.name.split('.')[0]?.trim()}. {topic.name.split('.').slice(1).join('.').trim().slice(0, 50)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
