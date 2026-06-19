import { PRODUCTS } from '../../data/products'
import { filterNumeric, filterName } from '../../utils/inputFilters'
import SectionCard from '../shared/SectionCard'
import IngredientTable from '../shared/IngredientTable'
import ManagerCheck from '../shared/ManagerCheck'
import RecordHeader from '../shared/RecordHeader'
import ImageUpload from '../shared/ImageUpload'

// Module-level plain functions — called as {timeCell(...)} not <TimeCell />, so React
// never treats them as a component type and never unmounts them on re-render.
function timeCell(value, onChange, readOnly) {
  function handleChange(e) {
    let v = e.target.value.replace(/[^\d:]/g, '')
    if (v.length >= 2 && !v.includes(':')) v = v.slice(0, 2) + ':' + v.slice(2)
    if (v.length > 5) v = v.slice(0, 5)
    onChange(v)
  }
  return (
    <input className="field-input field-input--cell field-input--time" type="text"
      inputMode="numeric" value={value || ''} onChange={handleChange}
      readOnly={readOnly} disabled={readOnly} placeholder="HH:MM" maxLength={5} />
  )
}

function numCell(value, onChange, readOnly, placeholder) {
  return (
    <input className="field-input field-input--cell" type="text" inputMode="decimal"
      value={value || ''} onChange={(e) => onChange(filterNumeric(e.target.value))}
      readOnly={readOnly} disabled={readOnly} placeholder={placeholder || ''} />
  )
}

function textCell(value, onChange, readOnly) {
  return (
    <input className="field-input field-input--cell" type="text"
      value={value || ''} onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly} disabled={readOnly} />
  )
}

