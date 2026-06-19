// filterNumeric: allows digits, decimal point, and minus sign (for sub-zero temps)
export const filterNumeric = (v) => v.replace(/[^0-9.\-]/g, '')

// filterName: strips digits — letters, spaces, hyphens, apostrophes etc. pass through
export const filterName = (v) => v.replace(/[0-9]/g, '')
