import { useState, useEffect, useRef, useCallback } from 'react'

const MODES = [
  { key: 'focus',      label: 'Foco',           defaultMin: 25, color: '#7A2848', bg: '#FEF4F8' },
  { key: 'shortBreak', label: 'Descanso corto', defaultMin: 5,  color: '#9B4569', bg: '#FFF0F5' },
  { key: 'longBreak',  label: 'Descanso largo', defaultMin: 15, color: '#C06090', bg: '#FDE8F0' },
]

const SESSIONS_BEFORE_LONG = 4

function pad(n) { return String(n).padStart(2, '0') }

function beepEnd() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // 3 rounds of the alarm pattern, each round = ding-ding-ding
    const pattern = [
      // Round 1
      { f: 880, t: 0.00, d: 0.18 },
      { f: 880, t: 0.22, d: 0.18 },
      { f: 880, t: 0.44, d: 0.18 },
      // Round 2
      { f: 988, t: 0.80, d: 0.18 },
      { f: 988, t: 1.02, d: 0.18 },
      { f: 988, t: 1.24, d: 0.18 },
      // Round 3 — higher
      { f: 1174, t: 1.60, d: 0.25 },
      { f: 1174, t: 1.90, d: 0.25 },
      { f: 1174, t: 2.20, d: 0.40 },
    ]

    pattern.forEach(({ f, t, d }) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      // Add a bit of distortion body with a square overtone
      const osc2  = ctx.createOscillator()
      const gain2 = ctx.createGain()

      osc.connect(gain);   gain.connect(ctx.destination)
      osc2.connect(gain2); gain2.connect(ctx.destination)

      osc.frequency.value  = f
      osc2.frequency.value = f * 2
      osc.type  = 'sine'
      osc2.type = 'square'

      const now = ctx.currentTime
      gain.gain.setValueAtTime(0, now + t)
      gain.gain.linearRampToValueAtTime(0.7, now + t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d)

      gain2.gain.setValueAtTime(0, now + t)
      gain2.gain.linearRampToValueAtTime(0.12, now + t + 0.01)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + t + d)

      osc.start(now + t);  osc.stop(now + t + d + 0.05)
      osc2.start(now + t); osc2.stop(now + t + d + 0.05)
    })
  } catch (_) {}
}

function beepTick() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 440
    osc.type = 'sine'
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.12)
  } catch (_) {}
}

function notify(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' })
  }
}

