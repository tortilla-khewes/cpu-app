import { PRODUCTS } from '../../data/products'
import { filterNumeric, filterName } from '../../utils/inputFilters'
import SectionCard from '../shared/SectionCard'
import TimeInput from '../shared/TimeInput'
import IngredientTable from '../shared/IngredientTable'
import ManagerCheck from '../shared/ManagerCheck'
import RecordHeader from '../shared/RecordHeader'
import ImageUpload from '../shared/ImageUpload'

export default function Type4Form({ record, onChange, readOnly, isManager }) {
  const product = PRODUCTS[record.product_key]
  const fd = record.form_data || {}
  const isBarbacoa = record.product_key === 'barbacoa'

  function set(field, value) { onChange({ form_data: { [field]: value } }) }
  function updateIngredient(index, field, value) {
    onChange({ ingredients: record.ingredients.map((ing, i) => i === index ? { ...ing, [field]: value } : ing) })
  }
  function updatePackIng(index, field, value) {
    const updated = (fd.pack_ingredients || []).map((ing, i) => i === index ? { ...ing, [field]: value } : ing)
    set('pack_ingredients', updated)
  }

  const ingStatus = record.ingredients.every((i) => i.added) ? 'complete'
    : record.ingredients.some((i) => i.date_code || i.added) ? 'in_progress' : 'not_started'

  function nameField(label, field) {
    return (
      <div className="field-group field-group--grow">
        <label className="field-label">{label}</label>
        <input className="field-input" type="text" value={fd[field] || ''}
          onChange={(e) => set(field, filterName(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder="Name" />
      </div>
    )
  }

  function tempField(label, field, placeholder) {
    return (
      <div className="field-group field-group--grow">
        <label className="field-label">{label}</label>
        <input className="field-input" type="text" inputMode="decimal" value={fd[field] || ''}
          onChange={(e) => set(field, filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} placeholder={placeholder || '°C'} />
      </div>
    )
  }

  return (
    <div className="form-body">
      <RecordHeader record={record} onChange={onChange} readOnly={readOnly} />

      <IngredientTable
        title={isBarbacoa ? 'Pre-Rub Ingredients' : 'Ingredients'}
        ingredients={record.ingredients}
        batchMillColumns={product?.batch_mill_columns || 2}
        readOnly={readOnly}
        onChange={updateIngredient}
        status={ingStatus}
      />

      {isBarbacoa && (
        <SectionCard title="Tumbling">
          <div className="ccp-grid">
            <div className="field-row">
              <TimeInput label="Tumbling Start Time" value={fd.tumble_start_time} onChange={(v) => set('tumble_start_time', v)} readOnly={readOnly} />
              <TimeInput label="Tumbling Finish Time" value={fd.tumble_finish_time} onChange={(v) => set('tumble_finish_time', v)} readOnly={readOnly} />
            </div>
          </div>
        </SectionCard>
      )}

      {isBarbacoa && fd.pack_ingredients?.length > 0 && (
        <IngredientTable
          title="Post-Rub Ingredients"
          ingredients={fd.pack_ingredients}
          batchMillColumns={2}
          readOnly={readOnly}
          onChange={updatePackIng}
          status="not_started"
        />
      )}

      <SectionCard title="CCP">
        <div className="ccp-grid">
          <p className="ccp-role-label">Prep</p>
          <div className="field-row">
            <TimeInput label={isBarbacoa ? 'Start Prep (First Bag)' : 'Start Prep Time'} value={fd.prep_start_time} onChange={(v) => set('prep_start_time', v)} readOnly={readOnly} />
            {nameField(isBarbacoa ? 'Name Filling' : 'Name', isBarbacoa ? 'name_filling' : 'prep_name')}
          </div>
          <div className="field-row">
            <TimeInput label="Finish Prep Time" value={fd[isBarbacoa ? 'prep_finish_time' : 'prep_finish_time_1']} onChange={(v) => set(isBarbacoa ? 'prep_finish_time' : 'prep_finish_time_1', v)} readOnly={readOnly} />
            {nameField(isBarbacoa ? 'Name Packing' : 'Name Filling', isBarbacoa ? 'name_packing' : 'name_filling')}
          </div>
          {!isBarbacoa && (
            <div className="field-row">
              <TimeInput label="Finish Prep Time" value={fd.prep_finish_time_2} onChange={(v) => set('prep_finish_time_2', v)} readOnly={readOnly} />
              {nameField('Name Packing', 'name_packing')}
            </div>
          )}

          <p className="ccp-role-label">Cooking</p>
          <p className="ccp-guidance">Must hold core temperature of at least 90°C for 10 minutes</p>
          <div className="field-row">
            <div className="field-group field-group--half">
              <label className="field-label">Oven Number</label>
              <input className="field-input" type="text" value={fd.oven_number || ''}
                onChange={(e) => set('oven_number', e.target.value)} readOnly={readOnly} disabled={readOnly} placeholder="e.g. Oven 1" />
            </div>
          </div>
          <div className="field-row">
            <TimeInput label="Start Cook Time" value={fd.cook_start_time} onChange={(v) => set('cook_start_time', v)} readOnly={readOnly} />
            {nameField('Name', 'cook_name_1')}
          </div>
          <div className="field-row">
            <TimeInput label="Finish Cook Time" value={fd.cook_finish_time} onChange={(v) => set('cook_finish_time', v)} readOnly={readOnly} />
            {nameField('Name', 'cook_name_2')}
          </div>
          <div className="field-row">
            <div className="field-group field-group--half">
              <label className="field-label">After Hold Time</label>
              <input className="field-input field-input--time" type="text" inputMode="numeric" value={fd.after_hold_time || ''}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^\d:]/g, '')
                  if (v.length >= 2 && !v.includes(':')) v = v.slice(0, 2) + ':' + v.slice(2)
                  if (v.length > 5) v = v.slice(0, 5)
                  set('after_hold_time', v)
                }}
                readOnly={readOnly} disabled={readOnly} placeholder="HH:MM" maxLength={5} />
            </div>
            {tempField('Hold Temp (°C)', 'hold_temp', 'e.g. 96')}
          </div>

          <p className="ccp-role-label">Blast Chilling</p>
          <p className="ccp-guidance">Temperature coming out must be below {isBarbacoa ? '5°C' : '4°C'}</p>
          <div className="field-row">
            <div className="field-group field-group--half">
              <label className="field-label">Blast Chiller / Bath #</label>
              <input className="field-input" type="text" value={fd.blast_number || ''}
                onChange={(e) => set('blast_number', e.target.value)} readOnly={readOnly} disabled={readOnly} placeholder="e.g. BC1" />
            </div>
          </div>
          <div className="field-row">
            <TimeInput label="Start Blast Chiller" value={fd.blast_start_time} onChange={(v) => set('blast_start_time', v)} readOnly={readOnly} />
            {tempField('Temp Going In (°C)', 'blast_temp_in')}
            {nameField('Name', 'blast_name_1')}
          </div>
          <div className="field-row">
            <TimeInput label="Finish Blast Chiller" value={fd.blast_finish_time} onChange={(v) => set('blast_finish_time', v)} readOnly={readOnly} />
            {tempField('Temp Coming Out (°C)', 'blast_temp_out')}
            {nameField('Name', 'blast_name_2')}
          </div>

          <div className="field-row">
            <div className="field-group field-group--half">
              <label className="field-label">Number of Bags Produced</label>
              <input className="field-input" type="text" inputMode="numeric" value={fd.bags_produced || ''}
                onChange={(e) => set('bags_produced', filterNumeric(e.target.value))} readOnly={readOnly} disabled={readOnly} />
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

      <SectionCard title="Sample Bag">
        <div className="table-wrapper">
          <table className="ing-table">
            <colgroup>
              <col className="ing-col--name" />
              <col className="ing-col--qty" />
              <col className="ing-col--code" />
              <col className="ing-col--tick" />
            </colgroup>
            <thead>
              <tr><th>Ingredient</th><th>Qty</th><th>Date / Code</th><th>Taken</th></tr>
            </thead>
            <tbody>
              {(product?.sample_bag || []).map((row, i) => {
                const dateFields = isBarbacoa
                  ? ['sample_brisket_date_code', 'sample_bay_leaves_date_code', null]
                  : ['sample_pork_date_code', 'sample_rub_date_code', 'sample_onions_date_code']
                const dateField = dateFields[i]
                return (
                  <tr key={row.name}>
                    <td className="ing-table__name">{row.name}</td>
                    <td className="ing-table__qty">{row.qty}</td>
                    <td>
                      {dateField
                        ? <input className="field-input field-input--cell" type="text" value={fd[dateField] || ''} onChange={(e) => set(dateField, e.target.value)} readOnly={readOnly} disabled={readOnly} />
                        : <span className="ing-table__qty">—</span>}
                    </td>
                    {i === 0 && (
                      <td rowSpan={product.sample_bag.length} className="ing-table__tick" style={{ verticalAlign: 'middle' }}>
                        <button className={`tick-btn ${fd.sample_taken ? 'tick-btn--checked' : ''}`}
                          onClick={() => !readOnly && set('sample_taken', !fd.sample_taken)} disabled={readOnly}>
                          {fd.sample_taken ? '✓' : ''}
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ImageUpload images={record.images || []} onChange={(imgs) => onChange({ images: imgs })} readOnly={readOnly} />
      <ManagerCheck value={record.manager_check} onChange={(v) => onChange({ manager_check: v })} isManager={isManager} readOnly={readOnly} />
    </div>
  )
}
