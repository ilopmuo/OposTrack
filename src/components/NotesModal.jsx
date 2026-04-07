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
      style={{ background: 'rgba(45,27,36,0.4)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md p-6 rounded-3xl"
        style={{
          background: 'linear-gradient(160deg, #fff 0%, #FDF0F5 100%)',
          boxShadow: '0 32px 64px rgba(122,40,72,0.18), 0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid rgba(242,190,209,0.5)',
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C07098', marginBottom: 4 }}>
          Notas
        </p>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#2D1B24', marginBottom: 16, lineHeight: 1.3 }}>
          {topic.name}
        </h2>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Apuntes, dudas, recursos, mnemotecnia…"
          className="w-full min-h-[110px] p-4 text-sm resize-y rounded-2xl outline-none transition-all duration-150"
          style={{
            background: '#FEF4F8',
            border: '1.5px solid #F8E8EE',
            color: '#2D1B24',
            fontFamily: 'inherit',
            fontWeight: 500,
          }}
          onFocus={e => (e.target.style.borderColor = '#F2BED1')}
          onBlur={e => (e.target.style.borderColor = '#F8E8EE')}
        />

        <p style={{ fontSize: 10, fontWeight: 600, color: '#D4B8C0', marginTop: 6, marginBottom: 16 }}>
          Ctrl + Enter para guardar · Esc para cerrar
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl transition-colors"
            style={{ background: '#F8E8EE', color: '#9B6B7E', fontWeight: 700, border: 'none' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-xl transition-colors"
            style={{ background: '#7A2848', color: '#fff', fontWeight: 700, border: 'none' }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
