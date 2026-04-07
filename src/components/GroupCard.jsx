import { useState, useRef } from 'react'
import { ChevronRight, FileText, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { MAX_ROUNDS } from '../hooks/useData'

const ROW_TINT = ['', 'bg-green-50/20', 'bg-green-50/40', 'bg-green-50/60', 'bg-green-50/80']

function RoundButton({ done, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-md border-2 text-sm font-bold transition-all duration-100 flex items-center justify-center
        ${done
          ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
          : 'border-slate-200 bg-white text-transparent hover:border-indigo-400 hover:bg-indigo-50'
        }`}
    >✓</button>
  )
}

function InlineEdit({ value, onSave, onCancel, placeholder = '' }) {
  const [val, setVal] = useState(value)
  const inputRef = useRef(null)

  function submit() {
    if (val.trim()) onSave(val.trim())
    else onCancel()
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel() }}
        placeholder={placeholder}
        className="flex-1 text-sm px-2 py-0.5 border border-indigo-400 rounded outline-none bg-white min-w-0"
      />
      <button onClick={submit} className="text-green-600 hover:text-green-700 flex-shrink-0"><Check size={14} /></button>
      <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 flex-shrink-0"><X size={14} /></button>
    </div>
  )
}

export default function GroupCard({
  group, stats, filter, focusTopicIds,
  onToggleRound, onOpenNotes,
  onRenameGroup, onDeleteGroup,
  onCreateTopic, onRenameTopic, onDeleteTopic,
}) {
  const [collapsed, setCollapsed]       = useState(false)
  const [editingGroupName, setEditingGroupName] = useState(false)
  const [editingTopicId, setEditingTopicId]     = useState(null)
  const [addingTopic, setAddingTopic]           = useState(false)
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false)

  const visibleTopics = group.topics.filter(t => {
    const done = t.rounds.filter(Boolean).length
    if (filter === 'pending') return done === 0
    if (filter === 'started') return done > 0 && done < MAX_ROUNDS
    if (filter === 'done')    return done === MAX_ROUNDS
    return true
  })

  if (filter !== 'all' && visibleTopics.length === 0) return null

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-3">
      {/* ── Group header ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border-b border-slate-200">
        <button onClick={() => setCollapsed(c => !c)} className="flex-shrink-0 p-0.5 hover:text-indigo-600 text-slate-400 transition-colors">
          <ChevronRight size={14} className={`transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`} />
        </button>

        {/* Group name (editable) */}
        <div className="flex-1 min-w-0">
          {editingGroupName ? (
            <InlineEdit
              value={group.name}
              placeholder="Nombre del bloque"
              onSave={name => { onRenameGroup(group.id, name); setEditingGroupName(false) }}
              onCancel={() => setEditingGroupName(false)}
            />
          ) : (
            <span className="font-semibold text-sm text-slate-700">{group.name}</span>
          )}
        </div>

        {/* Mini progress */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${stats.pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-400 w-7 text-right">{stats.pct}%</span>
        </div>

        {/* Group actions */}
        {!editingGroupName && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setEditingGroupName(true)}
              className="p-1 rounded text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
              title="Renombrar bloque"
            >
              <Pencil size={12} />
            </button>
            {confirmDeleteGroup ? (
              <span className="flex items-center gap-1 text-xs text-red-600">
                ¿Eliminar?
                <button onClick={() => onDeleteGroup(group.id)} className="font-semibold hover:underline">Sí</button>
                <button onClick={() => setConfirmDeleteGroup(false)} className="text-slate-400 hover:underline">No</button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDeleteGroup(true)}
                className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Eliminar bloque"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Topics table ── */}
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
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {(filter === 'all' ? group.topics : visibleTopics).map(topic => {
                const doneCount = topic.rounds.filter(Boolean).length
                const isFocus   = focusTopicIds.includes(topic.id)

                return (
                  <tr
                    key={topic.id}
                    className={`border-b border-slate-50 last:border-0 group/row transition-colors
                      ${isFocus ? 'bg-amber-50/70 hover:bg-amber-50' : `${ROW_TINT[doneCount]} hover:bg-slate-50`}`}
                  >
                    {/* Topic name */}
                    <td className="px-4 py-2 text-[13px] text-slate-700">
                      {editingTopicId === topic.id ? (
                        <InlineEdit
                          value={topic.name}
                          placeholder="Nombre del tema"
                          onSave={name => { onRenameTopic(topic.id, name); setEditingTopicId(null) }}
                          onCancel={() => setEditingTopicId(null)}
                        />
                      ) : (
                        <span
                          className="cursor-pointer hover:text-indigo-600 transition-colors"
                          onDoubleClick={() => setEditingTopicId(topic.id)}
                          title="Doble clic para editar"
                        >
                          {topic.name}
                        </span>
                      )}
                    </td>

                    {/* Round buttons */}
                    {topic.rounds.map((done, r) => (
                      <td key={r} className="px-1 py-2 text-center">
                        <RoundButton done={done} onClick={() => onToggleRound(topic.id, r)} />
                      </td>
                    ))}

                    {/* Notes */}
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

                    {/* Delete topic (visible on hover) */}
                    <td className="px-1 py-2 text-center">
                      <button
                        onClick={() => onDeleteTopic(topic.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/row:opacity-100"
                        title="Eliminar tema"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {/* ── Add topic row ── */}
              {filter === 'all' && (
                <tr className="border-t border-dashed border-slate-200">
                  <td colSpan={MAX_ROUNDS + 3} className="px-4 py-2">
                    {addingTopic ? (
                      <InlineEdit
                        value=""
                        placeholder="Nombre del tema (Ej: Tema 1. La Constitución…)"
                        onSave={name => { onCreateTopic(group.id, name); setAddingTopic(false) }}
                        onCancel={() => setAddingTopic(false)}
                      />
                    ) : (
                      <button
                        onClick={() => setAddingTopic(true)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Plus size={13} />
                        Añadir tema
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