export default function Type5Form({ record, onChange, readOnly, isManager }) {
  const product = PRODUCTS[record.product_key]
  const fd = record.form_data || {}

  const ovenBatches = fd.oven_batches || Array.from({ length: 5 }, () => ({ start_time: '', finish_time: '', temp_1: '', temp_2: '', temp_3: '', comments: '' }))
  const chillBatches = fd.chill_batches || Array.from({ length: 5 }, () => ({ fridge: '', start_time: '', finish_time: '', temp_out_1: '', temp_out_2: '', comments: '' }))
  const packRows = fd.packing_rows || Array.from({ length: 5 }, () => ({ start_time: '', finish_time: '', bags: '', temperature: '', corrective_actions: '' }))
  const ovenSigs = fd.oven_signatories || ['', '']
  const chillSigs = fd.chill_signatories || ['', '']
  const packSigs = fd.packing_signatories || ['', '', '']

  function set(field, value) { onChange({ form_data: { [field]: value } }) }
  function updateIngredient(index, field, value) {
    onChange({ ingredients: record.ingredients.map((ing, i) => i === index ? { ...ing, [field]: value } : ing) })
  }
  function updOven(bi, f, v) { set('oven_batches', ovenBatches.map((b, i) => i === bi ? { ...b, [f]: v } : b)) }
  function updChill(bi, f, v) { set('chill_batches', chillBatches.map((b, i) => i === bi ? { ...b, [f]: v } : b)) }
  function updPack(ri, f, v) { set('packing_rows', packRows.map((r, i) => i === ri ? { ...r, [f]: v } : r)) }
  function updOvenSig(idx, v) { const s = [...ovenSigs]; s[idx] = filterName(v); set('oven_signatories', s) }
  function updChillSig(idx, v) { const s = [...chillSigs]; s[idx] = filterName(v); set('chill_signatories', s) }
  function updPackSig(idx, v) { const s = [...packSigs]; s[idx] = filterName(v); set('packing_signatories', s) }

  const ingStatus = record.ingredients.every((i) => i.added) ? 'complete'
    : record.ingredients.some((i) => i.date_code || i.added) ? 'in_progress' : 'not_started'

  const hasOvenData = ovenBatches.some((b) => b.start_time || b.temp_1)
  const hasChillData = chillBatches.some((b) => b.start_time || b.temp_out_1)
  const hasPackData = packRows.some((r) => r.start_time || r.bags)

  return (
    <div className="form-body">
      <RecordHeader record={record} onChange={onChange} readOnly={readOnly} />

      <IngredientTable
        ingredients={record.ingredients}
        batchMillColumns={2}
        colLabel1="Full Batch Code"
        readOnly={readOnly}
        onChange={updateIngredient}
        status={ingStatus}
      />

      {/* ── Oven Cook ── */}
      <SectionCard title="Oven Cook" status={hasOvenData ? 'in_progress' : 'not_started'}>
        <p className="ccp-guidance">Must reach core temperature of 75°C for 30 seconds</p>
        <div className="field-group" style={{ marginBottom: 12 }}>
          <label className="field-label">Signed by</label>
          <div className="field-row">
            {ovenSigs.map((sig, i) => (
              <input key={i} className="field-input" type="text" value={sig}
                onChange={(e) => updOvenSig(i, e.target.value)}
                readOnly={readOnly} disabled={readOnly} placeholder={`Signature ${i + 1}`} />
            ))}
          </div>
        </div>
        <div className="table-wrapper">
          <table className="ing-table batch-table">
            <colgroup>
              <col style={{ width: '52px' }} /><col style={{ width: '90px' }} /><col style={{ width: '90px' }} />
              <col style={{ width: '80px' }} /><col style={{ width: '80px' }} /><col style={{ width: '80px' }} /><col />
            </colgroup>
            <thead>
              <tr><th>Batch</th><th>Start</th><th>Finish</th><th>T1 (°C)</th><th>T2 (°C)</th><th>T3 (°C)</th><th>Comments</th></tr>
            </thead>
            <tbody>
              {ovenBatches.map((b, i) => (
                <tr key={i}>
                  <td className="ing-table__name">#{i + 1}</td>
                  <td>{timeCell(b.start_time, (v) => updOven(i, 'start_time', v), readOnly)}</td>
                  <td>{timeCell(b.finish_time, (v) => updOven(i, 'finish_time', v), readOnly)}</td>
                  <td>{numCell(b.temp_1, (v) => updOven(i, 'temp_1', v), readOnly, '°C')}</td>
                  <td>{numCell(b.temp_2, (v) => updOven(i, 'temp_2', v), readOnly, '°C')}</td>
                  <td>{numCell(b.temp_3, (v) => updOven(i, 'temp_3', v), readOnly, '°C')}</td>
                  <td>{textCell(b.comments, (v) => updOven(i, 'comments', v), readOnly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Chill ── */}
      <SectionCard title="Chill" status={hasChillData ? 'in_progress' : 'not_started'}>
        <p className="ccp-guidance">Must be below 4°C</p>
        <div className="field-group" style={{ marginBottom: 12 }}>
          <label className="field-label">Signed by</label>
          <div className="field-row">
            {chillSigs.map((sig, i) => (
              <input key={i} className="field-input" type="text" value={sig}
                onChange={(e) => updChillSig(i, e.target.value)}
                readOnly={readOnly} disabled={readOnly} placeholder={`Signature ${i + 1}`} />
            ))}
          </div>
        </div>
        <div className="table-wrapper">
          <table className="ing-table batch-table">
            <colgroup>
              <col style={{ width: '52px' }} /><col style={{ width: '80px' }} /><col style={{ width: '90px' }} />
              <col style={{ width: '90px' }} /><col style={{ width: '80px' }} /><col style={{ width: '80px' }} /><col />
            </colgroup>
            <thead>
              <tr><th>Batch</th><th>Fridge</th><th>Start</th><th>Finish</th><th>T Out 1</th><th>T Out 2</th><th>Comments</th></tr>
            </thead>
            <tbody>
              {chillBatches.map((b, i) => (
                <tr key={i}>
                  <td className="ing-table__name">#{i + 1}</td>
                  <td>{textCell(b.fridge, (v) => updChill(i, 'fridge', v), readOnly)}</td>
                  <td>{timeCell(b.start_time, (v) => updChill(i, 'start_time', v), readOnly)}</td>
                  <td>{timeCell(b.finish_time, (v) => updChill(i, 'finish_time', v), readOnly)}</td>
                  <td>{numCell(b.temp_out_1, (v) => updChill(i, 'temp_out_1', v), readOnly, '°C')}</td>
                  <td>{numCell(b.temp_out_2, (v) => updChill(i, 'temp_out_2', v), readOnly, '°C')}</td>
                  <td>{textCell(b.comments, (v) => updChill(i, 'comments', v), readOnly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Packing ── */}
      <SectionCard title="Packing" status={hasPackData ? 'in_progress' : 'not_started'}>
        <div className="field-group" style={{ marginBottom: 12 }}>
          <label className="field-label">Signed by</label>
          <div className="field-row">
            {packSigs.map((sig, i) => (
              <input key={i} className="field-input" type="text" value={sig}
                onChange={(e) => updPackSig(i, e.target.value)}
                readOnly={readOnly} disabled={readOnly} placeholder={`Signature ${i + 1}`} />
            ))}
          </div>
        </div>
        <div className="table-wrapper">
          <table className="ing-table batch-table">
            <colgroup>
              <col style={{ width: '52px' }} /><col style={{ width: '90px' }} /><col style={{ width: '90px' }} />
              <col style={{ width: '70px' }} /><col style={{ width: '80px' }} /><col />
            </colgroup>
            <thead>
              <tr><th>Row</th><th>Start</th><th>Finish</th><th># Bags</th><th>Temp (°C)</th><th>Corrective Actions</th></tr>
            </thead>
            <tbody>
              {packRows.map((r, i) => (
                <tr key={i}>
                  <td className="ing-table__name">#{i + 1}</td>
                  <td>{timeCell(r.start_time, (v) => updPack(i, 'start_time', v), readOnly)}</td>
                  <td>{timeCell(r.finish_time, (v) => updPack(i, 'finish_time', v), readOnly)}</td>
                  <td>{numCell(r.bags, (v) => updPack(i, 'bags', v), readOnly, '0')}</td>
                  <td>{numCell(r.temperature, (v) => updPack(i, 'temperature', v), readOnly, '°C')}</td>
                  <td>{textCell(r.corrective_actions, (v) => updPack(i, 'corrective_actions', v), readOnly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Sign-off">
        <div className="ccp-grid">
          <div className="field-group">
            <label className="field-label">Supervisor Name</label>
            <input className="field-input" type="text" value={fd.supervisor_name || ''}
              onChange={(e) => set('supervisor_name', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
          </div>
          <div className="field-row" style={{ alignItems: 'center' }}>
            <button className={`tick-btn ${fd.samples_taken ? 'tick-btn--checked' : ''}`}
              onClick={() => !readOnly && set('samples_taken', !fd.samples_taken)} disabled={readOnly}>
              {fd.samples_taken ? '✓' : ''}
            </button>
            <span className="field-label" style={{ marginLeft: 12 }}>Samples Taken</span>
          </div>
        </div>
      </SectionCard>

      <ImageUpload images={record.images || []} onChange={(imgs) => onChange({ images: imgs })} readOnly={readOnly} />
      <ManagerCheck value={record.manager_check} onChange={(v) => onChange({ manager_check: v })} isManager={isManager} readOnly={readOnly} />
    </div>
  )
}
