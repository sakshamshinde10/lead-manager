// Grey placeholder rows shown while the first load is in flight. They have the
// same shape as the real rows, so the page does not jump when data arrives.
export default function LeadsSkeleton() {
  return (
    <div role="status" aria-label="Loading your leads" className="mt-6 overflow-hidden rounded-3xl border-2 border-ink bg-cream-50">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-5 border-b border-ink/15 px-5 py-5 last:border-b-0">
          <div className="h-4 w-1/4 animate-pulse rounded-full bg-cream-200" />
          <div className="hidden h-4 w-1/3 animate-pulse rounded-full bg-cream-200 md:block" />
          <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-cream-200" />
        </div>
      ))}
    </div>
  )
}
