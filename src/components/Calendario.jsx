import { useState, useRef, useEffect } from 'react'
import { useCalendarTasks } from '../hooks/useCalendarTasks'
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, X, Pencil } from 'lucide-react'

const MONTH_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DOW_ES   = ['L','M','X','J','V','S','D']

function pad(n) { return String(n).padStart(2, '0') }
function dateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function sameDay(a, b) { return dateStr(a) === dateStr(b) }

function getDaysGrid(year, month) {
  // Grid Mon–Sun, padded with nulls
  const first   = new Date(year, month, 1)
  const last    = new Date(year, month + 1, 0)
  const startDow = (first.getDay() + 6) % 7  // Mon=0
  const rows    = []
  let day       = 1 - startDow
  while (day <= last.getDate()) {
    const week = []
    for (let i = 0; i < 7; i++, day++) {
      if (day < 1 || day > last.getDate()) week.push(null)
      else week.push(new Date(year, month, day))
    }
    rows.push(week)
  }
  return rows
}

// ── Add-task inline input ────────────────────────────────────────────────────
function AddTaskInput({ onAdd, onCancel }) {
  const [val, setVal] = useState('')
  const ref = useRef()

  useEffect(() => { ref.current?.focus() }, [])

  function submit() {
    if (val.trim()) { onAdd(val.trim()); setVal('') }
  }

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') onCancel()
        }}
        placeholder="Nueva tarea…"
        className="flex-1 text-xs outline-none rounded-lg px-2 py-1"
        style={{
          background: 'rgba(255,255,255,0.7)',
          border: '1.5px solid rgba(242,190,209,0.8)',
          color: '#2D1B24',
          fontFamily: 'inherit',
          fontWeight: 600,
        }}
      />
      <button
        onClick={submit}
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: '#7A2848', color: '#fff' }}
      >
        <Check size={11} strokeWidth={3} />
      </button>
      <button
        onClick={onCancel}
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(242,190,209,0.4)', color: '#9B4569' }}
      >
        <X size={11} strokeWidth={3} />
      </button>
    </div>
  )
}

// ── Single task row ──────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(task.text)
  const ref = useRef()

  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  function submitEdit() {
    if (val.trim() && val.trim() !== task.text) onEdit(task.id, val.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={ref}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') { setVal(task.text); setEditing(false) } }}
          className="flex-1 text-xs outline-none rounded-lg px-2 py-0.5"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1.5px solid rgba(242,190,209,0.8)',
            color: '#2D1B24',
            fontFamily: 'inherit',
            fontWeight: 600,
          }}
        />
        <button onClick={submitEdit} className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#7A2848', color: '#fff' }}>
          <Check size={9} strokeWidth={3} />
        </button>
      </div>
    )
  }

  return (
    <div
      className="group flex items-start gap-2 rounded-lg px-1.5 py-1 transition-all"
      style={{ background: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, task.done)}
        className="shrink-0 mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all"
        style={{
          border: `1.5px solid ${task.done ? '#7A2848' : 'rgba(242,190,209,0.9)'}`,
          background: task.done ? '#7A2848' : 'transparent',
        }}
      >
        {task.done && <Check size={9} color="#fff" strokeWidth={3} />}
      </button>

      {/* Text */}
      <span
        className="flex-1 text-xs leading-snug"
        style={{
          color: task.done ? '#C4A4B0' : '#2D1B24',
          textDecoration: task.done ? 'line-through' : 'none',
          fontWeight: 600,
          wordBreak: 'break-word',
        }}
      >
        {task.text}
      </span>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ color: '#C4A4B0' }}
          onMouseEnter={e => e.currentTarget.style.color = '#9B4569'}
          onMouseLeave={e => e.currentTarget.style.color = '#C4A4B0'}
        >
          <Pencil size={10} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ color: '#C4A4B0' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e05070'}
          onMouseLeave={e => e.currentTarget.style.color = '#C4A4B0'}
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  )
}

