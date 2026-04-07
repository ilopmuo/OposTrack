import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useData } from './hooks/useData'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import StatsGrid from './components/StatsGrid'
import FocusPanel from './components/FocusPanel'
import GroupCard from './components/GroupCard'
import NotesModal from './components/NotesModal'

function AddGroupRow({ onCreate }) {
  const [adding, setAdding] = useState(false)
  const [value, setValue]   = useState('')

  function submit() {
    if (value.trim()) { onCreate(value.trim()); setValue(''); setAdding(false) }
  }

  if (adding) {
    return (
      <div
        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl"
        style={{
          background: '#ffffff',
          border: '1.5px solid #F2BED1',
          boxShadow: '0 4px 20px rgba(242,190,209,0.2)',
        }}
      >
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setAdding(false) }}
          placeholder="Nombre del bloque (Ej: Bloque I · Derecho Constitucional)"
          className="flex-1 text-sm outline-none placeholder:text-[#D4B8C0]"
          style={{ color: '#1C1C1E', background: 'transparent' }}
        />
        <button
          onClick={submit}
          className="text-xs font-medium px-4 py-1.5 rounded-xl transition-colors"
          style={{ background: '#F2BED1', color: '#7A3456' }}
        >
          Crear
        </button>
        <button
          onClick={() => setAdding(false)}
          className="text-xs transition-colors"
          style={{ color: '#D4B8C0' }}
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="w-full flex items-center gap-2.5 px-5 py-3.5 text-sm rounded-2xl transition-all duration-150"
      style={{
        background: 'transparent',
        border: '1.5px dashed rgba(242,190,209,0.5)',
        color: '#D4B8C0',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#F2BED1'
        e.currentTarget.style.color = '#C07098'
        e.currentTarget.style.background = '#FFF5F8'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(242,190,209,0.5)'
        e.currentTarget.style.color = '#D4B8C0'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <Plus size={15} />
      Añadir bloque
    </button>
  )
}

export default function App() {
  const {
    groups, loading,
    createGroup, renameGroup, deleteGroup,
    createTopic, renameTopic, deleteTopic,
    toggleRound, saveNotes,
    getGlobalStats, getGroupStats, getFocusSuggestions,
  } = useData()

  const [filter, setFilter]           = useState('all')
  const [groupFilter, setGroupFilter] = useState('')
  const [focusMode, setFocusMode]     = useState(false)
  const [notesTopic, setNotesTopic]   = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F5F6' }}>
        <p className="text-sm animate-pulse" style={{ color: '#D4B8C0' }}>Cargando…</p>
      </div>
    )
  }

  const stats            = getGlobalStats()
  const focusSuggestions = focusMode ? getFocusSuggestions() : []
  const focusTopicIds    = focusSuggestions.map(s => s.topic.id)
  const visibleGroups    = groupFilter ? groups.filter(g => g.id === groupFilter) : groups
  const isEmpty          = groups.length === 0

  return (
    <div className="min-h-screen" style={{ background: '#F9F5F6' }}>
      <Header stats={stats} />
      <Toolbar
        filter={filter}
        onFilter={setFilter}
        groupFilter={groupFilter}
        onGroupFilter={setGroupFilter}
        groups={groups}
        focusMode={focusMode}
        onFocusToggle={() => setFocusMode(m => !m)}
      />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {!isEmpty && <StatsGrid stats={stats} />}
        {focusMode && !isEmpty && <FocusPanel suggestions={focusSuggestions} />}

        {isEmpty && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-base font-semibold mb-1" style={{ color: '#6C4E5C' }}>
              Empieza creando tu primer bloque
            </p>
            <p className="text-sm mb-8" style={{ color: '#C4A4B0' }}>
              Organiza tus temas en bloques y marca las vueltas de estudio
            </p>
          </div>
        )}

        {visibleGroups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            stats={getGroupStats(group)}
            filter={filter}
            focusTopicIds={focusTopicIds}
            onToggleRound={toggleRound}
            onOpenNotes={setNotesTopic}
            onRenameGroup={renameGroup}
            onDeleteGroup={deleteGroup}
            onCreateTopic={createTopic}
            onRenameTopic={renameTopic}
            onDeleteTopic={deleteTopic}
          />
        ))}

        {!groupFilter && <AddGroupRow onCreate={createGroup} />}
      </main>

      <NotesModal
        topic={notesTopic}
        onSave={saveNotes}
        onClose={() => setNotesTopic(null)}
      />
    </div>
  )
}
