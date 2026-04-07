// BOM para que Excel abra UTF-8 correctamente en Windows/Mac
const BOM = '\uFEFF'

export function downloadTemplate() {
  const rows = [
    'Bloque;Tema',
    'Bloque I · Organización del Estado;Tema 1. La Constitución Española de 1978. Estructura y contenido',
    'Bloque I · Organización del Estado;Tema 2. Derechos y deberes fundamentales. Garantías y suspensión',
    'Bloque I · Organización del Estado;Tema 3. El Gobierno y la Administración del Estado',
    'Bloque II · Derecho Administrativo;Tema 4. El acto administrativo. Concepto y clases',
    'Bloque II · Derecho Administrativo;Tema 5. El procedimiento administrativo común (LPACAP)',
    'Bloque II · Derecho Administrativo;Tema 6. Los recursos administrativos',
  ]
  triggerDownload(BOM + rows.join('\n'), 'plantilla_opotrack.csv', 'text/csv;charset=utf-8;')
}

export function parseCSV(text) {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  if (lines.length < 2) throw new Error('El archivo está vacío o solo tiene la cabecera.')

  // Detectar delimitador: punto y coma (Excel ES) o coma
  const header = lines[0]
  const delimiter = header.includes(';') ? ';' : ','

  const rows = lines.slice(1)
    .map(line => {
      const idx = line.indexOf(delimiter)
      if (idx === -1) return null
      return {
        group: line.slice(0, idx).trim().replace(/^["']|["']$/g, ''),
        topic: line.slice(idx + 1).trim().replace(/^["']|["']$/g, ''),
      }
    })
    .filter(r => r && r.group && r.topic)

  if (rows.length === 0) throw new Error('No se encontraron filas válidas. Revisa el formato.')

  // Agrupar manteniendo orden de aparición
  const map = new Map()
  for (const row of rows) {
    if (!map.has(row.group)) map.set(row.group, [])
    map.get(row.group).push(row.topic)
  }

  return Array.from(map.entries()).map(([name, topics]) => ({ name, topics }))
}

function triggerDownload(content, filename, type) {
  const blob = new Blob([content], { type })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