export default function Pomodoro() {
  const [settings, setSettings] = useState({
    focus: 25, shortBreak: 5, longBreak: 15,
    autoStart: false, sound: true,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [modeIdx, setModeIdx]   = useState(0)
  const [seconds, setSeconds]   = useState(settings.focus * 60)
  const [running, setRunning]   = useState(false)
  const [sessions, setSessions] = useState(0)       // focus sessions completed today
  const [history, setHistory]   = useState([])      // [{mode, completedAt, label}]
  const intervalRef = useRef(null)
  const hasNotifPerm = useRef(false)

  const mode = MODES[modeIdx]

  // Ask notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => { hasNotifPerm.current = p === 'granted' })
    } else {
      hasNotifPerm.current = Notification.permission === 'granted'
    }
  }, [])

  // Reset seconds when mode or settings change (only if not running)
  const totalSeconds = useCallback(() => {
    const key = mode.key
    return settings[key] * 60
  }, [mode.key, settings])

  useEffect(() => {
    if (!running) setSeconds(totalSeconds())
  }, [modeIdx, settings]) // eslint-disable-line

  // Tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            handleComplete()
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running]) // eslint-disable-line

  function handleComplete() {
    if (settings.sound) beepEnd()

    const entry = { mode: mode.key, label: mode.label, completedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }
    setHistory(h => [entry, ...h].slice(0, 20))

    let newSessions = sessions
    if (mode.key === 'focus') {
      newSessions = sessions + 1
      setSessions(newSessions)
      const msg = newSessions % SESSIONS_BEFORE_LONG === 0
        ? '¡Tómate un descanso largo! 🌸'
        : '¡Buen trabajo! Descansa un momento 🍵'
      notify('Pomodoro completado', msg)
    } else {
      notify('Descanso terminado', '¡A por otro pomodoro! 💪')
    }

    // Auto-advance to next mode
    if (settings.autoStart) {
      const next = getNextModeIdx(newSessions)
      setModeIdx(next)
      setSeconds(settings[MODES[next].key] * 60)
      setRunning(true)
    } else {
      const next = getNextModeIdx(newSessions)
      setModeIdx(next)
      setSeconds(settings[MODES[next].key] * 60)
      setRunning(false)
    }
  }

  function getNextModeIdx(s) {
    if (modeIdx !== 0) return 0 // after break → focus
    if (s % SESSIONS_BEFORE_LONG === 0) return 2 // long break
    return 1 // short break
  }

  function switchMode(idx) {
    clearInterval(intervalRef.current)
    setRunning(false)
    setModeIdx(idx)
    setSeconds(settings[MODES[idx].key] * 60)
  }

  function toggleRun() {
    if (settings.sound) beepTick()
    setRunning(r => !r)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSeconds(totalSeconds())
  }

  const pct = Math.round((1 - seconds / totalSeconds()) * 100)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  // Circumference for SVG ring
  const R = 90
  const CIRC = 2 * Math.PI * R
  const dashOffset = CIRC * (1 - (1 - seconds / (totalSeconds() || 1)))

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-start py-10 px-4">

      {/* Mode tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl mb-10"
        style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(242,190,209,0.6)' }}
      >
        {MODES.map((m, i) => (
          <button
            key={m.key}
            onClick={() => switchMode(i)}
            className="px-4 py-1.5 rounded-xl text-xs transition-all duration-150"
            style={{
              fontWeight: 700,
              fontFamily: 'inherit',
              ...(modeIdx === i
                ? { background: '#7A2848', color: '#fff' }
                : { background: 'transparent', color: '#9B4569' }),
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative flex items-center justify-center mb-8" style={{ width: 220, height: 220 }}>
        <svg width="220" height="220" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(242,190,209,0.35)" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="110" cy="110" r={R}
            fill="none"
            stroke={mode.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
          />
        </svg>

        {/* Time display */}
        <div className="flex flex-col items-center gap-1 z-10">
          <span style={{ fontSize: 52, fontWeight: 900, color: '#7A2848', letterSpacing: '-2px', lineHeight: 1 }}>
            {pad(mins)}<span style={{ color: '#F2BED1', fontSize: 40 }}>:</span>{pad(secs)}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#C4A4B0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {mode.label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-10">
        {/* Reset */}
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(242,190,209,0.6)', color: '#C4A4B0' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.color = '#9B4569' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.55)'; e.currentTarget.style.color = '#C4A4B0' }}
          title="Reiniciar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={toggleRun}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95"
          style={{ background: '#7A2848', color: '#fff', boxShadow: '0 8px 32px rgba(122,40,72,0.35)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#9B3A5A'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(122,40,72,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#7A2848'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(122,40,72,0.35)' }}
        >
          {running ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1"/>
              <rect x="14" y="5" width="4" height="14" rx="1"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(s => !s)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            border: '1.5px solid rgba(242,190,209,0.6)',
            color: showSettings ? '#7A2848' : '#C4A4B0',
            background: showSettings ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.color = '#9B4569' }}
          onMouseLeave={e => {
            e.currentTarget.style.background = showSettings ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)'
            e.currentTarget.style.color = showSettings ? '#7A2848' : '#C4A4B0'
          }}
          title="Ajustes"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Session dots */}
      <div className="flex items-center gap-2 mb-10">
        {Array.from({ length: SESSIONS_BEFORE_LONG }).map((_, i) => {
          const cyclePos = sessions % SESSIONS_BEFORE_LONG
          const filled = i < cyclePos || (cyclePos === 0 && sessions > 0 && i === SESSIONS_BEFORE_LONG - 1)
          // Actually: filled if i < (sessions % SESSIONS_BEFORE_LONG)
          const isFilled = i < (sessions % SESSIONS_BEFORE_LONG === 0 && sessions > 0 ? SESSIONS_BEFORE_LONG : sessions % SESSIONS_BEFORE_LONG)
          return (
            <div
              key={i}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: isFilled ? '#7A2848' : 'rgba(242,190,209,0.5)',
                border: '1.5px solid rgba(242,190,209,0.8)',
                transition: 'background 0.3s',
              }}
            />
          )
        })}
        <span style={{ fontSize: 11, fontWeight: 700, color: '#C4A4B0', marginLeft: 6 }}>
          {sessions} {sessions === 1 ? 'sesión' : 'sesiones'} hoy
        </span>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div
          className="w-full max-w-sm rounded-2xl p-5 mb-8"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(242,190,209,0.6)', boxShadow: '0 4px 24px rgba(192,96,144,0.1)' }}
        >
          <p style={{ fontSize: 12, fontWeight: 800, color: '#7A2848', letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>
            Ajustes
          </p>

          <div className="flex flex-col gap-3">
            {[
              { key: 'focus',      label: 'Foco (min)' },
              { key: 'shortBreak', label: 'Descanso corto (min)' },
              { key: 'longBreak',  label: 'Descanso largo (min)' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#9B4569' }}>{label}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSettings(s => ({ ...s, [key]: Math.max(1, s[key] - 1) }))}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-lg leading-none"
                    style={{ background: 'rgba(242,190,209,0.4)', color: '#7A2848', fontWeight: 900 }}
                  >−</button>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#7A2848', minWidth: 24, textAlign: 'center' }}>
                    {settings[key]}
                  </span>
                  <button
                    onClick={() => setSettings(s => ({ ...s, [key]: Math.min(90, s[key] + 1) }))}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-lg leading-none"
                    style={{ background: 'rgba(242,190,209,0.4)', color: '#7A2848', fontWeight: 900 }}
                  >+</button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-1">
              <span style={{ fontSize: 13, fontWeight: 600, color: '#9B4569' }}>Inicio automático</span>
              <Toggle value={settings.autoStart} onChange={v => setSettings(s => ({ ...s, autoStart: v }))} />
            </div>

            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, fontWeight: 600, color: '#9B4569' }}>Sonido</span>
              <Toggle value={settings.sound} onChange={v => setSettings(s => ({ ...s, sound: v }))} />
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="w-full max-w-sm">
          <p style={{ fontSize: 11, fontWeight: 800, color: '#C4A4B0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Historial de hoy
          </p>
          <div className="flex flex-col gap-1.5">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(242,190,209,0.45)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: MODES.find(m => m.key === h.mode)?.color ?? '#C06090',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#7A2848' }}>{h.label}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#C4A4B0' }}>{h.completedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative transition-all duration-200"
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? '#7A2848' : 'rgba(242,190,209,0.5)',
        border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3, left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }} />
    </button>
  )
}
