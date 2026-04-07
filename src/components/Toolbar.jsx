const FILTERS = [
  { key: 'all',     label: 'Todos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'started', label: 'En progreso' },
  { key: 'done',    label: 'Completados' },
]

export default function Toolbar({ filter, onFilter, groupFilter, onGroupFilter, groups, focusMode, onFocusToggle }) {
  return (
    <div
      className="px-6 py-3 flex items-center gap-2 flex-wrap"
      style={{
        background: 'rgba(249,245,246,0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(242,190,209,0.2)',
      }}
    >
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onFilter(f.key)}
          className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-150"
          style={
            filter === f.key
              ? { background: '#1C1C1E', color: '#ffffff', border: '1px solid #1C1C1E' }
              : { background: '#F8E8EE', color: '#9B6B7E', border: '1px solid rgba(242,190,209,0.5)' }
          }
        >
          {f.label}
        </button>
      ))}

      <div className="w-px h-4 mx-1 flex-shrink-0" style={{ background: 'rgba(242,190,209,0.5)' }} />

      <select
        value={groupFilter}
        onChange={e => onGroupFilter(e.target.value)}
        className="text-xs rounded-full px-3 py-1 outline-none cursor-pointer transition-colors"
        style={{
          background: '#F8E8EE',
          color: '#9B6B7E',
          border: '1px solid rgba(242,190,209,0.5)',
        }}
      >
        <option value="">Todos los bloques</option>
        {groups.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      <button
        onClick={onFocusToggle}
        className="ml-auto px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-1.5"
        style={
          focusMode
            ? { background: '#F2BED1', color: '#7A3456', border: '1px solid #F2BED1' }
            : { background: '#F8E8EE', color: '#C07098', border: '1px solid rgba(242,190,209,0.5)' }
        }
      >
        ⚡ Focus
      </button>
    </div>
  )
}
