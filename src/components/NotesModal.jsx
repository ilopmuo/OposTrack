import { useState, useEffect, useRef } from 'react'

export default function NotesModal({ topic, onSave, onClose }) {
  const [value, setValue] = useState(topic?.notes ?? '')
  const textareaRef = useRef(null)

  useEffect(() => {
    setValue(topic?.notes ?? '')
    setTimeout(() => textareaRef.current?.focus(), 80)
  }, [topic])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSave()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  function handleSave() {
    onSave(topic.id, value.trim())
    onClose()
  }

  if (!topic) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <h2 className="font-bold text-sm text-slate-800 mb-0.5">Notas del tema</h2>
        <p className="text-xs text-slate-400 mb-3 leading-tight">{topic.name}</p>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Apuntes, dudas, recursos, mnemotecnia…"
          className="w-full min-h-[100px] p-3 text-sm border border-slate-200 rounded-lg resize-y outline-none focus:border-indigo-400 text-slate-700 placeholder:text-slate-300"
        />

        <p className="text-[10px] text-slate-300 mt-1 mb-3">Ctrl+Enter para guardar · Esc para cerrar</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
