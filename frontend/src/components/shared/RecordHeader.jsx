// Fix 7: Production date is now editable inside the form (not just on the New Record screen).
// Use-by date remains read-only and recalculates automatically when date of production changes.

import { PRODUCTS, addDays } from '../../data/products'
import SectionCard from './SectionCard'

export default function RecordHeader({ record, onChange, readOnly }) {
  const product = PRODUCTS[record.product_key]

  function handleDateChange(e) {
    const newDate = e.target.value
    if (!newDate) return
    const newUseBy = product ? addDays(newDate, product.use_by_days) : record.use_by_date
    onChange({ date_of_production: newDate, use_by_date: newUseBy })
  }

  return (
    <SectionCard title="Record Header" status="complete">
      <div className="field-row">
        <div className="field-group field-group--half">
          <label className="field-label">Lot Number</label>
          <input
            className="field-input"
            type="text"
            value={record.lot_number || ''}
            onChange={(e) => onChange({ lot_number: e.target.value })}
            readOnly={readOnly}
            disabled={readOnly}
            placeholder={product?.lot_format || 'Lot number'}
          />
        </div>
        <div className="field-group field-group--half">
          <label className="field-label">Date of Production</label>
          <input
            className="field-input"
            type="date"
            value={record.date_of_production || ''}
            onChange={handleDateChange}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field-group field-group--half">
          <label className="field-label">Use-by Date (auto)</label>
          <input
            className="field-input field-input--readonly"
            type="text"
            value={record.use_by_date?.split('-').reverse().join('/') || ''}
            readOnly
            disabled
          />
        </div>
        {record.batch_size ? (
          <div className="field-group field-group--half">
            <label className="field-label">Batch Size</label>
            <input className="field-input field-input--readonly" type="text" value={`${record.batch_size} bags`} readOnly disabled />
          </div>
        ) : product?.bags ? (
          <div className="field-group field-group--half">
            <label className="field-label">Bags</label>
            <input className="field-input field-input--readonly" type="text" value={`${product.bags} bags`} readOnly disabled />
          </div>
        ) : null}
      </div>
    </SectionCard>
  )
}
