import axios, { AxiosError } from 'axios'

const baseURL =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

    const req = originalRequest as typeof originalRequest & { _retry?: boolean }

    if (error.response?.status !== 401 || req._retry) {
      return Promise.reject(error)
    }

    if (String(req.url ?? '').includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    req._retry = true

    refreshPromise ??= (async () => {
      try {
        const res = await api.post<{
          ok: boolean
          data: { accessToken: string }
        }>('/auth/refresh')
        const token = res.data?.data?.accessToken ?? null
        if (token) {
          setAccessToken(token)
          return token
        }
      } catch {
        setAccessToken(null)
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
      return null
    })()

    const newToken = await refreshPromise
    refreshPromise = null

    if (newToken) {
      req.headers = req.headers || {}
      req.headers.Authorization = `Bearer ${newToken}`
      return api(req)
    }

    return Promise.reject(error)
  },
)

export type ApiError = {
  message: string
  code: string
  status?: number
  issues?: unknown
  details?: unknown
}

export function normalizeError(error: unknown): ApiError {
  const axiosError = error as AxiosError<{ error?: ApiError }>
  const status = axiosError.response?.status
  const data = axiosError.response?.data

  const fallback: ApiError = {
    message: 'Something went wrong',
    code: 'UNKNOWN_ERROR',
    status,
  }

  if (!data || typeof data !== 'object' || !('error' in data)) {
    return fallback
  }

  const e = data.error as ApiError
  return {
    message: e?.message ?? fallback.message,
    code: e?.code ?? fallback.code,
    status,
    issues: e?.issues,
    details: e?.details,
  }
}
