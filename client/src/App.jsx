import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import FullPageLoader from './components/FullPageLoader'
import { ProtectedRoute, PublicOnlyRoute } from './routes/RouteGuards'

// Each page is its own chunk, downloaded only when someone visits it. A
// visitor on the login page never downloads the leads dashboard code, so the
// first load is smaller and faster.
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const LeadsPage = lazy(() => import('./pages/LeadsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AppToaster = lazy(() => import('./components/AppToaster'))

export default function App() {
  return (
    <>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/leads" element={<LeadsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Suspense fallback={null}>
        <AppToaster />
      </Suspense>
    </>
  )
}
