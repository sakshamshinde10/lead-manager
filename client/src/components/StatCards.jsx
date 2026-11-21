import { useRef } from 'react'
import { gsap, useGSAP, MOTION_OK } from '../lib/motion'
import { FALLBACK_STATUSES, STATUS_STYLES } from '../lib/status'

// A number that counts up to its value with GSAP whenever the value changes.
// We remember the last shown value, so going from 5 to 6 counts 5 -> 6
// instead of starting again from 0.
function Counter({ value }) {
  const ref = useRef(null)
  const shown = useRef(0)

  useGSAP(
    () => {
      if (value == null) return
      const element = ref.current
      const mm = gsap.matchMedia()

      mm.add(MOTION_OK, () => {
        const counter = { n: shown.current }
        gsap.to(counter, {
          n: value,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => {
            shown.current = counter.n
            element.textContent = Math.round(counter.n)
          },
        })
      })

      // Reduced motion: show the final number straight away.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        shown.current = value
        element.textContent = value
      })
    },
    { dependencies: [value] },
  )

  return <span ref={ref}>{value ?? '–'}</span>
}

export default function StatCards({ stats }) {
  const root = useRef(null)

  // The cards rise in one after another when the page first appears.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.from('[data-card]', { y: 18, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out', clearProps: 'transform,opacity' })
      })
    },
    { scope: root },
  )

  return (
    <ul ref={root} className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5" aria-label="Lead totals">
      <li
        data-card
        className="col-span-2 rounded-2xl border-2 border-ink bg-brand-500 p-4 shadow-hard md:col-span-1"
      >
        <p className="text-xs font-semibold uppercase tracking-wider">Total leads</p>
        <p className="display mt-2 text-5xl">
          <Counter value={stats?.total} />
        </p>
      </li>

      {FALLBACK_STATUSES.map((status) => (
        <li key={status} data-card className="rounded-2xl border-2 border-ink bg-cream-50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[status].dot}`} aria-hidden="true" />
            {status}
          </p>
          <p className="display mt-2 text-5xl">
            <Counter value={stats?.byStatus?.[status]} />
          </p>
        </li>
      ))}
    </ul>
  )
}
