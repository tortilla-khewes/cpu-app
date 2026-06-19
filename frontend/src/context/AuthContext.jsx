import { createContext, useContext, useState, useCallback } from 'react'
import { login as apiLogin } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => sessionStorage.getItem('role') || null)

  const login = useCallback(async (loginRole, pin) => {
    const data = await apiLogin(loginRole, pin)
    sessionStorage.setItem('token', data.token)
    sessionStorage.setItem('role', data.role)
    setRole(data.role)
    return data.role
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('role')
    setRole(null)
  }, [])

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
