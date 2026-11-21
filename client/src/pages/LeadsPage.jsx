import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'

// Temporary placeholder so the login flow can be tested end to end.
// The real leads dashboard replaces this in the next part.
export default function LeadsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex items-center justify-between">
        <Logo />
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </header>
      <h1 className="display mt-16 text-5xl">Hello, {user?.name}.</h1>
      <p className="mt-4 text-muted">Your leads dashboard is coming next.</p>
    </main>
  )
}
