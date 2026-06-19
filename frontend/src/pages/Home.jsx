import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listRecords, deleteRecord } from '../api/client'
import Header from '../components/shared/Header'
import { formatDate, todayISO, ALL_PRODUCTS } from '../data/products'
import { downloadExcel } from '../utils/exportExcel'

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_OPTS = [
  { value: 'awaiting_manager_check', label: 'Awaiting Sign-off' },
  { value: 'draft',                  label: 'Draft'             },
  { value: 'complete',               label: 'Complete'          },
  { value: '',                       label: 'All'               },
]

const STATUS_LABELS = {
  draft: 'Draft',
  awaiting_manager_check: 'Awaiting Manager',
  complete: 'Complete',
}
const STATUS_CLASS = {
  draft: 'badge badge--draft',
  awaiting_manager_check: 'badge badge--awaiting',
  complete: 'badge badge--complete',
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const today = todayISO()
  const isManager = role === 'manager' || role === 'supervisor'

  // Filters persist in sessionStorage so state survives navigating into a record and back.
  const [statusFilter,  setStatusFilter]  = useState(() => isManager ? (sessionStorage.getItem('mgr_status')  ?? 'awaiting_manager_check') : 'draft')
  const [dateFrom,      setDateFrom]      = useState(() => isManager ? (sessionStorage.getItem('mgr_from')    ?? '') : '')
  const [dateTo,        setDateTo]        = useState(() => isManager ? (sessionStorage.getItem('mgr_to')      ?? '') : '')
  const [productFilter, setProductFilter] = useState(() => isManager ? (sessionStorage.getItem('mgr_product') ?? '') : '')

  function saveFilter(key, val) { sessionStorage.setItem(key, val) }
  function updateStatus(v)  { setStatusFilter(v);  saveFilter('mgr_status',  v) }
  function updateFrom(v)    { setDateFrom(v);       saveFilter('mgr_from',    v) }
  function updateTo(v)      { setDateTo(v);         saveFilter('mgr_to',      v) }
  function updateProduct(v) { setProductFilter(v);  saveFilter('mgr_product', v) }
  function clearFilters()   {
    updateStatus('awaiting_manager_check')
    updateFrom(''); updateTo(''); updateProduct('')
  }

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId,      setDeletingId]      = useState(null)

  async function handleDelete(recordId) {
    setDeletingId(recordId)
    try {
      await deleteRecord(recordId)
      setConfirmDeleteId(null)
      setRecords((prev) => prev.filter((r) => r.record_id !== recordId))
    } catch {
      setError('Failed to delete record')
      setConfirmDeleteId(null)
    } finally {
      setDeletingId(null)
    }
  }

  const fetch = useCallback(() => {
    setLoading(true)
    setError('')
    const params = {}
    if (statusFilter)   params.status      = statusFilter
    if (dateFrom)       params.date_from   = dateFrom
    if (dateTo)         params.date_to     = dateTo
    if (productFilter)  params.product_key = productFilter
    listRecords(params)
      .then(setRecords)
      .catch(() => setError('Failed to load records'))
      .finally(() => setLoading(false))
  }, [statusFilter, dateFrom, dateTo, productFilter])

  useEffect(() => { fetch() }, [fetch])

  // ── Months helper ─────────────────────────────────────────────────────────
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const todayLong = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

  // ── Record card (inlined to avoid component-identity re-mount) ────────────
  function renderCard(r) {
    const isConfirming = confirmDeleteId === r.record_id
    const showDelete = isManager && r.status === 'draft'
    return (
      <li
        key={r.record_id}
        className={`record-card record-card--${r.status}`}
        onClick={() => !isConfirming && navigate(`/record/${r.record_id}`)}
      >
        <div className="record-card__content">
          <div className="record-card__top">
            <span className="record-card__name">{r.product_name}</span>
            <span className={STATUS_CLASS[r.status] || 'badge'}>
              {STATUS_LABELS[r.status] || r.status}
            </span>
          </div>
          <div className="record-card__meta">
            <span>Prod: {formatDate(r.date_of_production)}</span>
            <span>Use by: {formatDate(r.use_by_date)}</span>
            {r.lot_number && <span>Lot: {r.lot_number}</span>}
            {r.batch_size  && <span>{r.batch_size} bags</span>}
          </div>
        </div>
        {showDelete ? (
          <div className="record-card__delete-area" onClick={(e) => e.stopPropagation()}>
            {isConfirming ? (
              <>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(r.record_id)}
                  disabled={deletingId === r.record_id}
                >
                  {deletingId === r.record_id ? '…' : 'Confirm'}
                </button>
                <button
                  className="btn btn--ghost-dark btn--sm"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn btn--ghost-dark btn--sm"
                onClick={() => setConfirmDeleteId(r.record_id)}
              >
                Delete
              </button>
            )}
          </div>
        ) : (
          <span className="record-card__arrow">›</span>
        )}
      </li>
    )
  }

  const todayRecords   = records.filter((r) => r.date_of_production === today)
  const earlierRecords = records.filter((r) => r.date_of_production !== today)

  return (
    <div className="page">
      <Header
        right={
          <div className="header-right">
            <span className="role-pill">{role === 'manager' ? 'Manager' : role === 'supervisor' ? 'Supervisor' : 'Operative'}</span>
            <button className="btn btn--ghost btn--sm" onClick={logout}>Sign out</button>
          </div>
        }
      />

      <div className="page-body">
        {/* ── Toolbar ── */}
        <div className="home-toolbar">
          <div>
            <h1 className="page-title">{isManager ? 'Records' : 'Open Records'}</h1>
            <p className="date-label">{todayLong}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isManager && (
              <button
                className="btn btn--outline btn--sm"
                onClick={() => downloadExcel(records)}
                disabled={records.length === 0}
                title="Export current view as Excel"
              >
                Export Excel
              </button>
            )}
            {!isManager && (
              <button className="btn btn--primary" onClick={() => navigate('/new')}>
                + New Record
              </button>
            )}
          </div>
        </div>

        {/* ── Manager filters ── */}
        {isManager && (
          <div className="manager-filters">
            {/* Status pills */}
            <div className="filter-pills">
              {STATUS_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  className={`filter-pill ${statusFilter === opt.value ? 'filter-pill--active' : ''}`}
                  onClick={() => updateStatus(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Date range + product */}
            <div className="filter-row">
              <div className="field-group field-group--half">
                <label className="field-label">From</label>
                <input className="field-input field-input--sm" type="date" value={dateFrom}
                  onChange={(e) => updateFrom(e.target.value)} />
              </div>
              <div className="field-group field-group--half">
                <label className="field-label">To</label>
                <input className="field-input field-input--sm" type="date" value={dateTo}
                  onChange={(e) => updateTo(e.target.value)} />
              </div>
              <div className="field-group field-group--grow">
                <label className="field-label">Product</label>
                <select className="field-input field-input--sm" value={productFilter}
                  onChange={(e) => updateProduct(e.target.value)}>
                  <option value="">All products</option>
                  {ALL_PRODUCTS.map((p) => (
                    <option key={p.key} value={p.key}>{p.name}</option>
                  ))}
                </select>
              </div>
              {(dateFrom || dateTo || productFilter) && (
                <button className="btn btn--ghost-dark btn--sm" style={{ alignSelf: 'flex-end' }}
                  onClick={clearFilters}>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── List ── */}
        {loading && <p className="muted">Loading…</p>}
        {error   && <p className="error-text">{error}</p>}
        {!loading && records.length === 0 && (
          <p className="muted">
            {isManager ? 'No records match the current filters.' : 'No open records. Tap New Record to begin.'}
          </p>
        )}

        {todayRecords.length > 0 && (
          <>
            <p className="record-section-label">Today</p>
            <ul className="record-list">{todayRecords.map(renderCard)}</ul>
          </>
        )}
        {earlierRecords.length > 0 && (
          <>
            <p className="record-section-label" style={{ marginTop: 20 }}>Earlier</p>
            <ul className="record-list">{earlierRecords.map(renderCard)}</ul>
          </>
        )}
      </div>
    </div>
  )
}
