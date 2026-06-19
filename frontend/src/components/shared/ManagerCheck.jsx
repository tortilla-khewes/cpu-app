import SectionCard from './SectionCard'

export default function ManagerCheck({ value, onChange, isManager, readOnly }) {
  const locked = !isManager || readOnly
  return (
    <SectionCard title="Manager Check" status={value ? 'complete' : 'not_started'}>
      <div className="field-group">
        <label className="field-label">Manager Name</label>
        <input
          className="field-input"
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          readOnly={locked}
          disabled={locked}
          placeholder={
            readOnly ? 'Record complete'
            : isManager ? 'Enter name to sign off'
            : 'Only a manager can sign off this record'
          }
        />
      </div>
    </SectionCard>
  )
}
