import { useState, useRef } from 'react'
import { ChevronRight, FileText, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { MAX_ROUNDS } from '../hooks/useData'

// Row tint per completion level
const ROW_BG = [
  'transparent',
  'rgba(253,206,223,0.08)',
  'rgba(253,206,223,0.16)',
  'rgba(242,190,209,0.24)',
  'rgba(242,190,209,0.38)',
]

function RoundButton({ done, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center"
      style={
        done
          ? { background: '#F2BED1', border: '1.5px solid #F2BED1', color: '#7A3456' }
          : { background: '#ffffff', border: '1.5px solid #F8E8EE', color: 'transparent' }
      }
      onMouseEnter={e => { if (!done) { e.currentTarget.style.borderColor = '#FDCEDF'; e.currentTarget.style.background = '#FFF5F8' } }}
      onMouseLeave={e => { if (!done) { e.currentTarget.style.borderColor = '#F8E8EE'; e.currentTarget.style.background = '#ffffff' } }}
    >
      ✓
    </button>
  )
}

function InlineEdit({ value, onSave, onCancel, placeholder = '' }) {
  const [val, setVal] = useState(value)

  function submit() {
    if (val.trim()) onSave(val.trim())
    else onCancel()
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel() }}
        placeholder={placeholder}
        className="flex-1 text-sm px-2.5 py-1 rounded-lg outline-none min-w-0"
        style={{ background: '#FFF5F8', border: '1.5px solid #F2BED1', color: '#1C1C1E' }}
      />
      <button onClick={submit} className="flex-shrink-0 transition-colors" style={{ color: '#C07098' }}>
        <Check size={14} />
      </button>
      <button onClick={onCancel} className="flex-shrink-0 transition-colors" style={{ color: '#D4B8C0' }}>
        <X size={14} />
      </button>
    </div>
  )
}

