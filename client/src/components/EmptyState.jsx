import { useRef } from 'react'
import { Plus } from 'lucide-react'
import Button from './Button'
import { gsap, useGSAP, MOTION_OK } from '../lib/motion'

// Shown when the list is empty. There are two different situations:
//   filtered=false  the user has no leads at all yet  -> invite them to add one
//   filtered=true   a search or filter found nothing  -> offer to clear it
export default function EmptyState({ filtered, onAdd, onClear, addDisabled }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.from('[data-rise]', { y: 16, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity' })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="mt-6 rounded-3xl border-2 border-dashed border-ink/60 bg-cream-50 px-6 py-14 text-center">
      {/* A little stack of cards, hand-drawn from simple shapes */}
      <svg data-rise viewBox="0 0 160 120" className="mx-auto h-28 w-40" aria-hidden="true">
        <rect x="22" y="40" width="108" height="64" rx="12" transform="rotate(-8 76 72)" fill="#f6e6d0" stroke="#2a1b14" strokeWidth="3" />
        <rect x="32" y="30" width="108" height="64" rx="12" transform="rotate(6 86 62)" fill="#ffd9c7" stroke="#2a1b14" strokeWidth="3" />
        <rect x="26" y="22" width="108" height="64" rx="12" fill="#ff5a34" stroke="#2a1b14" strokeWidth="3" />
        <circle cx="52" cy="46" r="8" fill="#2a1b14" />
        <rect x="68" y="40" width="48" height="6" rx="3" fill="#2a1b14" />
        <rect x="68" y="54" width="32" height="6" rx="3" fill="#2a1b14" opacity="0.5" />
      </svg>

      <h2 data-rise className="display mt-6 text-3xl">
        {filtered ? 'Nothing matches that.' : 'No leads yet.'}
      </h2>
      <p data-rise className="mx-auto mt-3 max-w-sm text-muted">
        {filtered ? 'Try a different name, or clear the filters to see everything.' : 'Add the first person you want to follow up with.'}
      </p>

      <div data-rise className="mt-7">
        {filtered ? (
          <Button variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        ) : (
          <Button onClick={onAdd} disabled={addDisabled}>
            <Plus size={16} aria-hidden="true" />
            Add your first lead
          </Button>
        )}
      </div>
    </div>
  )
}
