import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useData } from './hooks/useData'
import AuthScreen from './components/AuthScreen'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import StatsGrid from './components/StatsGrid'
import FocusPanel from './components/FocusPanel'
import GroupCard from './components/GroupCard'
import NotesModal from './components/NotesModal'
import ImportModal from './components/ImportModal'
import Pomodoro from './components/Pomodoro'
import Calendario from './components/Calendario'

function AddGroupRow({ onCreate }) {
  const [adding, setAdding] = useState(false)
  const [value, setValue]   = useState('')

  function submit() {
    if (value.trim()) { onCreate(value.trim()); setValue(''); setAdding(false) }
  }

  if (adding) {
    return (
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl"
        style={{ background: '#FEF4F8', border: '1.5px solid #F2BED1', boxShadow: '0 4px 20px rgba(192,96,144,0.12)' }}
      >
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setAdding(false) }}
          placeholder="Nombre del bloque (Ej: Bloque I · Derecho Constitucional)"
          className="flex-1 text-sm outline-none"
          style={{ color: '#2D1B24', background: 'transparent', fontFamily: 'inherit', fontWeight: 600 }}
        />
        <button onClick={submit} className="px-4 py-1.5 text-xs rounded-xl" style={{ background: '#7A2848', color: '#fff', fontWeight: 700 }}>
          Crear
        </button>
        <button onClick={() => setAdding(false)} className="text-xs" style={{ color: '#C4A4B0', fontWeight: 600 }}>
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className="w-full flex items-center gap-2.5 px-5 py-4 text-sm rounded-2xl transition-all duration-150"
      style={{ background: 'transparent', border: '1.5px dashed rgba(242,190,209,0.6)', color: '#D4B8C0', fontWeight: 700 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#F2BED1'; e.currentTarget.style.color = '#C06090'; e.currentTarget.style.background = '#FEF4F8' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(242,190,209,0.6)'; e.currentTarget.style.color = '#D4B8C0'; e.currentTarget.style.background = 'transparent' }}
    >
      <Plus size={15} />
      Añadir bloque
    </button>
  )
}

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()

  const {
    groups, loading: dataLoading,
    createGroup, renameGroup, deleteGroup,
    createTopic, renameTopic, deleteTopic,
    toggleRound, saveNotes, importData,
    getGlobalStats, getGroupStats, getFocusSuggestions,
  } = useData(user?.id)

  const [tab, setTab]               = useState('tracker')
  const [filter, setFilter]         = useState('all')
  const [groupFilter, setGroupFilter] = useState('')
  const [focusMode, setFocusMode]   = useState(false)
  const [notesTopic, setNotesTopic] = useState(null)
  const [showImport, setShowImport] = useState(false)

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F5F6' }}>
        <p style={{ color: '#D4B8C0', fontWeight: 700, fontSize: 14 }} className="animate-pulse">Cargando…</p>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />
  }

  // Data loading
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F5F6' }}>
        <p style={{ color: '#D4B8C0', fontWeight: 700, fontSize: 14 }} className="animate-pulse">Cargando tus temas…</p>
      </div>
    )
  }

  const stats            = getGlobalStats()
  const focusSuggestions = focusMode ? getFocusSuggestions() : []
  const focusTopicIds    = focusSuggestions.map(s => s.topic.id)
  const visibleGroups    = groupFilter ? groups.filter(g => g.id === groupFilter) : groups
  const isEmpty          = groups.length === 0

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #F8E8EE 0%, #F9F5F6 40%)' }}>
      <Header
        stats={stats}
        userEmail={user.email}
        onSignOut={signOut}
        tab={tab}
        onTab={setTab}
      />

      {tab === 'pomodoro'   && <Pomodoro />}
      {tab === 'calendario' && <Calendario userId={user.id} />}

      {tab === 'tracker' && (
        <>
          <Toolbar
            filter={filter}
            onFilter={setFilter}
            groupFilter={groupFilter}
            onGroupFilter={setGroupFilter}
            groups={groups}
            focusMode={focusMode}
            onFocusToggle={() => setFocusMode(m => !m)}
            onImport={() => setShowImport(true)}
          />

          <main className="max-w-5xl mx-auto px-4 py-6">
            {!isEmpty && <StatsGrid stats={stats} />}
            {focusMode && !isEmpty && <FocusPanel suggestions={focusSuggestions} />}

            {isEmpty && (
              <div className="text-center py-20">
                <p style={{ fontSize: 52, marginBottom: 12 }}>🌸</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#7A2848', marginBottom: 6 }}>
                  Empieza creando tu primer bloque
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#C4A4B0', marginBottom: 28 }}>
                  Añádelos uno a uno o importa todos de golpe desde un CSV
                </p>
                <button
                  onClick={() => setShowImport(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm transition-all"
                  style={{ background: '#7A2848', color: '#fff', fontWeight: 800 }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#9B3A5A' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#7A2848' }}
                >
                  📥 Importar desde plantilla
                </button>
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

          <NotesModal topic={notesTopic} onSave={saveNotes} onClose={() => setNotesTopic(null)} />

          {showImport && (
            <ImportModal onImport={importData} onClose={() => setShowImport(false)} />
          )}
        </>
      )}
    </div>
  )
}
