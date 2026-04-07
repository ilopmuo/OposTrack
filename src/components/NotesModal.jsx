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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(28,12,18,0.35)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md p-6 rounded-3xl"
        style={{
          background: '#ffffff',
          boxShadow: '0 32px 64px rgba(156,69,105,0.18), 0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h2 className="font-semibold text-sm mb-0.5" style={{ color: '#1C1C1E' }}>
          Notas del tema
        </h2>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: '#AEAEB2' }}>
          {topic.name}
        </p>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Apuntes, dudas, recursos, mnemotecnia…"
          className="w-full min-h-[110px] p-3.5 text-sm resize-y rounded-xl outline-none transition-all duration-150 placeholder:text-[#D4B8C0]"
          style={{
            background: '#F9F5F6',
            border: '1.5px solid #F8E8EE',
            color: '#1C1C1E',
          }}
          onFocus={e => (e.target.style.borderColor = '#F2BED1')}
          onBlur={e => (e.target.style.borderColor = '#F8E8EE')}
        />

        <p className="text-[10px] mt-1.5 mb-4" style={{ color: '#D4B8C0' }}>
          Ctrl + Enter para guardar · Esc para cerrar
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl transition-colors"
            style={{ background: '#F8E8EE', color: '#9B6B7E', border: 'none' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
            style={{ background: '#F2BED1', color: '#7A3456', border: 'none' }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
