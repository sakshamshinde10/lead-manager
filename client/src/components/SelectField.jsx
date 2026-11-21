import { useId } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

// The dropdown version of FormField, with the same underline look. It uses a
// real <select>, so it works with the keyboard, on phones, and with screen
// readers without any extra code.
export default function SelectField({ label, error, children, ...selectProps }) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined

  return (
    <div data-field>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          {...selectProps}
          className={
            'w-full cursor-pointer appearance-none border-0 border-b-2 bg-transparent py-2.5 pr-8 text-base text-ink transition-shadow ' +
            'focus:border-ink focus:shadow-[0_3px_0_0_var(--color-brand-500)] focus:outline-none ' +
            (error ? 'border-brand-700' : 'border-ink/60')
          }
        >
          {children}
        </select>
        <ChevronDown size={18} aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-muted" />
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-brand-700">
          <AlertCircle size={15} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
