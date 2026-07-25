import { createContext, useContext, useState, useEffect } from 'react'
import { getMe, login as apiLogin, logout as apiLogout } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Runs once on mount to restore session from cookie
  useEffect(() => {
    let cancelled = false
    getMe()
      .then((res) => {
        if (!cancelled) setUser(res.data.data.user)
      })
      .catch(() => {
        // Not logged in — that's fine, just stay null
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, []) // empty deps — runs exactly once

  const login = async (email, password) => {
    const res = await apiLogin({ email, password })
    setUser(res.data.data.user)
    return res.data.data.user
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // ignore network errors on logout
    } finally {
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const res = await getMe()
      setUser(res.data.data.user)
    } catch {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
