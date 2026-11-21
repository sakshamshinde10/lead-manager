// How each lead status looks. Defined once and shared by the badge and the
// stat cards, so a status always has the same colour everywhere.
//
// Every pair below passes WCAG AA contrast, and the status is always written
// out as text, so colour is never the only way to tell them apart.
export const STATUS_STYLES = {
  New: { chip: 'bg-[#ebd9c2] text-ink', dot: 'bg-[#8a6a4a]' },
  Contacted: { chip: 'bg-brand-100 text-[#9a2b0c]', dot: 'bg-brand-600' },
  Qualified: { chip: 'bg-brand-500 text-ink', dot: 'bg-ink' },
  Lost: { chip: 'bg-ink text-cream-50', dot: 'bg-cream-300' },
}

export const FALLBACK_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost']
