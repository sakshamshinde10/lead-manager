import { Toaster } from 'sonner'

// Notification area, styled to match the cream, ink and orange theme.
// App.jsx loads this file lazily, so the toast library is not part of the
// first download on the login page.
export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: '!rounded-2xl !border-2 !border-ink !bg-cream-50 !font-sans !text-ink !shadow-hard',
        },
      }}
    />
  )
}
