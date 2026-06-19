import { PRODUCTS } from '../../data/products'
import { filterNumeric, filterName } from '../../utils/inputFilters'
import SectionCard from '../shared/SectionCard'
import TimeInput from '../shared/TimeInput'
import IngredientTable from '../shared/IngredientTable'
import ManagerCheck from '../shared/ManagerCheck'
import RecordHeader from '../shared/RecordHeader'
import ImageUpload from '../shared/ImageUpload'

function sectionComplete(fields) {
  const vals = Object.values(fields)
  if (vals.every((v) => !v)) return 'not_started'
  if (vals.every((v) => !!v)) return 'complete'
  return 'in_progress'
}

export default function Type1Form({ record, onChange, readOnly, isManager }) {
  const product = PRODUCTS[record.product_key]
  const ccp = record.form_data?.ccp || {}

  function updateCcp(field, value) {
    onChange({ form_data: { ccp: { ...ccp, [field]: value } } })
  }
  function updateIngredient(index, field, value) {
    onChange({ ingredients: record.ingredients.map((ing, i) => i === index ? { ...ing, [field]: value } : ing) })
  }

  const ingStatus = record.ingredients.every((i) => i.added) ? 'complete'
    : record.ingredients.some((i) => i.date_code || i.batch_mill_1 || i.added) ? 'in_progress'
    : 'not_started'

  const ccpStatus = sectionComplete({
    name_start: ccp.name_start, start_time: ccp.start_time,
    name_finish: ccp.name_finish, finish_time: ccp.finish_time,
    kg_produced: ccp.kg_produced, supervisor_name: ccp.supervisor_name,
  })

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

      <SectionCard title="CCP" status={ccpStatus}>
        <div className="ccp-grid">
          <div className="field-row">
            <TimeInput label="Start Prep Time" value={ccp.start_time} onChange={(v) => updateCcp('start_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Name (Start)</label>
              <input className="field-input" type="text" value={ccp.name_start || ''}
                onChange={(e) => updateCcp('name_start', filterName(e.target.value))}
                readOnly={readOnly} disabled={readOnly} placeholder="Operative name" />
            </div>
          </div>
          <div className="field-row">
            <TimeInput label="Finish Prep Time" value={ccp.finish_time} onChange={(v) => updateCcp('finish_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Name (Finish)</label>
              <input className="field-input" type="text" value={ccp.name_finish || ''}
                onChange={(e) => updateCcp('name_finish', filterName(e.target.value))}
                readOnly={readOnly} disabled={readOnly} placeholder="Operative name" />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group field-group--half">
              <label className="field-label">Kg Produced</label>
              <input className="field-input" type="text" inputMode="decimal" value={ccp.kg_produced || ''}
                onChange={(e) => updateCcp('kg_produced', filterNumeric(e.target.value))}
                readOnly={readOnly} disabled={readOnly} placeholder="0.0" />
            </div>
            <div className="field-group field-group--half">
              <label className="field-label">Supervisor Name</label>
              <input className="field-input" type="text" value={ccp.supervisor_name || ''}
                onChange={(e) => updateCcp('supervisor_name', filterName(e.target.value))}
                readOnly={readOnly} disabled={readOnly} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Corrective Actions</label>
            <textarea className="field-input field-input--textarea" value={ccp.corrective_actions || ''}
              onChange={(e) => updateCcp('corrective_actions', e.target.value)}
              readOnly={readOnly} disabled={readOnly} placeholder="None required" rows={3} />
          </div>
        </div>
      </SectionCard>

      <ImageUpload images={record.images || []} onChange={(imgs) => onChange({ images: imgs })} readOnly={readOnly} />
      <ManagerCheck value={record.manager_check} onChange={(v) => onChange({ manager_check: v })} isManager={isManager} readOnly={readOnly} />
    </div>
  )
}
