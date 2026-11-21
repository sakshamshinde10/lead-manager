import { createContext } from 'react'

// Just the context object. The provider (AuthProvider.jsx) fills it with data
// and components read it through the useAuth hook (hooks/useAuth.js).
export const AuthContext = createContext(null)
