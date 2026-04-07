import { useState } from 'react'
import { useData } from './hooks/useData'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import StatsGrid from './components/StatsGrid'
import FocusPanel from './components/FocusPanel'
import GroupCard from './components/GroupCard'
import NotesModal from './components/NotesModal'

export default function App() {
  const { groups, loading, toggleRound, saveNotes, getGlobalStats, getGroupStats, getFocusSuggestions } = useData()

  const [filter, setFilter]           = useState('all')
  const [groupFilter, setGroupFilter] = useState('')
  const [focusMode, setFocusMode]     = useState(false)
  const [notesTopic, setNotesTopic]   = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Cargando temas…</div>
      </div>
    )
  }

  const stats = getGlobalStats()
  const focusSuggestions = focusMode ? getFocusSuggestions() : []
  const focusTopicIds    = focusSuggestions.map(s => s.topic.id)

  const visibleGroups = groupFilter
    ? groups.filter(g => g.id === groupFilter)
    : groups

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
        <StatsGrid stats={stats} />

        {focusMode && <FocusPanel suggestions={focusSuggestions} />}

        {visibleGroups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            stats={getGroupStats(group)}
            filter={filter}
            focusTopicIds={focusTopicIds}
            onToggleRound={toggleRound}
            onOpenNotes={setNotesTopic}
          />
        ))}

        {visibleGroups.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-16">
            No hay temas que coincidan con el filtro.
          </p>
        )}
      </main>

      <NotesModal
        topic={notesTopic}
        onSave={saveNotes}
        onClose={() => setNotesTopic(null)}
      />
    </div>
  )
}
