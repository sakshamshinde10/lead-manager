const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
const longDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

// "21 Nov" for this year, "21 Nov 2025" for older leads.
export function formatDate(isoString) {
  const date = new Date(isoString)
  return date.getFullYear() === new Date().getFullYear() ? shortDate.format(date) : longDate.format(date)
}
