import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Pencil, Trash2, Check, X } from 'lucide-react'

export default function ExamSelector({ exams, selected, onSelect, onCreate, onRename, onDelete }) {
  const [open, setOpen]       = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName]   = useState('')
  const ref     = useRef()
  const inputRef = useRef()
  const editRef  = useRef()

  // Close on outside click
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { if (creating) inputRef.current?.focus() }, [creating])
  useEffect(() => { if (editingId) editRef.current?.focus() }, [editingId])

  function submitCreate() {
    if (newName.trim()) { onCreate(newName.trim()); setNewName(''); setCreating(false) }
  }

  function submitEdit(id) {
    if (editName.trim()) onRename(id, editName.trim())
    setEditingId(null)
  }

  function startEdit(e, exam) {
    e.stopPropagation()
    setEditingId(exam.id)
    setEditName(exam.name)
  }

  function handleDelete(e, id) {
    e.stopPropagation()
    if (confirm('¿Eliminar este examen? Se borrarán todos sus bloques y temas.')) {
      onDelete(id)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-150"
        style={{
          fontWeight: 700,
          background: 'rgba(255,255,255,0.55)',
          color: '#7A2848',
          border: '1.5px solid rgba(242,190,209,0.6)',
          maxWidth: 200,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.55)'}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          📋 {selected?.name ?? 'Sin examen'}
        </span>
        <ChevronDown size={12} style={{ flexShrink: 0, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 100,
            minWidth: 240,
            background: 'rgba(255,245,248,0.97)',
            border: '1.5px solid rgba(242,190,209,0.7)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(122,40,72,0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Exam list */}
          <div style={{ maxHeight: 280, overflowY: 'auto', padding: '6px 6px 4px' }}>
            {exams.map(exam => (
              <div key={exam.id}>
                {editingId === exam.id ? (
                  <div className="flex items-center gap-1.5 px-2 py-1.5">
                    <input
                      ref={editRef}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') submitEdit(exam.id); if (e.key === 'Escape') setEditingId(null) }}
                      className="flex-1 text-xs outline-none rounded-lg px-2 py-1"
                      style={{
                        background: 'rgba(255,255,255,0.8)',
                        border: '1.5px solid rgba(242,190,209,0.8)',
                        color: '#2D1B24',
                        fontFamily: 'inherit',
                        fontWeight: 600,
                      }}
                    />
                    <button onClick={() => submitEdit(exam.id)} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#7A2848', color: '#fff' }}>
                      <Check size={10} strokeWidth={3} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'rgba(242,190,209,0.4)', color: '#9B4569' }}>
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: selected?.id === exam.id ? 'rgba(122,40,72,0.08)' : 'transparent',
                    }}
                    onClick={() => { onSelect(exam.id); setOpen(false) }}
                    onMouseEnter={e => { if (selected?.id !== exam.id) e.currentTarget.style.background = 'rgba(242,190,209,0.25)' }}
                    onMouseLeave={e => { if (selected?.id !== exam.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {selected?.id === exam.id && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7A2848', flexShrink: 0 }} />
                      )}
                      <span style={{
                        fontSize: 13,
                        fontWeight: selected?.id === exam.id ? 800 : 600,
                        color: selected?.id === exam.id ? '#7A2848' : '#4A2030',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {exam.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={e => startEdit(e, exam)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ color: '#C4A4B0' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#9B4569'}
                        onMouseLeave={e => e.currentTarget.style.color = '#C4A4B0'}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={e => handleDelete(e, exam.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ color: '#C4A4B0' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#e05070'}
                        onMouseLeave={e => e.currentTarget.style.color = '#C4A4B0'}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(242,190,209,0.5)', margin: '2px 0' }} />

          {/* Create new */}
          <div style={{ padding: '4px 6px 6px' }}>
            {creating ? (
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <input
                  ref={inputRef}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitCreate(); if (e.key === 'Escape') { setCreating(false); setNewName('') } }}
                  placeholder="Nombre del examen…"
                  className="flex-1 text-xs outline-none rounded-lg px-2 py-1"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1.5px solid rgba(242,190,209,0.8)',
                    color: '#2D1B24',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                  }}
                />
                <button onClick={submitCreate} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#7A2848', color: '#fff' }}>
                  <Check size={10} strokeWidth={3} />
                </button>
                <button onClick={() => { setCreating(false); setNewName('') }} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'rgba(242,190,209,0.4)', color: '#9B4569' }}>
                  <X size={10} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
                style={{ color: '#9B4569', fontWeight: 700, background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(242,190,209,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Plus size={13} />
                Nuevo examen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
