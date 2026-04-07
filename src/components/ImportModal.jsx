import { useState, useRef } from 'react'
import { Upload, FileDown, X, CheckCircle, AlertCircle } from 'lucide-react'
import { downloadTemplate, parseCSV } from '../lib/csvUtils'

export default function ImportModal({ onImport, onClose }) {
  const [parsed, setParsed]   = useState(null)   // { groups: [{name, topics[]}] }
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    setError(null)
    setParsed(null)
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const groups = parseCSV(e.target.result)
        setParsed(groups)
      } catch (err) {
        setError(err.message)
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      await onImport(parsed)
      onClose()
    } catch {
      setError('Error al importar. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  const totalTopics  = parsed?.reduce((s, g) => s + g.topics.length, 0) ?? 0
  const totalGroups  = parsed?.length ?? 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(45,27,36,0.4)', backdropFilter: 'blur(10px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #fff 0%, #FDF0F5 100%)',
          boxShadow: '0 32px 64px rgba(122,40,72,0.18), 0 8px 24px rgba(0,0,0,0.06)',
          border: '1px solid rgba(242,190,209,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: '#FDCEDF', borderBottom: '1px solid rgba(242,190,209,0.5)' }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#7A2848' }}>Importar desde plantilla</h2>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#C07098', marginTop: 1 }}>
              Sube un CSV con tus bloques y temas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-all"
            style={{ color: '#C07098' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Descargar plantilla */}
          <div
            className="rounded-2xl p-4 mb-4 flex items-center justify-between gap-4"
            style={{ background: '#FEF4F8', border: '1px solid rgba(242,190,209,0.4)' }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#3C2030', marginBottom: 2 }}>
                1. Descarga la plantilla
              </p>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#C4A4B0' }}>
                Archivo CSV · rellénalo en Excel o Google Sheets
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all flex-shrink-0"
              style={{ background: '#F2BED1', color: '#7A2848', fontWeight: 800 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FDCEDF' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F2BED1' }}
            >
              <FileDown size={13} />
              Descargar
            </button>
          </div>

          {/* Step 2: Subir archivo */}
          <div className="mb-4">
            <p style={{ fontSize: 13, fontWeight: 800, color: '#3C2030', marginBottom: 10 }}>
              2. Sube tu archivo rellenado
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />

            <button
              onClick={() => inputRef.current?.click()}
              className="w-full py-8 rounded-2xl flex flex-col items-center gap-2 transition-all"
              style={{
                border: `2px dashed ${parsed ? '#F2BED1' : 'rgba(242,190,209,0.6)'}`,
                background: parsed ? 'rgba(242,190,209,0.08)' : '#FEF4F8',
                color: '#C07098',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#F2BED1'; e.currentTarget.style.background = 'rgba(242,190,209,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = parsed ? '#F2BED1' : 'rgba(242,190,209,0.6)'; e.currentTarget.style.background = parsed ? 'rgba(242,190,209,0.08)' : '#FEF4F8' }}
            >
              <Upload size={22} style={{ color: '#D4B8C0' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#9B6B7E' }}>
                {parsed ? 'Haz clic para cambiar el archivo' : 'Haz clic para elegir el CSV'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#D4B8C0' }}>
                .csv · separado por punto y coma (;)
              </span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-xl p-3 mb-4"
              style={{ background: '#FFF0F0', border: '1px solid #FFC0C0' }}
            >
              <AlertCircle size={14} style={{ color: '#C05050', marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: '#904040' }}>{error}</p>
            </div>
          )}

          {/* Preview */}
          {parsed && !error && (
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{ border: '1px solid rgba(242,190,209,0.5)' }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ background: '#FDCEDF' }}
              >
                <CheckCircle size={14} style={{ color: '#7A2848' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#7A2848' }}>
                  {totalGroups} bloques · {totalTopics} temas listos para importar
                </span>
              </div>
              <div style={{ maxHeight: 180, overflowY: 'auto', background: '#FEF4F8' }}>
                {parsed.map((g, i) => (
                  <div
                    key={i}
                    className="px-4 py-2"
                    style={{ borderBottom: i < parsed.length - 1 ? '1px solid rgba(242,190,209,0.25)' : 'none' }}
                  >
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#7A2848', marginBottom: 2 }}>
                      {g.name}
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#C4A4B0' }}>
                      {g.topics.length} tema{g.topics.length !== 1 ? 's' : ''}: {g.topics[0]}
                      {g.topics.length > 1 ? `… +${g.topics.length - 1}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl"
              style={{ background: '#F8E8EE', color: '#9B6B7E', fontWeight: 700 }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!parsed || loading}
              className="px-5 py-2 text-sm rounded-xl flex items-center gap-1.5 transition-all"
              style={{
                background: parsed && !loading ? '#7A2848' : 'rgba(242,190,209,0.4)',
                color: parsed && !loading ? '#fff' : '#C4A4B0',
                fontWeight: 800,
                cursor: parsed && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Importando…' : `Importar ${totalTopics > 0 ? `${totalTopics} temas` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
