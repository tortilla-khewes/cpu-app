// Production date defaults to today and lives inside the form.
// Use-by date is recalculated live whenever the operative changes the date.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRecord } from '../api/client'
import Header from '../components/shared/Header'
import { PRODUCTS_BY_TYPE, TYPE_LABELS, addDays, todayISO } from '../data/products'

export default function NewRecord() {
  const navigate = useNavigate()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [batchSize, setBatchSize] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isScaled      = selectedProduct?.batch_sizes?.length > 0
  const readyToCreate = selectedProduct && (!isScaled || batchSize)

  function handleTile(p) {
    if (p.batch_sizes && p.batch_sizes.length > 0) {
      setSelectedProduct(p)
      setBatchSize(null)
      setSheetOpen(true)
    } else {
      setSelectedProduct(p)
      setBatchSize(null)
    }
  }

  function handleBatchPick(size) {
    setBatchSize(size)
    setSheetOpen(false)
  }

  async function handleCreate() {
    if (!readyToCreate) return
    setLoading(true)
    setError('')
    try {
      const p       = selectedProduct
      const today   = todayISO()
      const use_by  = addDays(today, p.use_by_days)

      const ingredients = isScaled
        ? p.ingredients_scaled[batchSize].map((i) => ({ ...i }))
        : p.ingredients()

      const record = await createRecord({
        form_type:           p.form_type,
        product_key:         p.key,
        product_name:        p.name,
        date_of_production:  today,
        use_by_date:         use_by,
        batch_size:          batchSize,
        ingredients,
        form_data:           p.defaultFormData(),
      })
      navigate(`/record/${record.record_id}`)
    } catch {
      setError('Failed to create record. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Header
        right={
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/')}>
            Cancel
          </button>
        }
      />
      <div className="page-body">
        <h1 className="page-title" style={{ marginBottom: 4 }}>New Record</h1>
        <p className="field-hint" style={{ marginBottom: 24 }}>
          Production date defaults to today — you can change it inside the form.
        </p>

        {Object.entries(PRODUCTS_BY_TYPE).map(([typeNum, products]) => (
          <div key={typeNum} className="product-type-group">
            <p className="product-type-label">{TYPE_LABELS[typeNum]}</p>
            <div className="product-tile-grid">
              {products.map((p) => {
                const isSel     = selectedProduct?.key === p.key
                const hasBatch  = p.batch_sizes?.length > 0
                const sizeLabel = isSel && batchSize
                  ? `${batchSize} bags`
                  : hasBatch
                  ? 'Select size ›'
                  : p.bags ? `${p.bags} bags` : null

                return (
                  <button key={p.key} type="button"
                    className={`product-tile ${isSel ? 'product-tile--selected' : ''}`}
                    onClick={() => handleTile(p)}>
                    {isSel && (!hasBatch || batchSize) && (
                      <span className="product-tile__check">✓</span>
                    )}
                    <span className="product-tile__name">{p.name}</span>
                    {sizeLabel && (
                      <span className={`product-tile__size ${isSel && batchSize ? 'product-tile__size--set' : ''}`}>
                        {sizeLabel}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {error && <p className="error-text">{error}</p>}

        <button
          className="btn btn--primary btn--full btn--lg"
          style={{ marginTop: 8 }}
          onClick={handleCreate}
          disabled={!readyToCreate || loading}
        >
          {loading ? 'Creating…' : 'Start Record'}
        </button>
      </div>

      {sheetOpen && selectedProduct && (
        <div className="batch-sheet-overlay" onClick={() => setSheetOpen(false)}>
          <div className="batch-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="batch-sheet__handle" />
            <div>
              <h3 className="batch-sheet__title">{selectedProduct.name}</h3>
              <p className="batch-sheet__sub">Select a batch size</p>
            </div>
            <div className="batch-sheet__grid">
              {selectedProduct.batch_sizes.map((size) => (
                <button key={size} type="button" className="batch-sheet__btn"
                  onClick={() => handleBatchPick(size)}>
                  <span className="batch-sheet__num">{size}</span>
                  <span className="batch-sheet__unit">bags</span>
                </button>
              ))}
            </div>
            <button className="btn btn--outline btn--full" onClick={() => setSheetOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
