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
      <div className="flex items-center gap-2 px-4 py-3 bg-white border border-indigo-300 rounded-lg shadow-sm">
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setAdding(false) }}
          placeholder="Nombre del bloque (Ej: Bloque I · Derecho Constitucional)"
          className="flex-1 text-sm outline-none placeholder:text-slate-300"
        />
        <button onClick={submit} className="text-xs font-semibold px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          Crear
        </button>
        <button onClick={() => setAdding(false)} className="text-xs text-slate-400 hover:text-slate-600">
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-300 hover:text-indigo-500 transition-colors"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Cargando…</div>
      </div>
    )
  }

  const stats            = getGlobalStats()
  const focusSuggestions = focusMode ? getFocusSuggestions() : []
  const focusTopicIds    = focusSuggestions.map(s => s.topic.id)
  const visibleGroups    = groupFilter ? groups.filter(g => g.id === groupFilter) : groups

  const isEmpty = groups.length === 0

  return (
    <div className="min-h-screen bg-slate-100">
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

      <main className="max-w-5xl mx-auto px-4 py-5">
        {!isEmpty && <StatsGrid stats={stats} />}
        {focusMode && !isEmpty && <FocusPanel suggestions={focusSuggestions} />}

        {isEmpty ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-base font-medium text-slate-500 mb-1">Empieza creando tu primer bloque</p>
            <p className="text-sm mb-6">Organiza tus temas en bloques y marca las vueltas de estudio</p>
          </div>
        ) : (
          visibleGroups.map(group => (
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
          ))
        )}

        {/* Only show "add group" when not filtering */}
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
