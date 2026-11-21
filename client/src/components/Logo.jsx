// The brand mark is a wordmark: "lead manager" in heavy, tightly spaced
// lowercase, with a small ring at the top right (the "lead" being tracked).
// `onOrange` swaps the ring colour so it stays visible on the orange panel.
export default function Logo({ onOrange = false }) {
  return (
    <span className="inline-flex items-start" aria-label="Lead Manager">
      <span aria-hidden="true" className="text-[1.6rem] font-extrabold leading-none tracking-[-0.06em] [word-spacing:0.18em] text-ink">
        lead manager
      </span>
      <svg viewBox="0 0 12 12" className="ml-0.5 mt-0.5 h-2.5 w-2.5" aria-hidden="true">
        <circle cx="6" cy="6" r="4.2" fill="none" stroke={onOrange ? '#FFF4E5' : '#FF5A34'} strokeWidth="2.4" />
      </svg>
    </span>
  )
}
