import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoWhite from '../assets/tortilla-logo-white.png'

export default function PinLogin() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [pin,                setPin]                = useState('')
  const [opError,            setOpError]            = useState('')
  const [opLoading,          setOpLoading]          = useState(false)
  const [managerError,       setManagerError]       = useState('')
  const [managerLoading,     setManagerLoading]     = useState(false)
  const [supervisorError,    setSupervisorError]    = useState('')
  const [supervisorLoading,  setSupervisorLoading]  = useState(false)

  async function handleOperative() {
    setOpLoading(true)
    setOpError('')
    try {
      await login('operative', '')
      navigate('/')
    } catch {
      setOpError('Login failed. Please try again.')
    } finally {
      setOpLoading(false)
    }
  }

  async function handleManagerSubmit() {
    if (pin.length !== 4) return
    setManagerLoading(true)
    setManagerError('')
    try {
      await login('manager', pin)
      navigate('/')
    } catch {
      setManagerError('Incorrect PIN. Please try again.')
      setPin('')
    } finally {
      setManagerLoading(false)
    }
  }

  async function handleSupervisorSubmit() {
    if (pin.length !== 4) return
    setSupervisorLoading(true)
    setSupervisorError('')
    try {
      await login('supervisor', pin)
      navigate('/')
    } catch {
      setSupervisorError('Incorrect PIN. Please try again.')
      setPin('')
    } finally {
      setSupervisorLoading(false)
    }
  }

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100dvh',
    background: 'var(--dark)',
    padding: '0 16px',
  }

  return (
    <div style={pageStyle}>
      <div className="login-logo-area">
        <img src={logoWhite} alt="Tortilla" style={{ height: 32 }} />
        <span className="login-subtitle">CPU · CCP FORMS</span>
      </div>
      <div className="login-card">
        <h2 className="login-title">Select Access</h2>

        <button className="role-btn" onClick={handleOperative} disabled={opLoading}>
          {opLoading ? 'Signing in…' : 'OPERATIVE'}
        </button>
        {opError && <p className="pin-error">{opError}</p>}

        <ManagerPinSection
          pin={pin} setPin={setPin}
          error={managerError} setError={setManagerError}
          loading={managerLoading} onSubmit={handleManagerSubmit}
        />
        <SupervisorPinSection
          pin={pin} setPin={setPin}
          error={supervisorError} setError={setSupervisorError}
          loading={supervisorLoading} onSubmit={handleSupervisorSubmit}
        />
      </div>
    </div>
  )
}

function ManagerPinSection({ pin, setPin, error, setError, loading, onSubmit }) {
  const [open, setOpen] = useState(false)
  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  function handleDigit(d) { if (pin.length < 4) setPin((p) => p + d) }
  function handleDelete() { setPin((p) => p.slice(0, -1)); setError('') }

  if (!open) {
    return (
      <button className="role-btn role-btn--manager" onClick={() => setOpen(true)}>
        MANAGER
      </button>
    )
  }

  return (
    <div className="manager-pin-section">
      <p className="login-title" style={{ fontSize: '1rem' }}>Manager PIN</p>
      <div className="pin-dots">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={`pin-dot ${i < pin.length ? 'pin-dot--filled' : ''}`} />
        ))}
      </div>
      {error && <p className="pin-error">{error}</p>}
      <div className="pin-pad">
        {digits.map((d, i) =>
          d === '' ? <div key={i} /> :
          d === '⌫' ? (
            <button key={i} className="pin-key pin-key--delete" onClick={handleDelete}>⌫</button>
          ) : (
            <button key={i} className="pin-key" onClick={() => handleDigit(d)}>{d}</button>
          )
        )}
      </div>
      <button className="btn btn--primary btn--full btn--lg" onClick={onSubmit}
        disabled={pin.length !== 4 || loading}>
        {loading ? 'Checking…' : 'Enter'}
      </button>
      <button className="btn btn--outline btn--full"
        onClick={() => { setOpen(false); setPin(''); setError('') }}>
        Back
      </button>
    </div>
  )
}

function SupervisorPinSection({ pin, setPin, error, setError, loading, onSubmit }) {
  const [open, setOpen] = useState(false)
  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  function handleDigit(d) { if (pin.length < 4) setPin((p) => p + d) }
  function handleDelete() { setPin((p) => p.slice(0, -1)); setError('') }

  if (!open) {
    return (
      <button className="role-btn role-btn--manager" onClick={() => setOpen(true)}>
        SUPERVISOR
      </button>
    )
  }

  return (
    <div className="manager-pin-section">
      <p className="login-title" style={{ fontSize: '1rem' }}>Supervisor PIN</p>
      <div className="pin-dots">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={`pin-dot ${i < pin.length ? 'pin-dot--filled' : ''}`} />
        ))}
      </div>
      {error && <p className="pin-error">{error}</p>}
      <div className="pin-pad">
        {digits.map((d, i) =>
          d === '' ? <div key={i} /> :
          d === '⌫' ? (
            <button key={i} className="pin-key pin-key--delete" onClick={handleDelete}>⌫</button>
          ) : (
            <button key={i} className="pin-key" onClick={() => handleDigit(d)}>{d}</button>
          )
        )}
      </div>
      <button className="btn btn--primary btn--full btn--lg" onClick={onSubmit}
        disabled={pin.length !== 4 || loading}>
        {loading ? 'Checking…' : 'Enter'}
      </button>
      <button className="btn btn--outline btn--full"
        onClick={() => { setOpen(false); setPin(''); setError('') }}>
        Back
      </button>
    </div>
  )
}
