import { Loader2 } from 'lucide-react'

// One button used everywhere. The offset shadow and the "press" movement on
// click give it a printed, tactile feel instead of a flat web-default look.
const solid =
  'border-2 border-ink shadow-hard hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-ink)] ' +
  'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'

const variants = {
  primary: `${solid} bg-brand-500 text-ink hover:bg-brand-600`,
  dark: `${solid} bg-ink text-cream-50 hover:bg-[#40291d]`,
  outline: `${solid} bg-cream-50 text-ink hover:bg-white`,
  ghost: 'border-2 border-transparent bg-transparent text-ink hover:bg-cream-200',
}

// `as` lets the same styling be used on a router <Link>, so a link that looks
// like a button is still a real link (never a button nested inside a link).
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  loading = false,
  loadingText,
  className = '',
  children,
  disabled,
  ...props
}) {
  const isButton = Component === 'button'

  return (
    <Component
      {...(isButton ? { disabled: disabled || loading } : {})}
      className={
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ' +
        'transition-all duration-150 disabled:pointer-events-none disabled:opacity-60 ' +
        `${variants[variant]} ${className}`
      }
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {loading && loadingText ? loadingText : children}
    </Component>
  )
}
