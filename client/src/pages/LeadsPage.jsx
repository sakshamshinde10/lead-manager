import { useState } from 'react'
import { toast } from 'sonner'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Header from '../components/Header'
import LeadDrawer from '../components/LeadDrawer'
import LeadsSkeleton from '../components/LeadsSkeleton'
import LeadsTable from '../components/LeadsTable'
import LeadsToolbar from '../components/LeadsToolbar'
import StatCards from '../components/StatCards'
import { useLeads } from '../hooks/useLeads'
import { FALLBACK_STATUSES } from '../lib/status'

export default function LeadsPage() {
  const {
    exportLeads,
    leads,
    stats,
    options,
    phase,
    error,
    fetching,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    hasFilters,
    clearFilters,
    retry,
    createLead,
    updateLead,
    deleteLead,
  } = useLeads()

  // What is open on top of the page right now:
  //   drawer: null | { mode: 'create' } | { mode: 'edit', lead }
  //   leadToDelete: null | lead
  const [drawer, setDrawer] = useState(null)
  const [leadToDelete, setLeadToDelete] = useState(null)

  const [exporting, setExporting] = useState(false)

  const openAdd = () => setDrawer({ mode: 'create' })

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportLeads()
      toast.success('Excel file downloaded')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setExporting(false)
    }
  }

  const handleSave = async (values) => {
    if (drawer.mode === 'edit') {
      await updateLead(drawer.lead.id, values)
      toast.success('Lead updated')
    } else {
      await createLead(values)
      toast.success('Lead added')
    }
  }

  const handleDelete = async () => {
    await deleteLead(leadToDelete.id)
    toast.success(`${leadToDelete.name} was deleted`)
  }

  return (
    <div className="min-h-dvh pb-20">
      <Header />

      <main className="mx-auto max-w-6xl px-5">
        <h1 className="display mt-6 text-4xl sm:text-5xl">Your leads</h1>
        <p className="mt-2 text-muted">Every lead, where it came from, and how far along it is.</p>

        <StatCards stats={stats} />

        <LeadsToolbar
          search={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          statuses={options?.statuses ?? FALLBACK_STATUSES}
          onAdd={openAdd}
          addDisabled={!options}
          onExport={handleExport}
          exporting={exporting}
          canExport={phase === 'ready' && leads.length > 0}
        />

        {/* Tells screen-reader users how many results the search or filter produced. */}
        <p className="sr-only" role="status">
          {phase === 'ready' ? `${leads.length} ${leads.length === 1 ? 'lead' : 'leads'} shown` : ''}
        </p>

        {phase === 'loading' && <LeadsSkeleton />}

        {phase === 'error' && (
          <div role="alert" className="mt-6 rounded-3xl border-2 border-ink bg-brand-100 p-6">
            <h2 className="display text-2xl">We couldn’t load your leads.</h2>
            <p className="mt-2 text-sm">{error}</p>
            <Button variant="dark" size="sm" onClick={retry} className="mt-4">
              Try again
            </Button>
          </div>
        )}

        {phase === 'ready' &&
          (leads.length > 0 ? (
            <LeadsTable
              leads={leads}
              fetching={fetching}
              onEdit={(lead) => setDrawer({ mode: 'edit', lead })}
              onDelete={setLeadToDelete}
            />
          ) : (
            <EmptyState filtered={hasFilters} onAdd={openAdd} onClear={clearFilters} addDisabled={!options} />
          ))}
      </main>

      {drawer && options && (
        <LeadDrawer
          key={drawer.lead?.id ?? 'new'}
          mode={drawer.mode}
          lead={drawer.lead}
          options={options}
          onSubmit={handleSave}
          onClose={() => setDrawer(null)}
        />
      )}

      {leadToDelete && (
        <ConfirmDialog
          title={`Delete ${leadToDelete.name}?`}
          message="This lead will be removed for good. This can’t be undone."
          confirmLabel="Delete lead"
          onConfirm={handleDelete}
          onClose={() => setLeadToDelete(null)}
        />
      )}
    </div>
  )
}
