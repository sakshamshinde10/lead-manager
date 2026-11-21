import { Plus, Search, X } from 'lucide-react'
import Button from './Button'

// The row above the table: search by name, filter by status, and Add lead.
export default function LeadsToolbar({ search, onSearch, statusFilter, onStatusFilter, statuses, onAdd, addDisabled }) {
  const pill = (active) =>
    'cursor-pointer rounded-full border-2 border-ink px-4 py-1.5 text-sm font-semibold transition-colors ' +
    (active ? 'bg-ink text-cream-50' : 'bg-cream-50 text-ink hover:bg-cream-200')

  return (
    <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <label className="relative block md:w-72">
          <span className="sr-only">Search leads by name</span>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by name"
            className="w-full appearance-none rounded-full border-2 border-ink bg-cream-50 py-2.5 pl-11 pr-10 text-sm placeholder:text-muted/70 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-muted hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </label>

        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={statusFilter === ''} onClick={() => onStatusFilter('')} className={pill(statusFilter === '')}>
            All
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={statusFilter === status}
              onClick={() => onStatusFilter(statusFilter === status ? '' : status)}
              className={pill(statusFilter === status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onAdd} disabled={addDisabled} className="self-start lg:self-auto">
        <Plus size={16} aria-hidden="true" />
        Add lead
      </Button>
    </div>
  )
}
