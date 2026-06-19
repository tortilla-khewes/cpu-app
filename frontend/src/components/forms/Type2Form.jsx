import { PRODUCTS } from '../../data/products'
import { filterNumeric, filterName } from '../../utils/inputFilters'
import SectionCard from '../shared/SectionCard'
import TimeInput from '../shared/TimeInput'
import IngredientTable from '../shared/IngredientTable'
import ManagerCheck from '../shared/ManagerCheck'
import RecordHeader from '../shared/RecordHeader'
import ImageUpload from '../shared/ImageUpload'

export default function Type2Form({ record, onChange, readOnly, isManager }) {
  const product = PRODUCTS[record.product_key]
  const fd = record.form_data || {}

  function set(field, value) { onChange({ form_data: { [field]: value } }) }
  function updateIngredient(index, field, value) {
    onChange({ ingredients: record.ingredients.map((ing, i) => i === index ? { ...ing, [field]: value } : ing) })
  }

  const ingStatus = record.ingredients.every((i) => i.added) ? 'complete'
    : record.ingredients.some((i) => i.date_code || i.batch_mill_1 || i.added) ? 'in_progress'
    : 'not_started'

  function renderCCP() {
    if (record.product_key === 'chicken_brine') {
      const ccp = fd.ccp || {}
      function setCcp(f, v) { onChange({ form_data: { ccp: { ...ccp, [f]: v } } }) }
      return (
        <SectionCard title="CCP">
          <div className="ccp-grid">
            <div className="field-row">
              <TimeInput label="Start Prep Time" value={ccp.start_time} onChange={(v) => setCcp('start_time', v)} readOnly={readOnly} />
              <div className="field-group field-group--grow">
                <label className="field-label">Name (Start)</label>
                <input className="field-input" type="text" value={ccp.name_start || ''}
                  onChange={(e) => setCcp('name_start', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
            </div>
            <div className="field-row">
              <TimeInput label="Finish Prep Time" value={ccp.finish_time} onChange={(v) => setCcp('finish_time', v)} readOnly={readOnly} />
              <div className="field-group field-group--grow">
                <label className="field-label">Name (Finish)</label>
                <input className="field-input" type="text" value={ccp.name_finish || ''}
                  onChange={(e) => setCcp('name_finish', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group field-group--half">
                <label className="field-label">Kg Produced</label>
                <input className="field-input" type="text" inputMode="decimal" value={ccp.kg_produced || ''}
                  onChange={(e) => setCcp('kg_produced', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
              <div className="field-group field-group--half">
                <label className="field-label">Supervisor Name</label>
                <input className="field-input" type="text" value={ccp.supervisor_name || ''}
                  onChange={(e) => setCcp('supervisor_name', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Corrective Actions</label>
              <textarea className="field-input field-input--textarea" value={ccp.corrective_actions || ''}
                onChange={(e) => setCcp('corrective_actions', e.target.value)} readOnly={readOnly} disabled={readOnly} rows={3} />
            </div>
          </div>
        </SectionCard>
      )
    }

    if (record.product_key === 'asado_marinate') {
      return (
        <SectionCard title="CCP">
          <div className="ccp-grid">
            <p className="ccp-role-label">Prep</p>
            <div className="field-row">
              <TimeInput label="Start Prep Time" value={fd.prep_start_time} onChange={(v) => set('prep_start_time', v)} readOnly={readOnly} />
              <div className="field-group field-group--grow">
                <label className="field-label">Name (Start)</label>
                <input className="field-input" type="text" value={fd.prep_name_start || ''}
                  onChange={(e) => set('prep_name_start', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
            </div>
            <div className="field-row">
              <TimeInput label="Finish Prep Time" value={fd.prep_finish_time} onChange={(v) => set('prep_finish_time', v)} readOnly={readOnly} />
              <div className="field-group field-group--grow">
                <label className="field-label">Name (Finish)</label>
                <input className="field-input" type="text" value={fd.prep_name_finish || ''}
                  onChange={(e) => set('prep_name_finish', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group field-group--half">
                <label className="field-label">Number of Bags Produced</label>
                <input className="field-input" type="text" inputMode="numeric" value={fd.bags_produced || ''}
                  onChange={(e) => set('bags_produced', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
            </div>
            <p className="ccp-role-label">Pack</p>
            <div className="field-row">
              <TimeInput label="Start Pack Time" value={fd.pack_start_time} onChange={(v) => set('pack_start_time', v)} readOnly={readOnly} />
              <div className="field-group field-group--grow">
                <label className="field-label">Name (Start)</label>
                <input className="field-input" type="text" value={fd.pack_name_start || ''}
                  onChange={(e) => set('pack_name_start', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
            </div>
            <div className="field-row">
              <TimeInput label="Finish Pack Time" value={fd.pack_finish_time} onChange={(v) => set('pack_finish_time', v)} readOnly={readOnly} />
              <div className="field-group field-group--grow">
                <label className="field-label">Name (Finish)</label>
                <input className="field-input" type="text" value={fd.pack_name_finish || ''}
                  onChange={(e) => set('pack_name_finish', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group field-group--half">
                <label className="field-label">Supervisor Name</label>
                <input className="field-input" type="text" value={fd.supervisor_name || ''}
                  onChange={(e) => set('supervisor_name', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
              </div>
              <div className="field-group field-group--half">
                <label className="field-label">pH Reading (should be 5 or below)</label>
                <input className="field-input" type="text" inputMode="decimal" value={fd.ph_reading || ''}
                  onChange={(e) => set('ph_reading', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="e.g. 4.2" />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Corrective Actions</label>
              <textarea className="field-input field-input--textarea" value={fd.corrective_actions || ''}
                onChange={(e) => set('corrective_actions', e.target.value)} readOnly={readOnly} disabled={readOnly} rows={3} />
            </div>
          </div>
        </SectionCard>
      )
    }

    // Chicken Whole Marinate
    return (
      <SectionCard title="CCP">
        <div className="ccp-grid">
          <p className="ccp-role-label">Liquid Prep</p>
          <div className="field-row">
            <TimeInput label="Start Prep Time" value={fd.liquid_start_time} onChange={(v) => set('liquid_start_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Name (Start)</label>
              <input className="field-input" type="text" value={fd.liquid_name_start || ''}
                onChange={(e) => set('liquid_name_start', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
            </div>
          </div>
          <div className="field-row">
            <TimeInput label="Finish Prep Time" value={fd.liquid_finish_time} onChange={(v) => set('liquid_finish_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Name (Finish)</label>
              <input className="field-input" type="text" value={fd.liquid_name_finish || ''}
                onChange={(e) => set('liquid_name_finish', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
            </div>
          </div>
          <p className="ccp-role-label">Tumbling</p>
          <div className="field-row">
            <TimeInput label="Start Tumbling Time" value={fd.tumble_start_time} onChange={(v) => set('tumble_start_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Name (Start)</label>
              <input className="field-input" type="text" value={fd.tumble_name_start || ''}
                onChange={(e) => set('tumble_name_start', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
            </div>
          </div>
          <div className="field-row">
            <TimeInput label="Finish Tumbling Time" value={fd.tumble_finish_time} onChange={(v) => set('tumble_finish_time', v)} readOnly={readOnly} />
            <div className="field-group field-group--grow">
              <label className="field-label">Name (Finish)</label>
              <input className="field-input" type="text" value={fd.tumble_name_finish || ''}
                onChange={(e) => set('tumble_name_finish', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
            </div>
          </div>
          <div className="field-row">
            <div className="field-group field-group--half">
              <label className="field-label">Kg Produced</label>
              <input className="field-input" type="text" inputMode="decimal" value={fd.kg_produced || ''}
                onChange={(e) => set('kg_produced', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} />
            </div>
            <div className="field-group field-group--half">
              <label className="field-label">Supervisor Name</label>
              <input className="field-input" type="text" value={fd.supervisor_name || ''}
                onChange={(e) => set('supervisor_name', filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Corrective Actions</label>
            <textarea className="field-input field-input--textarea" value={fd.corrective_actions || ''}
              onChange={(e) => set('corrective_actions', e.target.value)} readOnly={readOnly} disabled={readOnly} rows={3} />
          </div>
        </div>
      </SectionCard>
    )
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
      {renderCCP()}
      <ImageUpload images={record.images || []} onChange={(imgs) => onChange({ images: imgs })} readOnly={readOnly} />
      <ManagerCheck value={record.manager_check} onChange={(v) => onChange({ manager_check: v })} isManager={isManager} readOnly={readOnly} />
    </div>
  )
}