// ── Day detail panel (right sidebar) ────────────────────────────────────────
function DayPanel({ date, tasks, onAdd, onToggle, onDelete, onEdit, onClose }) {
  const [adding, setAdding] = useState(false)

  const today  = new Date()
  const isToday = sameDay(date, today)

  const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' })
  const label   = `${dayName.charAt(0).toUpperCase()}${dayName.slice(1)}, ${date.getDate()} de ${MONTH_ES[date.getMonth()]}`

  const done    = tasks.filter(t => t.done).length
  const pending = tasks.filter(t => !t.done).length

  return (
    <div
      className="flex flex-col"
      style={{
        width: 300,
        minWidth: 300,
        background: 'rgba(255,255,255,0.6)',
        borderLeft: '1.5px solid rgba(242,190,209,0.55)',
        borderRadius: '0 20px 20px 0',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start justify-between"
        style={{ borderBottom: '1px solid rgba(242,190,209,0.4)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ fontSize: 22, fontWeight: 900, color: '#7A2848', letterSpacing: '-0.5px' }}>
              {date.getDate()}
            </span>
            {isToday && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#7A2848', color: '#fff', fontWeight: 700 }}>
                Hoy
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#C4A4B0' }}>{label}</p>
          {tasks.length > 0 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9B4569', marginTop: 4 }}>
              {pending} pendiente{pending !== 1 ? 's' : ''} · {done} hecha{done !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ color: '#C4A4B0', background: 'rgba(242,190,209,0.3)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#7A2848'; e.currentTarget.style.background = 'rgba(242,190,209,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#C4A4B0'; e.currentTarget.style.background = 'rgba(242,190,209,0.3)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto px-3 py-3" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {tasks.length === 0 && !adding && (
          <p style={{ fontSize: 12, fontWeight: 600, color: '#D4B8C0', textAlign: 'center', paddingTop: 20 }}>
            Sin tareas para este día
          </p>
        )}
        <div className="flex flex-col gap-0.5">
          {tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
        {adding && (
          <div className="mt-1">
            <AddTaskInput onAdd={t => { onAdd(date, t); setAdding(false) }} onCancel={() => setAdding(false)} />
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="px-3 pb-4 pt-2" style={{ borderTop: '1px solid rgba(242,190,209,0.3)' }}>
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-all"
          style={{
            background: adding ? 'rgba(255,255,255,0.5)' : '#7A2848',
            color: adding ? '#9B4569' : '#fff',
            fontWeight: 700,
            border: adding ? '1.5px dashed rgba(242,190,209,0.6)' : 'none',
          }}
        >
          <Plus size={13} />
          Añadir tarea
        </button>
      </div>
    </div>
  )
}

// ── Main Calendar component ──────────────────────────────────────────────────
export default function Calendario({ userId }) {
  const today   = new Date()
  const [year, setYear]     = useState(today.getFullYear())
  const [month, setMonth]   = useState(today.getMonth())
  const [selected, setSelected] = useState(today)

  const { tasks, loading, tasksForDay, addTask, toggleTask, deleteTask, editTask } =
    useCalendarTasks(userId, year, month)

  const grid = getDaysGrid(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  // Keep selected in view when changing months
  function selectDay(day) {
    setSelected(day)
    if (day.getMonth() !== month) {
      setYear(day.getFullYear())
      setMonth(day.getMonth())
    }
  }

  const selectedTasks = selected ? tasksForDay(selected) : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Month header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ color: '#C4A4B0', background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(242,190,209,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#7A2848'; e.currentTarget.style.background = 'rgba(255,255,255,0.85)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#C4A4B0'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
          >
            <ChevronLeft size={16} />
          </button>

          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#7A2848', letterSpacing: '-0.5px', minWidth: 220 }}>
            {MONTH_ES[month]} <span style={{ color: '#D4B8C0', fontWeight: 700 }}>{year}</span>
          </h2>

          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ color: '#C4A4B0', background: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(242,190,209,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#7A2848'; e.currentTarget.style.background = 'rgba(255,255,255,0.85)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#C4A4B0'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => { const t = new Date(); setYear(t.getFullYear()); setMonth(t.getMonth()); setSelected(t) }}
          className="text-xs px-3.5 py-1.5 rounded-full transition-all"
          style={{ background: 'rgba(255,255,255,0.55)', color: '#9B4569', border: '1.5px solid rgba(242,190,209,0.6)', fontWeight: 700 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.55)'}
        >
          Hoy
        </button>
      </div>

      {/* Calendar + panel */}
      <div
        className="flex rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.45)',
          border: '1.5px solid rgba(242,190,209,0.55)',
          boxShadow: '0 4px 32px rgba(192,96,144,0.08)',
        }}
      >
        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Day-of-week headers */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '1px solid rgba(242,190,209,0.4)',
              padding: '12px 16px 10px',
            }}
          >
            {DOW_ES.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#C4A4B0', letterSpacing: '0.06em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div style={{ padding: '8px 16px 16px' }}>
            {grid.map((week, wi) => (
              <div key={wi} className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: wi < grid.length - 1 ? 4 : 0 }}>
                {week.map((day, di) => {
                  if (!day) return <div key={di} />

                  const isToday    = sameDay(day, today)
                  const isSelected = selected && sameDay(day, selected)
                  const isWeekend  = di >= 5
                  const dayTasks   = tasksForDay(day)
                  const hasTasks   = dayTasks.length > 0
                  const allDone    = hasTasks && dayTasks.every(t => t.done)
                  const someDone   = hasTasks && dayTasks.some(t => t.done) && !allDone

                  return (
                    <button
                      key={di}
                      onClick={() => selectDay(day)}
                      className="flex flex-col items-center rounded-xl py-2 px-1 transition-all duration-100"
                      style={{
                        minHeight: 64,
                        background: isSelected
                          ? '#7A2848'
                          : isToday
                            ? 'rgba(122,40,72,0.1)'
                            : 'transparent',
                        border: isToday && !isSelected
                          ? '1.5px solid rgba(122,40,72,0.3)'
                          : '1.5px solid transparent',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.7)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'rgba(122,40,72,0.1)' : 'transparent' }}
                    >
                      {/* Day number */}
                      <span style={{
                        fontSize: 14,
                        fontWeight: isToday || isSelected ? 900 : 600,
                        color: isSelected ? '#fff' : isToday ? '#7A2848' : isWeekend ? '#C4A4B0' : '#2D1B24',
                        lineHeight: 1,
                        marginBottom: 4,
                      }}>
                        {day.getDate()}
                      </span>

                      {/* Task preview */}
                      {hasTasks && (
                        <div className="flex flex-col gap-0.5 w-full px-1">
                          {dayTasks.slice(0, 3).map((t, ti) => (
                            <div
                              key={ti}
                              className="rounded text-left px-1"
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                lineHeight: '14px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                background: isSelected
                                  ? 'rgba(255,255,255,0.2)'
                                  : allDone ? 'rgba(122,40,72,0.08)' : 'rgba(242,190,209,0.5)',
                                color: isSelected ? 'rgba(255,255,255,0.85)' : t.done ? '#C4A4B0' : '#7A2848',
                                textDecoration: t.done ? 'line-through' : 'none',
                              }}
                            >
                              {t.text}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: isSelected ? 'rgba(255,255,255,0.6)' : '#C4A4B0' }}>
                              +{dayTasks.length - 3} más
                            </span>
                          )}
                        </div>
                      )}

                      {/* Dot if tasks but no preview space */}
                      {!hasTasks && loading && (
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(242,190,209,0.4)' }} />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Day panel */}
        {selected && (
          <DayPanel
            date={selected}
            tasks={selectedTasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  )
}
