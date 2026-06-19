// Fix 3: Replaced native <input type="time"> with a plain text field.
// The native time picker auto-advances after the first minute digit (e.g. typing 14:35
// produces 14:03), making two-digit minutes impossible without re-clicking the field.
// A text input with auto-colon insertion and numeric keyboard works reliably on tablets.

export default function TimeInput({ value, onChange, label, readOnly = false }) {
  function handleChange(e) {
    let v = e.target.value.replace(/[^\d:]/g, '')
    // Auto-insert colon after 2 digits if not already there
    if (v.length >= 2 && !v.includes(':')) {
      v = v.slice(0, 2) + ':' + v.slice(2)
    }
    if (v.length > 5) v = v.slice(0, 5)
    onChange(v)
  }

  return (
    <div className="field-group">
      {label && <label className="field-label">{label}</label>}
      <input
        type="text"
        className="field-input field-input--time"
        value={value || ''}
        onChange={handleChange}
        readOnly={readOnly}
        disabled={readOnly}
        placeholder="HH:MM"
        maxLength={5}
        inputMode="numeric"
      />
    </div>
  )
}
