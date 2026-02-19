import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''
if (API_URL) axios.defaults.baseURL = API_URL

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('/api/auth/me').then(res => setUser(res.data.user)).catch(() => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/auth/login', { email, password })
    const t = res.data.token
    localStorage.setItem('token', t)
    setToken(t)
    setUser(res.data.user)
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await axios.post('/api/auth/register', { name, email, password })
    const t = res.data.token
    localStorage.setItem('token', t)
    setToken(t)
    setUser(res.data.user)
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
