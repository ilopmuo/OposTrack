const FILTERS = [
  { key: 'all',     label: 'Todos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'started', label: 'En progreso' },
  { key: 'done',    label: 'Completados' },
]

export default function Toolbar({ filter, onFilter, groupFilter, onGroupFilter, groups, focusMode, onFocusToggle }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 flex-wrap">
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onFilter(f.key)}
          className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
            filter === f.key
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          {f.label}
        </button>
      ))}

      <div className="w-px h-4 bg-slate-200 mx-1 flex-shrink-0" />

      <select
        value={groupFilter}
        onChange={e => onGroupFilter(e.target.value)}
        className="text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-500 bg-white outline-none focus:border-indigo-400 cursor-pointer"
      >
        <option value="">Todos los bloques</option>
        {groups.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      <button
        onClick={onFocusToggle}
        className={`ml-auto px-3 py-1 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
          focusMode
            ? 'bg-amber-500 text-white border-amber-500'
            : 'border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100'
        }`}
      >
        ⚡ Focus
      </button>
    </div>
  )
}
