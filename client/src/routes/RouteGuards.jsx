import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import FullPageLoader from '../components/FullPageLoader'

// Pages that need a logged-in user. Anyone else is sent to /login, and we
// remember where they were going so we can bring them back after login.
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Login and signup pages: a user who is already logged in has no reason to
// see them, so they go straight to the app.
export function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'authenticated') return <Navigate to="/leads" replace />
  return <Outlet />
}
