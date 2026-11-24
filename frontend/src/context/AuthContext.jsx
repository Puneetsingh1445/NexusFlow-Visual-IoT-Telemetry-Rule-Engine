import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('nexusflow_token'))
  const [loading, setLoading] = useState(true)

  // On mount: if there's a token, verify it's still valid; restore user from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nexusflow_token')
      const storedUser = localStorage.getItem('nexusflow_user')
      if (!storedToken) {
        setLoading(false)
        return
      }
      try {
        // getMe validates the JWT on the server; returns { success, user: { userId, role } }
        await authService.getMe()
        // Token is valid — restore the full user profile from localStorage
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch {
            // Corrupted JSON — clear everything and force re-login
            localStorage.removeItem('nexusflow_token')
            localStorage.removeItem('nexusflow_user')
            setToken(null)
            setUser(null)
          }
        }
      } catch {
        // Token invalid or expired — clear everything
        localStorage.removeItem('nexusflow_token')
        localStorage.removeItem('nexusflow_user')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    // Backend returns { success, token, data: { id, name, email, role } }
    const { token: newToken, data: newUser } = data
    localStorage.setItem('nexusflow_token', newToken)
    localStorage.setItem('nexusflow_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return data
  }

  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password)
    // Backend returns { success, token, data: { id, name, email, role } }
    const { token: newToken, data: newUser } = data
    localStorage.setItem('nexusflow_token', newToken)
    localStorage.setItem('nexusflow_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return data
  }

  const logout = () => {
    localStorage.removeItem('nexusflow_token')
    localStorage.removeItem('nexusflow_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
