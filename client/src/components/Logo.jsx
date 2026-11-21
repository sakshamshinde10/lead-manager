// The brand mark: a rounded square with an "L" and a dot (the dot is the lead).
// `onOrange` flips the colours so the mark stays visible on the orange panel.
export default function Logo({ onOrange = false }) {
  const box = onOrange ? '#2A1B14' : '#FF5A34'
  const stroke = onOrange ? '#FFF4E5' : '#2A1B14'
  const dot = onOrange ? '#FF5A34' : '#FFF4E5'

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill={box} />
        <path d="M21 15v33h25" fill="none" stroke={stroke} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="44" cy="22" r="6" fill={dot} />
      </svg>
      <span className="display text-sm tracking-wide">Lead Manager</span>
    </span>
  )
}
