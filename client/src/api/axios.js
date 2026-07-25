import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

const TOKEN_KEY = 'lf_access_token'

export const saveToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  withCredentials: true, // still needed for cookie-based refresh fallback
  headers: { 'Content-Type': 'application/json' },
})

// Attach stored token to every request as Bearer header
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve()
  })
  failedQueue = []
}

const NO_RETRY_URLS = ['/auth/refresh', '/auth/login', '/auth/me']

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isNoRetry = NO_RETRY_URLS.some((url) => original.url?.includes(url))

    if (error.response?.status === 401 && !original._retry && !isNoRetry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(original))
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await api.post('/auth/refresh')
        // Save the new access token if returned in body
        const newToken = res.data?.data?.accessToken
        if (newToken) saveToken(newToken)
        processQueue(null)
        return api(original)
      } catch (err) {
        processQueue(err)
        saveToken(null)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
