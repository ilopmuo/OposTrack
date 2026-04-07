const FILTERS = [
  { key: 'all',     label: 'Todos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'started', label: 'En progreso' },
  { key: 'done',    label: 'Completados' },
]

export default function Toolbar({ filter, onFilter, groupFilter, onGroupFilter, groups, focusMode, onFocusToggle, onImport }) {
  return (
    <div
      className="px-6 py-3 flex items-center gap-2 flex-wrap"
      style={{
        background: '#FDCEDF',
        borderBottom: '1px solid rgba(242,190,209,0.6)',
      }}
    >
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onFilter(f.key)}
          className="px-3.5 py-1.5 rounded-full text-xs transition-all duration-150"
          style={{
            fontWeight: 700,
            ...(filter === f.key
              ? { background: '#7A2848', color: '#ffffff', border: '1.5px solid #7A2848' }
              : { background: 'rgba(255,255,255,0.55)', color: '#9B4569', border: '1.5px solid rgba(242,190,209,0.6)' })
          }}
        >
          {f.label}
        </button>
      ))}

      <div className="w-px h-4 mx-1 flex-shrink-0" style={{ background: 'rgba(242,190,209,0.7)' }} />

      <select
        value={groupFilter}
        onChange={e => onGroupFilter(e.target.value)}
        className="text-xs rounded-full px-3.5 py-1.5 outline-none cursor-pointer"
        style={{
          fontWeight: 700,
          fontFamily: 'inherit',
          background: 'rgba(255,255,255,0.55)',
          color: '#9B4569',
          border: '1.5px solid rgba(242,190,209,0.6)',
        }}
      >
        <option value="">Todos los bloques</option>
        {groups.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      <button
        onClick={onImport}
        className="px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-150"
        style={{ fontWeight: 700, background: 'rgba(255,255,255,0.55)', color: '#9B4569', border: '1.5px solid rgba(242,190,209,0.6)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.55)' }}
      >
        📥 Importar
      </button>

      <button
        onClick={onFocusToggle}
        className="ml-auto px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-150"
        title="Te muestra los temas que llevas menos vueltas para que sepas qué repasar primero"
        style={{
          fontWeight: 700,
          ...(focusMode
            ? { background: '#7A2848', color: '#fff', border: '1.5px solid #7A2848' }
            : { background: 'rgba(255,255,255,0.55)', color: '#9B4569', border: '1.5px solid rgba(242,190,209,0.6)' })
        }}
      >
        ✨ ¿Qué estudio hoy?
      </button>
    </div>
  )
}
