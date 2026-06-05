import axios, { AxiosError } from 'axios'

const baseURL =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'

type RefreshData = { user: unknown; accessToken: string }

let accessToken: string | null = null
let refreshPromise: Promise<RefreshData | null> | null = null

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

/**
 * Refresh the session. Deduplicated: concurrent callers (the auth bootstrap
 * and the 401 interceptor) share one in-flight request, so /auth/refresh is
 * only hit once even when triggered from multiple places at the same time.
 */
export function refreshSession(): Promise<RefreshData | null> {
  refreshPromise ??= (async () => {
    try {
      const res = await api.post<{ ok: boolean; data: RefreshData }>(
        '/auth/refresh',
      )
      const data = res.data?.data ?? null
      setAccessToken(data?.accessToken ?? null)
      return data
    } catch {
      setAccessToken(null)
      return null
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

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

    const data = await refreshSession()

    if (data?.accessToken) {
      req.headers = req.headers || {}
      req.headers.Authorization = `Bearer ${data.accessToken}`
      return api(req)
    }

    window.dispatchEvent(new CustomEvent('auth:logout'))
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

function isApiError(value: unknown): value is ApiError {
  return (
    !!value &&
    typeof value === 'object' &&
    'message' in value &&
    'code' in value
  )
}

export function normalizeError(error: unknown): ApiError {
  // Idempotent: if it's already an ApiError, return as-is. Safe to call from
  // anywhere, but in practice the response interceptor below does it once at
  // the source so consumers rarely need to.
  if (isApiError(error)) return error

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

// Normalize errors at the source. Every API failure — including 401-triggered
// refresh retries that ultimately fail — is converted to an ApiError before
// surfacing to callers. Combined with the react-query type augmentation below,
// `useQuery().error` is `ApiError | null` everywhere.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
)

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}
