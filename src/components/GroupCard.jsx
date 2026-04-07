import { useState } from 'react'
import { ChevronRight, FileText } from 'lucide-react'
import { MAX_ROUNDS } from '../hooks/useData'

// Row background tint based on completion
const ROW_TINT = [
  '',
  'bg-green-50/20',
  'bg-green-50/40',
  'bg-green-50/60',
  'bg-green-50/80',
]

function RoundButton({ done, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-md border-2 text-sm font-bold transition-all duration-100 flex items-center justify-center
        ${done
          ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
          : 'border-slate-200 bg-white text-transparent hover:border-indigo-400 hover:bg-indigo-50'
        }`}
    >
      ✓
    </button>
  )
}

export default function GroupCard({ group, stats, filter, focusTopicIds, onToggleRound, onOpenNotes }) {
  const [collapsed, setCollapsed] = useState(false)

  const visibleTopics = group.topics.filter(t => {
    const done = t.rounds.filter(Boolean).length
    if (filter === 'pending') return done === 0
    if (filter === 'started') return done > 0 && done < MAX_ROUNDS
    if (filter === 'done')    return done === MAX_ROUNDS
    return true
  })

  if (visibleTopics.length === 0) return null

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-3">
      {/* Group header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 hover:bg-indigo-50/40 transition-colors text-left"
      >
        <ChevronRight
          size={14}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`}
        />
        <span className="font-semibold text-sm text-slate-700 flex-1">{group.name}</span>

        {/* Mini progress */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-400 min-w-[30px] text-right">{stats.pct}%</span>
        </div>
      </button>

      {/* Topics table */}
      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tema</th>
                {Array.from({ length: MAX_ROUNDS }, (_, i) => (
                  <th key={i} className="px-1 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center w-12">
                    V{i + 1}
                  </th>
                ))}
                <th className="w-10 text-center px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <FileText size={11} className="inline" />
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleTopics.map(topic => {
                const doneCount = topic.rounds.filter(Boolean).length
                const isFocus   = focusTopicIds.includes(topic.id)

                return (
                  <tr
                    key={topic.id}
                    className={`border-b border-slate-50 last:border-0 transition-colors
                      ${isFocus ? 'bg-amber-50/70 hover:bg-amber-50' : `${ROW_TINT[doneCount]} hover:bg-slate-50`}`}
                  >
                    {/* Topic name */}
                    <td className="px-4 py-2.5 text-[13px] text-slate-700">
                      <span className="text-slate-300 text-[11px] font-semibold mr-1.5">
                        {topic.name.match(/^Tema \d+/)?.[0]}
                      </span>
                      {topic.name.replace(/^Tema \d+\.\s*/, '')}
                    </td>

                    {/* Round buttons */}
                    {topic.rounds.map((done, r) => (
                      <td key={r} className="px-1 py-2 text-center">
                        <RoundButton
                          done={done}
                          onClick={() => onToggleRound(topic.id, r)}
                        />
                      </td>
                    ))}

                    {/* Notes button */}
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => onOpenNotes(topic)}
                        title={topic.notes ? 'Ver/editar nota' : 'Añadir nota'}
                        className={`w-7 h-7 rounded-md border text-xs transition-colors flex items-center justify-center mx-auto
                          ${topic.notes
                            ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'border-slate-200 text-slate-300 hover:border-slate-300 hover:text-slate-400'
                          }`}
                      >
                        <FileText size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
