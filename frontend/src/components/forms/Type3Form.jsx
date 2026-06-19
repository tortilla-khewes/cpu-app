import { PRODUCTS } from '../../data/products'
import { filterNumeric, filterName } from '../../utils/inputFilters'
import SectionCard from '../shared/SectionCard'
import TimeInput from '../shared/TimeInput'
import IngredientTable from '../shared/IngredientTable'
import ManagerCheck from '../shared/ManagerCheck'
import RecordHeader from '../shared/RecordHeader'
import ImageUpload from '../shared/ImageUpload'

export default function Type3Form({ record, onChange, readOnly, isManager }) {
  const product = PRODUCTS[record.product_key]
  const fd = record.form_data || {}
  const cooking = fd.cooking || {}
  const packing = fd.packing || {}
  const blast = fd.blast_chilling || {}

  function setFd(field, value) { onChange({ form_data: { [field]: value } }) }
  function setCooking(f, v) { onChange({ form_data: { cooking: { ...cooking, [f]: v } } }) }
  function setPacking(f, v) { onChange({ form_data: { packing: { ...packing, [f]: v } } }) }
  function setBlast(f, v) { onChange({ form_data: { blast_chilling: { ...blast, [f]: v } } }) }

  function updateIngredient(index, field, value) {
    onChange({ ingredients: record.ingredients.map((ing, i) => i === index ? { ...ing, [field]: value } : ing) })
  }

  const ingStatus = record.ingredients.every((i) => i.added) ? 'complete'
    : record.ingredients.some((i) => i.date_code || i.added) ? 'in_progress' : 'not_started'

  function statusOf(vals) {
    if (vals.every((v) => !v)) return 'not_started'
    if (vals.every((v) => !!v)) return 'complete'
    return 'in_progress'
  }

  return (
    <div className="form-body">
      <RecordHeader record={record} onChange={onChange} readOnly={readOnly} />

      <IngredientTable
        ingredients={record.ingredients}
        batchMillColumns={product?.batch_mill_columns || 1}
        readOnly={readOnly}
        onChange={updateIngredient}
        status={ingStatus}
      />

      {/* ── Cooking ── */}
      <SectionCard title="Cooking" status={statusOf([cooking.start_time, cooking.name_1, cooking.finish_time, cooking.name_2, cooking.temp_after_cooking])}>
        <p className="ccp-guidance">Must hold core temp of at least 90°C for 10 minutes</p>
        <div className="ccp-grid">
          <div className="field-row">
            <TimeInput label="Start Cook Time" value={cooking.start_time} onChange={(v) => setCooking('start_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Name</label>
              <input className="field-input" type="text" value={cooking.name_1 || ''}
                onChange={(e) => setCooking('name_1', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="Name" />
            </div>
          </div>
          <div className="field-row">
            <TimeInput label="Finish Cook Time" value={cooking.finish_time} onChange={(v) => setCooking('finish_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Name</label>
              <input className="field-input" type="text" value={cooking.name_2 || ''}
                onChange={(e) => setCooking('name_2', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="Name" />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group field-group--grow">
              <label className="field-label">Temp after Cooking (°C)</label>
              <input className="field-input" type="text" inputMode="decimal" value={cooking.temp_after_cooking || ''}
                onChange={(e) => setCooking('temp_after_cooking', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="e.g. 95" />
            </div>
            <div className="field-group field-group--grow">
              <label className="field-label">After Hold Time</label>
              <input className="field-input field-input--time" type="text" inputMode="numeric" value={cooking.after_hold_time || ''}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^\d:]/g, '')
                  if (v.length >= 2 && !v.includes(':')) v = v.slice(0, 2) + ':' + v.slice(2)
                  if (v.length > 5) v = v.slice(0, 5)
                  setCooking('after_hold_time', v)
                }}
                readOnly={readOnly} disabled={readOnly} placeholder="HH:MM" maxLength={5} />
            </div>
            <div className="field-group field-group--grow">
              <label className="field-label">Hold Temp (°C)</label>
              <input className="field-input" type="text" inputMode="decimal" value={cooking.hold_temp || ''}
                onChange={(e) => setCooking('hold_temp', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="e.g. 90" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Packing ── */}
      <SectionCard title="Packing" status={statusOf([packing.start_time, packing.name_1, packing.finish_time, packing.name_2])}>
        <div className="ccp-grid">
          <div className="field-row">
            <TimeInput label="Start Packing Time" value={packing.start_time} onChange={(v) => setPacking('start_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Temp (°C)</label>
              <input className="field-input" type="text" inputMode="decimal" value={packing.start_temp || ''}
                onChange={(e) => setPacking('start_temp', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="°C" />
            </div>
            <div className="field-group field-group--grow">
              <label className="field-label">Name</label>
              <input className="field-input" type="text" value={packing.name_1 || ''}
                onChange={(e) => setPacking('name_1', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="Name" />
            </div>
          </div>
          <div className="field-row">
            <TimeInput label="Finish Packing Time" value={packing.finish_time} onChange={(v) => setPacking('finish_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Temp (°C)</label>
              <input className="field-input" type="text" inputMode="decimal" value={packing.finish_temp || ''}
                onChange={(e) => setPacking('finish_temp', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="°C" />
            </div>
            <div className="field-group field-group--grow">
              <label className="field-label">Name</label>
              <input className="field-input" type="text" value={packing.name_2 || ''}
                onChange={(e) => setPacking('name_2', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="Name" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Blast Chilling ── */}
      <SectionCard title="Blast Chilling" status={statusOf([blast.start_time, blast.name_1, blast.finish_time, blast.name_2, blast.temp_coming_out])}>
        {/* Threshold only shown where confirmed in source CCP documents (beans only). */}
        {product?.blast_chill_threshold && (
          <p className="ccp-guidance">Temperature coming out must be below {product.blast_chill_threshold}</p>
        )}
        <div className="ccp-grid">
          <div className="field-row">
            <TimeInput label="Start Blast Chiller Time" value={blast.start_time} onChange={(v) => setBlast('start_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Temp Going In (°C)</label>
              <input className="field-input" type="text" inputMode="decimal" value={blast.temp_going_in || ''}
                onChange={(e) => setBlast('temp_going_in', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="°C" />
            </div>
            <div className="field-group field-group--grow">
              <label className="field-label">Name</label>
              <input className="field-input" type="text" value={blast.name_1 || ''}
                onChange={(e) => setBlast('name_1', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="Name" />
            </div>
          </div>
          <div className="field-row">
            <TimeInput label="Finish Blast Chiller Time" value={blast.finish_time} onChange={(v) => setBlast('finish_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Temp Coming Out (°C)</label>
              <input className="field-input" type="text" inputMode="decimal" value={blast.temp_coming_out || ''}
                onChange={(e) => setBlast('temp_coming_out', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="°C" />
            </div>
            <div className="field-group field-group--grow">
              <label className="field-label">Name</label>
              <input className="field-input" type="text" value={blast.name_2 || ''}
                onChange={(e) => setBlast('name_2', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="Name" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Sign-off ── */}
      <SectionCard title="Sign-off">
        <div className="ccp-grid">
          <div className="field-row">
            <div className="field-group field-group--half">
              <label className="field-label">Number of Bags Produced</label>
              <input className="field-input" type="text" inputMode="numeric" value={fd.bags_produced || ''}
                onChange={(e) => setFd('bags_produced', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} />
            </div>
            <div className="field-group field-group--half">
              <label className="field-label">Supervisor Name</label>
              <input className="field-input" type="text" value={fd.supervisor_name || ''}
                onChange={(e) => setFd('supervisor_name', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Corrective Actions</label>
            <textarea className="field-input field-input--textarea" value={fd.corrective_actions || ''}
              onChange={(e) => setFd('corrective_actions', e.target.value)} readOnly={readOnly} disabled={readOnly} rows={3} />
          </div>
          <div className="field-group">
            <label className="field-label">{product?.quality_label || 'Quality Check'}</label>
            {product?.quality_check === 'soft' ? (
              <div className="field-row" style={{ alignItems: 'center', gap: 12 }}>
                {['Yes', 'No'].map((opt) => (
                  <button key={opt}
                    className={`quality-btn ${fd.quality_check_value === opt ? 'quality-btn--selected' : ''}`}
                    onClick={() => !readOnly && setFd('quality_check_value', opt)}
                    disabled={readOnly}
                  >{opt}</button>
                ))}
                {fd.quality_check_value && <span className="field-hint">Recorded: {fd.quality_check_value}</span>}
              </div>
            ) : (
              <input className="field-input" type="text" inputMode="decimal" value={fd.quality_check_value || ''}
                onChange={(e) => setFd('quality_check_value', filterNumeric(e.target.value))}
                readOnly={readOnly} disabled={readOnly} placeholder="e.g. 3.9" />
            )}
          </div>
          <div className="field-row" style={{ alignItems: 'center' }}>
            <button
              className={`tick-btn ${fd.sample_taken ? 'tick-btn--checked' : ''}`}
              onClick={() => !readOnly && setFd('sample_taken', !fd.sample_taken)}
              disabled={readOnly}
            >{fd.sample_taken ? '✓' : ''}</button>
            <span className="field-label" style={{ marginLeft: 12 }}>Sample Taken</span>
          </div>
        </div>
      </SectionCard>

      <ImageUpload images={record.images || []} onChange={(imgs) => onChange({ images: imgs })} readOnly={readOnly} />
      <ManagerCheck value={record.manager_check} onChange={(v) => onChange({ manager_check: v })} isManager={isManager} readOnly={readOnly} />
    </div>
  )
}
