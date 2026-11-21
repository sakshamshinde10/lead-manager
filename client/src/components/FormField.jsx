import { useId } from 'react'
import { AlertCircle } from 'lucide-react'

// A labelled input with an error message underneath. Works with React Hook
// Form: spread {...register('email')} onto it. (React 19 passes `ref` as a
// normal prop, so no forwardRef wrapper is needed.)
//
// Accessibility: the label is tied to the input, the error is announced to
// screen readers (role="alert") and linked with aria-describedby.
export default function FormField({ label, error, hint, right, ...inputProps }) {
  const id = useId()
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div data-field>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={messageId}
          {...inputProps}
          className={
            'w-full border-0 border-b-2 bg-transparent py-2.5 pr-16 text-base text-ink transition-shadow ' +
            'placeholder:text-muted/60 focus:border-ink focus:shadow-[0_3px_0_0_var(--color-brand-500)] focus:outline-none ' +
            (error ? 'border-brand-700' : 'border-ink/60')
          }
        />
        {right && <div className="absolute right-0 top-1/2 -translate-y-1/2">{right}</div>}
      </div>

      {error ? (
        <p id={messageId} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-brand-700">
          <AlertCircle size={15} aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="mt-1.5 text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
