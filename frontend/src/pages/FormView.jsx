import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecord, updateRecord } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Header from '../components/shared/Header'
import Type1Form from '../components/forms/Type1Form'
import Type2Form from '../components/forms/Type2Form'
import Type3Form from '../components/forms/Type3Form'
import Type4Form from '../components/forms/Type4Form'
import Type5Form from '../components/forms/Type5Form'
import { formatDate } from '../data/products'

const SAVE_DEBOUNCE_MS = 1200

const STATUS_LABELS = {
  draft: 'Draft',
  awaiting_manager_check: 'Awaiting Manager',
  complete: 'Complete',
}

export default function FormView() {
  const { id } = useParams()
  const { role } = useAuth()
  const navigate = useNavigate()

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState('saved')
  const [error, setError] = useState('')
  const [completing, setCompleting] = useState(false)

  const pendingRef  = useRef(null)
  const saveTimerRef = useRef(null)

  useEffect(() => {
    getRecord(id)
      .then((r) => setRecord(r))
      .catch(() => setError('Failed to load record'))
      .finally(() => setLoading(false))
  }, [id])

  const save = useCallback(async (updates) => {
    setSaveState('saving')
    try {
      const saved = await updateRecord(id, updates)
      setRecord(saved)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [id])

  function handleChange(partial) {
    setRecord((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      for (const [key, val] of Object.entries(partial)) {
        if (key === 'form_data' && val && typeof val === 'object') {
          next.form_data = { ...prev.form_data }
          for (const [k, v] of Object.entries(val)) {
            if (v && typeof v === 'object' && !Array.isArray(v) &&
                typeof next.form_data[k] === 'object' && !Array.isArray(next.form_data[k])) {
              next.form_data[k] = { ...next.form_data[k], ...v }
            } else {
              next.form_data[k] = v
            }
          }
        } else {
          next[key] = val
        }
      }
      return next
    })

    setSaveState('saving')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (partial.form_data && pendingRef.current?.form_data) {
      pendingRef.current = { ...pendingRef.current, form_data: { ...pendingRef.current.form_data, ...partial.form_data } }
    } else {
      pendingRef.current = { ...(pendingRef.current || {}), ...partial }
    }
    saveTimerRef.current = setTimeout(() => {
      const toSave = pendingRef.current
      pendingRef.current = null
      save(toSave)
    }, SAVE_DEBOUNCE_MS)
  }

  async function handleMarkComplete() {
    if (!record?.manager_check?.trim()) return
    setCompleting(true)
    try {
      const updated = await updateRecord(id, { status: 'complete' })
      setRecord(updated)
    } catch {
      setError('Failed to mark complete')
    } finally {
      setCompleting(false)
    }
  }

  const [submitting, setSubmitting] = useState(false)

  async function handleSubmitForReview() {
    setSubmitting(true)
    try {
      const updated = await updateRecord(id, { status: 'awaiting_manager_check' })
      setRecord(updated)
    } catch {
      setError('Failed to submit for review')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSaveAndGoBack() {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    if (pendingRef.current) {
      const toSave = pendingRef.current
      pendingRef.current = null
      await save(toSave)
    }
    navigate(-1)
  }

  const isManager  = role === 'manager' || role === 'supervisor'
  const isComplete = record?.status === 'complete'
  const saveLabel  = { saved: 'Saved', saving: 'Saving…', error: 'Save failed' }[saveState]

  function renderForm() {
    if (!record) return null
    const props = { record, onChange: handleChange, readOnly: isComplete, isManager }
    switch (record.form_type) {
      case 1: return <Type1Form {...props} />
      case 2: return <Type2Form {...props} />
      case 3: return <Type3Form {...props} />
      case 4: return <Type4Form {...props} />
      case 5: return <Type5Form {...props} />
      default: return <p className="error-text">Unknown form type: {record.form_type}</p>
    }
  }

  if (loading) return (
    <div className="page">
      <Header right={<button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>Back</button>} />
      <div className="page-body"><p className="muted">Loading…</p></div>
    </div>
  )

  if (error || !record) return (
    <div className="page">
      <Header right={<button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>Back</button>} />
      <div className="page-body"><p className="error-text">{error || 'Record not found'}</p></div>
    </div>
  )

  return (
    <div className="page">
      <Header
        right={
          <div className="header-right">
            <span className={`save-indicator save-indicator--${saveState}`}>{saveLabel}</span>
            <button className="btn btn--ghost btn--sm" onClick={handleSaveAndGoBack}>← Back</button>
          </div>
        }
      />

      <div className="form-meta-sticky">
        <div className="form-title-bar">
          <div>
            <h2 className="form-title">{record.product_name}</h2>
            <div className="form-title-meta">
              <span className={`badge badge--${record.status}`}>{STATUS_LABELS[record.status]}</span>
              {record.batch_size && (
                <span className="badge badge--draft">{record.batch_size} bags</span>
              )}
              <span className="form-meta-text">
                Prod: {formatDate(record.date_of_production)} · Use by: {formatDate(record.use_by_date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        {renderForm()}

        {!isManager && record?.status === 'draft' && (
          <div className="complete-bar complete-bar--row">
            <button
              className="btn btn--outline btn--full btn--lg"
              onClick={handleSaveAndGoBack}
              disabled={saveState === 'saving'}
            >
              Save as Draft
            </button>
            <button
              className="btn btn--primary btn--full btn--lg"
              onClick={handleSubmitForReview}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit for Manager Review'}
            </button>
          </div>
        )}

        {isManager && !isComplete && record.manager_check?.trim() && (
          <div className="complete-bar">
            <button
              className="btn btn--success btn--full btn--lg"
              onClick={handleMarkComplete}
              disabled={completing}
            >
              {completing ? 'Completing…' : '✓ Mark as Complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
