import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="display text-[7rem] leading-none text-brand-500 sm:text-[10rem]" aria-hidden="true">
          404
        </p>
        <h1 className="display text-3xl">That page doesn’t exist.</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">The link may be old, or the address was typed a little off.</p>
        <Button as={Link} to="/" className="mt-8">
          Back to your leads
        </Button>
      </div>
    </main>
  )
}
