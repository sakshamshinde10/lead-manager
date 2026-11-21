import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, AUTH_EXPIRED_EVENT, tokenStore } from '../lib/api'
import { AuthContext } from './authContext'

// status is one of:
//   "loading"        we have a saved token and are checking it with the server
//   "authenticated"  logged in
//   "anonymous"      logged out
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'loading' : 'anonymous'))

  // On first load, if a token is saved, ask the server who it belongs to.
  // This restores the session after a page refresh.
  useEffect(() => {
    if (!tokenStore.get()) return
    let cancelled = false
    api
      .get('/auth/me')
      .then(({ user }) => {
        if (cancelled) return
        setUser(user)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        tokenStore.clear()
        setStatus('anonymous')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const reset = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    setStatus('anonymous')
  }, [])

  // The API helper announces when the server rejects our token (expired).
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, reset)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, reset)
  }, [reset])

  const authenticate = useCallback(async (path, credentials) => {
    const { token, user } = await api.post(path, credentials)
    tokenStore.set(token)
    setUser(user)
    setStatus('authenticated')
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      login: (credentials) => authenticate('/auth/login', credentials),
      signup: (credentials) => authenticate('/auth/signup', credentials),
      logout: reset,
    }),
    [user, status, authenticate, reset],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
