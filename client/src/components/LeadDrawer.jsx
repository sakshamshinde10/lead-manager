import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import Button from './Button'
import Dialog from './Dialog'
import FormField from './FormField'
import SelectField from './SelectField'
import { showApiError } from '../lib/formErrors'
import { leadSchema } from '../lib/schemas'

const EMPTY_LEAD = { name: '', email: '', phone: '', company: '', source: '', status: 'New' }

// The slide-in panel used for BOTH adding and editing a lead. One form means
// one set of rules and one layout, so the two can never drift apart.
export default function LeadDrawer({ mode, lead, options, onSubmit, onClose }) {
  const isEdit = mode === 'edit'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: isEdit
      ? {
          name: lead.name,
          email: lead.email,
          phone: lead.phone ?? '',
          company: lead.company ?? '',
          source: lead.source,
          status: lead.status,
        }
      : EMPTY_LEAD,
  })

  return (
    <Dialog variant="drawer" labelledBy="lead-drawer-title" onClose={onClose}>
      {({ close }) => {
        const submit = handleSubmit(async (values) => {
          try {
            await onSubmit(values)
            close()
          } catch (error) {
            showApiError(error, setError)
          }
        })

        return (
          <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b-2 border-ink px-6 py-5">
              <h2 id="lead-drawer-title" className="display text-2xl">
                {isEdit ? 'Edit lead' : 'Add a lead'}
              </h2>
              <Button variant="ghost" size="icon" onClick={close} aria-label="Close panel">
                <X size={20} aria-hidden="true" />
              </Button>
            </header>

            <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                {errors.root && (
                  <p role="alert" className="rounded-xl border-2 border-ink bg-brand-100 px-4 py-3 text-sm font-medium">
                    {errors.root.message}
                  </p>
                )}

                <FormField label="Name" autoComplete="off" data-autofocus placeholder="Ravi Kumar" error={errors.name?.message} {...register('name')} />
                <FormField label="Email" type="email" autoComplete="off" placeholder="ravi@company.com" error={errors.email?.message} {...register('email')} />
                <FormField label="Phone (optional)" type="tel" autoComplete="off" placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone')} />
                <FormField label="Company (optional)" autoComplete="off" placeholder="Acme Traders" error={errors.company?.message} {...register('company')} />

                <SelectField label="Source" error={errors.source?.message} {...register('source')}>
                  <option value="">Choose a source</option>
                  {options.sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </SelectField>

                <SelectField label="Status" error={errors.status?.message} {...register('status')}>
                  {options.statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </SelectField>
              </div>

              <footer className="flex gap-3 border-t-2 border-ink bg-cream-100 px-6 py-4">
                <Button type="submit" loading={isSubmitting} loadingText="Saving…" className="flex-1">
                  {isEdit ? 'Save changes' : 'Add lead'}
                </Button>
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
              </footer>
            </form>
          </div>
        )
      }}
    </Dialog>
  )
}
