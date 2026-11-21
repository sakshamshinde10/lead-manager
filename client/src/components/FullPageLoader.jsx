// A tiny CSS-only spinner shown while a page chunk or the saved session loads.
// No images, no JavaScript animation: it appears instantly.
export default function FullPageLoader() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink/15 border-t-brand-500" />
    </div>
  )
}
