export default function SectionCard({ title, children, status, stepNum }) {
  const statusLabels = { complete: 'Complete', in_progress: 'In progress' }
  const statusIcons  = { complete: '✓ ', in_progress: '◐ ' }
  const statusMod    = status ? `section-card--${status}` : ''
  const label        = statusLabels[status] || ''
  const icon         = statusIcons[status]  || ''

  return (
    <section className={`section-card ${statusMod}`}>
      <div className="section-card__header">
        <div className="sc-header-left">
          {stepNum != null && (
            <span className={`step-num step-num--${status || 'not_started'}`}>{stepNum}</span>
          )}
          <h3 className="section-card__title">{title}</h3>
        </div>
        {status && label && (
          <span className={`section-status section-status--${status}`}>
            {icon}{label}
          </span>
        )}
      </div>
      <div className="section-card__body">{children}</div>
    </section>
  )
}
