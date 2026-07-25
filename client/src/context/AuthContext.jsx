import { createContext, useContext, useState, useEffect } from 'react'
import { getMe, login as apiLogin, logout as apiLogout } from '../api/auth'
import { saveToken, getToken } from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: if we have a stored token, try to restore the session
  useEffect(() => {
    let cancelled = false

    // No token stored — definitely not logged in, skip the network call
    if (!getToken()) {
      setLoading(false)
      return
    }

    getMe()
      .then((res) => {
        if (!cancelled) setUser(res.data.data.user)
      })
      .catch(() => {
        // Token expired or invalid — clear it
        if (!cancelled) {
          saveToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const login = async (email, password) => {
    const res = await apiLogin({ email, password })
    const { user: loggedInUser, accessToken } = res.data.data
    // Persist the token so subsequent requests and page reloads work
    saveToken(accessToken)
    setUser(loggedInUser)
    return loggedInUser
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // ignore
    } finally {
      saveToken(null)
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const res = await getMe()
      setUser(res.data.data.user)
    } catch {
      saveToken(null)
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
