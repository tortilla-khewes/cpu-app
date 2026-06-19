// Fix 1: table-layout: fixed with controlled column widths eliminates horizontal overflow.

import SectionCard from './SectionCard'

export default function IngredientTable({
  title = 'Ingredients',
  ingredients,
  batchMillColumns = 1,
  readOnly = false,
  onChange,
  status,
  colLabel1 = 'Date / Code',
  colLabel2 = 'Batch/Mill #1',
}) {
  const addedCount = ingredients.filter((i) => i.added).length
  const totalCount = ingredients.length

  const autoStatus = status || (
    ingredients.every((i) => i.added) ? 'complete'
    : ingredients.some((i) => i.date_code || i.batch_mill_1 || i.added) ? 'in_progress'
    : 'not_started'
  )

  return (
    <SectionCard title={title} status={autoStatus}>
      <div className="table-wrapper">
        <table className="ing-table">
          <colgroup>
            <col className="ing-col--name" />
            <col className="ing-col--qty" />
            <col className="ing-col--code" />
            <col className="ing-col--batch" />
            {batchMillColumns >= 2 && <col className="ing-col--batch" />}
            <col className="ing-col--tick" />
          </colgroup>
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Qty</th>
              <th>{colLabel1}</th>
              <th>{colLabel2}</th>
              {batchMillColumns >= 2 && <th>Batch/Mill #2</th>}
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, i) => (
              <tr key={i} className={ing.added ? 'ing-table__row--done' : ''}>
                <td className="ing-table__name">{ing.name}</td>
                <td className="ing-table__qty">{ing.std_quantity}</td>
                <td>
                  <input className="field-input field-input--cell" type="text"
                    value={ing.date_code || ''} readOnly={readOnly} disabled={readOnly}
                    onChange={(e) => onChange(i, 'date_code', e.target.value)} />
                </td>
                <td>
                  <input className="field-input field-input--cell" type="text"
                    value={ing.batch_mill_1 || ''} readOnly={readOnly} disabled={readOnly}
                    onChange={(e) => onChange(i, 'batch_mill_1', e.target.value)} />
                </td>
                {batchMillColumns >= 2 && (
                  <td>
                    <input className="field-input field-input--cell" type="text"
                      value={ing.batch_mill_2 || ''} readOnly={readOnly} disabled={readOnly}
                      onChange={(e) => onChange(i, 'batch_mill_2', e.target.value)} />
                  </td>
                )}
                <td className="ing-table__tick">
                  <button
                    className={`tick-btn ${ing.added ? 'tick-btn--checked' : ''}`}
                    onClick={() => !readOnly && onChange(i, 'added', !ing.added)}
                    disabled={readOnly}
                    aria-label={ing.added ? 'Unmark' : 'Mark added'}
                  >{ing.added ? '✓' : ''}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalCount > 0 && (
        <div className="ing-progress">
          <span className="ing-progress-label">{addedCount} / {totalCount} added</span>
          <div className="ing-progress-track">
            <div
              className="ing-progress-fill"
              style={{ width: `${(addedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </SectionCard>
  )
}
