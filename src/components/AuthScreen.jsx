import { useState } from 'react'

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode]       = useState('login')   // 'login' | 'register'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)     // registro confirmado

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await onSignIn(email, password)
      } else {
        await onSignUp(email, password)
        setDone(true)
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Screen>
        <Card>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📬</p>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#7A2848', marginBottom: 8 }}>
            Revisa tu correo
          </h2>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#C4A4B0', lineHeight: 1.6 }}>
            Te hemos enviado un enlace de confirmación a <b style={{ color: '#9B4569' }}>{email}</b>.
            Haz clic en él para activar tu cuenta.
          </p>
          <button
            onClick={() => { setDone(false); setMode('login') }}
            className="mt-6 text-sm underline"
            style={{ color: '#C07098', fontWeight: 700 }}
          >
            Volver al inicio de sesión
          </button>
        </Card>
      </Screen>
    )
  }

  return (
    <Screen>
      <Card>
        {/* Logo */}
        <p style={{ fontSize: 36, marginBottom: 4 }}>🌸</p>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#7A2848', marginBottom: 4, letterSpacing: '-0.4px' }}>
          OpoTracker
        </h1>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#C4A4B0', marginBottom: 28 }}>
          {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta gratis'}
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Field
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tu@correo.com"
            autoComplete="email"
          />
          <Field
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {error && (
            <p style={{ fontSize: 12, fontWeight: 700, color: '#C05050', marginBottom: 14, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-2xl text-sm transition-all"
            style={{
              fontWeight: 800,
              background: loading || !email || !password ? 'rgba(242,190,209,0.4)' : '#7A2848',
              color: loading || !email || !password ? '#C4A4B0' : '#fff',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Cargando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ marginTop: 20, borderTop: '1px solid rgba(242,190,209,0.4)', paddingTop: 20, width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#C4A4B0' }}>
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          </span>{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
            className="text-sm underline"
            style={{ fontWeight: 800, color: '#C07098' }}
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </div>
      </Card>
    </Screen>
  )
}

function Screen({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #F8E8EE 0%, #F9F5F6 50%)' }}
    >
      {children}
    </div>
  )
}

function Card({ children }) {
  return (
    <div
      className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center"
      style={{
        background: 'linear-gradient(160deg, #fff 0%, #FDF0F5 100%)',
        boxShadow: '0 32px 64px rgba(122,40,72,0.12), 0 8px 24px rgba(0,0,0,0.05)',
        border: '1px solid rgba(242,190,209,0.4)',
      }}
    >
      {children}
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, autoComplete }) {
  return (
    <div style={{ marginBottom: 14, width: '100%' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#C07098', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
        style={{
          background: '#FEF4F8',
          border: '1.5px solid #F8E8EE',
          color: '#2D1B24',
          fontFamily: 'inherit',
          fontWeight: 600,
        }}
        onFocus={e => { e.target.style.borderColor = '#F2BED1' }}
        onBlur={e => { e.target.style.borderColor = '#F8E8EE' }}
      />
    </div>
  )
}

function translateError(msg) {
  if (msg.includes('Invalid login'))      return 'Correo o contraseña incorrectos'
  if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de entrar'
  if (msg.includes('already registered')) return 'Este correo ya está registrado'
  if (msg.includes('Password should'))    return 'La contraseña debe tener al menos 6 caracteres'
  return 'Algo ha ido mal. Inténtalo de nuevo.'
}
