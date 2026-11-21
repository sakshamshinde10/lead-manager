import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Logo from './Logo'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Logo />
      <div className="flex items-center gap-4">
        <p className="hidden text-sm text-muted sm:block">
          Signed in as <strong className="font-semibold text-ink">{user?.name}</strong>
        </p>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut size={15} aria-hidden="true" />
          Log out
        </Button>
      </div>
    </header>
  )
}
