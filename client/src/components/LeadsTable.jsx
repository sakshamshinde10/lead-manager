import { useRef } from 'react'
import { Mail, Pencil, Phone, Trash2 } from 'lucide-react'
import Button from './Button'
import StatusBadge from './StatusBadge'
import { formatDate } from '../lib/format'
import { gsap, useGSAP, MOTION_OK } from '../lib/motion'

// The leads list. On wide screens it is a real <table> (good for screen
// readers and for scanning); on phones each lead becomes a card instead.
export default function LeadsTable({ leads, fetching, onEdit, onDelete }) {
  const root = useRef(null)

  // Rows slide up and fade in when the SET of leads changes (first load,
  // search, filter, add, delete) but NOT when one lead is merely edited.
  const rowsKey = leads.map((lead) => lead.id).join(',')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // Only the rows that are actually visible (the table or the cards, never
        // both), and at most 20, so long lists never feel slow.
        const rows = gsap.utils
          .toArray('[data-row]')
          .filter((element) => element.offsetParent !== null)
          .slice(0, 20)

        gsap.from(rows, {
          y: 14,
          opacity: 0,
          duration: 0.4,
          ease: 'power3.out',
          stagger: { amount: 0.35 }, // the whole cascade takes 0.35s, however many rows
          clearProps: 'transform,opacity',
        })
      })
    },
    { scope: root, dependencies: [rowsKey] },
  )

  return (
    <div ref={root} className={`mt-6 transition-opacity duration-200 ${fetching ? 'opacity-70' : ''}`}>
      {/* Wide screens: table */}
      <div className="hidden overflow-hidden rounded-3xl border-2 border-ink bg-cream-50 md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Your leads</caption>
          <thead className="border-b-2 border-ink bg-cream-200 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-5 py-3.5 font-semibold">Lead</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Contact</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Source</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3.5 font-semibold">Added</th>
              <th scope="col" className="px-5 py-3.5"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/15">
            {leads.map((lead) => (
              <tr key={lead.id} data-row className="transition-colors hover:bg-cream-100">
                <td className="px-5 py-4">
                  <p className="font-semibold">{lead.name}</p>
                  {lead.company && <p className="text-muted">{lead.company}</p>}
                </td>
                <td className="px-5 py-4">
                  <a href={`mailto:${lead.email}`} className="break-all underline-offset-4 hover:underline">
                    {lead.email}
                  </a>
                  {lead.phone && <p className="text-muted">{lead.phone}</p>}
                </td>
                <td className="px-5 py-4">{lead.source}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-muted">{formatDate(lead.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => onEdit(lead)} aria-label={`Edit ${lead.name}`}>
                      <Pencil size={16} aria-hidden="true" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDelete(lead)} aria-label={`Delete ${lead.name}`}>
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: cards */}
      <ul className="space-y-3 md:hidden">
        {leads.map((lead) => (
          <li key={lead.id} data-row className="rounded-2xl border-2 border-ink bg-cream-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{lead.name}</p>
                {lead.company && <p className="text-sm text-muted">{lead.company}</p>}
              </div>
              <StatusBadge status={lead.status} />
            </div>

            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={15} aria-hidden="true" className="shrink-0 text-muted" />
                <dt className="sr-only">Email</dt>
                <dd className="min-w-0 break-all">
                  <a href={`mailto:${lead.email}`} className="underline-offset-4 hover:underline">{lead.email}</a>
                </dd>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={15} aria-hidden="true" className="shrink-0 text-muted" />
                  <dt className="sr-only">Phone</dt>
                  <dd>{lead.phone}</dd>
                </div>
              )}
            </dl>

            <p className="mt-3 text-xs text-muted">
              {lead.source} · added {formatDate(lead.createdAt)}
            </p>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(lead)} aria-label={`Edit ${lead.name}`}>
                <Pencil size={14} aria-hidden="true" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(lead)} aria-label={`Delete ${lead.name}`}>
                <Trash2 size={14} aria-hidden="true" />
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
