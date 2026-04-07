import { useState } from 'react'
import { ChevronRight, FileText, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { MAX_ROUNDS } from '../hooks/useData'

const ROW_BG = [
  'transparent',
  'rgba(253,206,223,0.12)',
  'rgba(253,206,223,0.22)',
  'rgba(242,190,209,0.32)',
  'rgba(242,190,209,0.46)',
]

function RoundButton({ done, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-xl text-sm flex items-center justify-center transition-all duration-150"
      style={
        done
          ? { background: '#C06090', border: '1.5px solid #C06090', color: '#fff', fontWeight: 900 }
          : { background: '#FEF0F6', border: '1.5px solid #F2BED1', color: 'transparent', fontWeight: 900 }
      }
      onMouseEnter={e => { if (!done) { e.currentTarget.style.background = '#FDCEDF'; e.currentTarget.style.borderColor = '#C06090' } }}
      onMouseLeave={e => { if (!done) { e.currentTarget.style.background = '#FEF0F6'; e.currentTarget.style.borderColor = '#F2BED1' } }}
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
        className="flex-1 text-sm px-3 py-1 rounded-xl outline-none min-w-0"
        style={{
          background: '#FEF0F6',
          border: '1.5px solid #F2BED1',
          color: '#2D1B24',
          fontFamily: 'inherit',
          fontWeight: 600,
        }}
      />
      <button onClick={submit} style={{ color: '#C06090' }}><Check size={14} /></button>
      <button onClick={onCancel} style={{ color: '#D4B8C0' }}><X size={14} /></button>
    </div>
  )
}

export default function GroupCard({
  group, stats, filter, focusTopicIds,
  onToggleRound, onOpenNotes,
  onRenameGroup, onDeleteGroup,
  onCreateTopic, onRenameTopic, onDeleteTopic,
}) {
  const [collapsed, setCollapsed]               = useState(false)
  const [editingGroupName, setEditingGroupName] = useState(false)
  const [editingTopicId, setEditingTopicId]     = useState(null)
  const [addingTopic, setAddingTopic]           = useState(false)
  const [confirmDelete, setConfirmDelete]       = useState(false)

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
        background: '#FEF4F8',
        boxShadow: '0 4px 20px rgba(192,96,144,0.1), 0 1px 4px rgba(0,0,0,0.04)',
        border: '1px solid rgba(242,190,209,0.6)',
      }}
    >
      {/* ── Group header ── */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: '#FDCEDF', borderBottom: '1px solid rgba(242,190,209,0.5)' }}
      >
        <button onClick={() => setCollapsed(c => !c)} style={{ color: '#C07098', flexShrink: 0 }}>
          <ChevronRight
            size={15}
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
            <span style={{ fontWeight: 800, fontSize: 13, color: '#7A2848' }}>{group.name}</span>
          )}
        </div>

        {/* Mini progress */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.5)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.pct}%`, background: '#C06090' }}
            />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#9B4569', minWidth: 28, textAlign: 'right' }}>
            {stats.pct}%
          </span>
        </div>

        {/* Actions */}
        {!editingGroupName && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => setEditingGroupName(true)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: '#C07098' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <Pencil size={12} />
            </button>
            {confirmDelete ? (
              <span className="flex items-center gap-1.5 text-xs ml-1" style={{ color: '#7A2848', fontWeight: 700 }}>
                ¿Eliminar?
                <button className="underline" onClick={() => onDeleteGroup(group.id)}>Sí</button>
                <button style={{ color: '#C07098' }} className="underline" onClick={() => setConfirmDelete(false)}>No</button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: '#C07098' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
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
              <tr style={{ background: '#FEF4F8', borderBottom: '1px solid rgba(242,190,209,0.35)' }}>
                <th className="text-left px-5 py-2.5" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#C4A4B0' }}>
                  Tema
                </th>
                {Array.from({ length: MAX_ROUNDS }, (_, i) => (
                  <th key={i} className="px-1 py-2.5 text-center w-12" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#C4A4B0' }}>
                    V{i + 1}
                  </th>
                ))}
                <th className="w-10 text-center px-2 py-2.5" style={{ color: '#C4A4B0' }}>
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
                      borderBottom: '1px solid rgba(242,190,209,0.2)',
                      background: isFocus ? 'rgba(253,206,223,0.35)' : ROW_BG[doneCount],
                    }}
                    onMouseEnter={e => { if (!isFocus) e.currentTarget.style.background = 'rgba(253,206,223,0.18)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = isFocus ? 'rgba(253,206,223,0.35)' : ROW_BG[doneCount] }}
                  >
                    <td className="px-5 py-2.5" style={{ fontSize: 13, color: '#3C2030', fontWeight: 600 }}>
                      {editingTopicId === topic.id ? (
                        <InlineEdit
                          value={topic.name}
                          placeholder="Nombre del tema"
                          onSave={name => { onRenameTopic(topic.id, name); setEditingTopicId(null) }}
                          onCancel={() => setEditingTopicId(null)}
                        />
                      ) : (
                        <span
                          className="cursor-default"
                          onDoubleClick={() => setEditingTopicId(topic.id)}
                          title="Doble clic para editar"
                        >
                          {topic.name}
                        </span>
                      )}
                    </td>

                    {Array.from({ length: MAX_ROUNDS }, (_, r) => (
                      <td key={r} className="px-1 py-2 text-center">
                        <RoundButton done={topic.rounds[r] ?? false} onClick={() => onToggleRound(topic.id, r)} />
                      </td>
                    ))}

                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => onOpenNotes(topic)}
                        title={topic.notes ? 'Ver nota' : 'Añadir nota'}
                        className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all"
                        style={
                          topic.notes
                            ? { background: '#F2BED1', border: '1.5px solid #C06090', color: '#7A2848' }
                            : { background: 'transparent', border: '1.5px solid #F2BED1', color: '#D4B8C0' }
                        }
                        onMouseEnter={e => { if (!topic.notes) { e.currentTarget.style.background = '#FDCEDF'; e.currentTarget.style.color = '#C06090' } }}
                        onMouseLeave={e => { if (!topic.notes) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D4B8C0' } }}
                      >
                        <FileText size={12} />
                      </button>
                    </td>

                    <td className="px-1 py-2 text-center">
                      <button
                        onClick={() => onDeleteTopic(topic.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100"
                        style={{ color: '#D4B8C0' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#C06090'; e.currentTarget.style.background = '#FDCEDF' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#D4B8C0'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {/* Add topic */}
              {filter === 'all' && (
                <tr style={{ borderTop: '1px dashed rgba(242,190,209,0.5)' }}>
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
                        style={{ color: '#D4B8C0', fontWeight: 700 }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#C06090' }}
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
