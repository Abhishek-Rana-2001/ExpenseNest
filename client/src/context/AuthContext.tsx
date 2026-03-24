import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { api, normalizeError, setAccessToken } from '../lib/api'
import type { User } from '../types'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: string | null
  clearError: () => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: (onDone?: () => void) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

type AuthResponse = {
  ok: boolean
  data: {
    user: User
    accessToken: string
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const applyAuth = useCallback((user: User | null, token: string | null) => {
    setUser(user)
    setAccessToken(token)
  }, [])

  const refreshAuth = useCallback(async () => {
    try {
      const res = await api.post<AuthResponse>('/auth/refresh')
      const data = res.data?.data
      if (data?.user && data?.accessToken) {
        applyAuth(data.user, data.accessToken)
      } else {
        applyAuth(null, null)
      }
    } catch {
      applyAuth(null, null)
    } finally {
      setIsLoading(false)
    }
  }, [applyAuth])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  useEffect(() => {
    const onLogout = () => {
      applyAuth(null, null)
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [applyAuth])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null)
        const res = await api.post<AuthResponse>('/auth/login', { email, password })
        const data = res.data?.data
        if (data?.user && data?.accessToken) {
          applyAuth(data.user, data.accessToken)
        }
      } catch (err) {
        setError(normalizeError(err).message)
        throw err
      }
    },
    [applyAuth],
  )

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        setError(null)
        const res = await api.post<AuthResponse>('/auth/register', {
          email,
          password,
          name,
        })
        const data = res.data?.data
        if (data?.user && data?.accessToken) {
          applyAuth(data.user, data.accessToken)
        }
      } catch (err) {
        setError(normalizeError(err).message)
        throw err
      }
    },
    [applyAuth],
  )

  const logout = useCallback(async (onDone?: () => void) => {
    try {
      await api.post('/auth/logout')
      onDone?.()
    } finally {
      applyAuth(null, null)
    }
  }, [applyAuth])

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    clearError,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