export default function GroupCard({
  group, stats, filter, focusTopicIds,
  onToggleRound, onOpenNotes,
  onRenameGroup, onDeleteGroup,
  onCreateTopic, onRenameTopic, onDeleteTopic,
}) {
  const [collapsed, setCollapsed]             = useState(false)
  const [editingGroupName, setEditingGroupName] = useState(false)
  const [editingTopicId, setEditingTopicId]   = useState(null)
  const [addingTopic, setAddingTopic]         = useState(false)
  const [confirmDelete, setConfirmDelete]     = useState(false)

  const visibleTopics = group.topics.filter(t => {
    const done = t.rounds.filter(Boolean).length
    if (filter === 'pending') return done === 0
    if (filter === 'started') return done > 0 && done < MAX_ROUNDS
    if (filter === 'done')    return done === MAX_ROUNDS
    return true
  })

  if (filter !== 'all' && visibleTopics.length === 0) return null

  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{
        background: '#ffffff',
        boxShadow: '0 2px 16px rgba(242,190,209,0.14), 0 1px 4px rgba(0,0,0,0.04)',
        border: '1px solid rgba(248,232,238,0.8)',
      }}
    >
      {/* ── Group header ── */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: '#FFF5F8', borderBottom: '1px solid rgba(242,190,209,0.2)' }}
      >
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex-shrink-0 transition-colors"
          style={{ color: '#D4B8C0' }}
        >
          <ChevronRight
            size={14}
            style={{ transition: 'transform 0.2s', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
          />
        </button>

        <div className="flex-1 min-w-0">
          {editingGroupName ? (
            <InlineEdit
              value={group.name}
              placeholder="Nombre del bloque"
              onSave={name => { onRenameGroup(group.id, name); setEditingGroupName(false) }}
              onCancel={() => setEditingGroupName(false)}
            />
          ) : (
            <span className="font-semibold text-sm" style={{ color: '#3C2030' }}>{group.name}</span>
          )}
        </div>

        {/* Mini progress */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: '#F8E8EE' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.pct}%`, background: 'linear-gradient(90deg, #FDCEDF, #F2BED1)' }}
            />
          </div>
          <span className="text-xs font-semibold w-7 text-right" style={{ color: '#C4A4B0' }}>
            {stats.pct}%
          </span>
        </div>

        {/* Actions */}
        {!editingGroupName && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => setEditingGroupName(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#D4B8C0' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#9B6B7E'; e.currentTarget.style.background = '#F8E8EE' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#D4B8C0'; e.currentTarget.style.background = 'transparent' }}
              title="Renombrar"
            >
              <Pencil size={12} />
            </button>

            {confirmDelete ? (
              <span className="flex items-center gap-1.5 text-xs ml-1" style={{ color: '#C07098' }}>
                ¿Eliminar?
                <button className="font-semibold hover:underline" onClick={() => onDeleteGroup(group.id)}>Sí</button>
                <button style={{ color: '#D4B8C0' }} className="hover:underline" onClick={() => setConfirmDelete(false)}>No</button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#D4B8C0' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C07098'; e.currentTarget.style.background = '#FDCEDF' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#D4B8C0'; e.currentTarget.style.background = 'transparent' }}
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
              <tr style={{ background: '#FFF9FB', borderBottom: '1px solid rgba(242,190,209,0.15)' }}>
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#D4B8C0' }}>
                  Tema
                </th>
                {Array.from({ length: MAX_ROUNDS }, (_, i) => (
                  <th key={i} className="px-1 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-center w-12" style={{ color: '#D4B8C0' }}>
                    V{i + 1}
                  </th>
                ))}
                <th className="w-10 text-center px-2 py-2.5" style={{ color: '#D4B8C0' }}>
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
                    className="group/row transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(248,232,238,0.6)',
                      background: isFocus ? 'rgba(253,206,223,0.15)' : ROW_BG[doneCount],
                    }}
                  >
                    <td className="px-5 py-2.5 text-[13px]" style={{ color: '#3C2030' }}>
                      {editingTopicId === topic.id ? (
                        <InlineEdit
                          value={topic.name}
                          placeholder="Nombre del tema"
                          onSave={name => { onRenameTopic(topic.id, name); setEditingTopicId(null) }}
                          onCancel={() => setEditingTopicId(null)}
                        />
                      ) : (
                        <span
                          className="cursor-default transition-colors"
                          onDoubleClick={() => setEditingTopicId(topic.id)}
                          title="Doble clic para editar"
                        >
                          {topic.name}
                        </span>
                      )}
                    </td>

                    {topic.rounds.map((done, r) => (
                      <td key={r} className="px-1 py-2 text-center">
                        <RoundButton done={done} onClick={() => onToggleRound(topic.id, r)} />
                      </td>
                    ))}

                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => onOpenNotes(topic)}
                        title={topic.notes ? 'Ver nota' : 'Añadir nota'}
                        className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-colors"
                        style={
                          topic.notes
                            ? { background: '#FDCEDF', border: '1px solid #F2BED1', color: '#9B4569' }
                            : { background: 'transparent', border: '1px solid #F8E8EE', color: '#D4B8C0' }
                        }
                        onMouseEnter={e => { if (!topic.notes) { e.currentTarget.style.borderColor = '#FDCEDF'; e.currentTarget.style.color = '#C07098' } }}
                        onMouseLeave={e => { if (!topic.notes) { e.currentTarget.style.borderColor = '#F8E8EE'; e.currentTarget.style.color = '#D4B8C0' } }}
                      >
                        <FileText size={12} />
                      </button>
                    </td>

                    <td className="px-1 py-2 text-center">
                      <button
                        onClick={() => onDeleteTopic(topic.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-150 opacity-0 group-hover/row:opacity-100"
                        style={{ color: '#D4B8C0' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#C07098'; e.currentTarget.style.background = '#FDCEDF' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#D4B8C0'; e.currentTarget.style.background = 'transparent' }}
                        title="Eliminar tema"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {/* Add topic */}
              {filter === 'all' && (
                <tr style={{ borderTop: '1px dashed rgba(242,190,209,0.4)' }}>
                  <td colSpan={MAX_ROUNDS + 3} className="px-5 py-2.5">
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
                        className="flex items-center gap-1.5 text-xs transition-colors"
                        style={{ color: '#D4B8C0' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#C07098' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#D4B8C0' }}
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
