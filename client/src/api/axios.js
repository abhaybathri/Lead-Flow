import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/v1`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
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

// Routes that should NEVER trigger a refresh attempt
const NO_RETRY_URLS = ['/auth/refresh', '/auth/login', '/auth/me']

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Skip retry logic for auth endpoints or already-retried requests
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
        await api.post('/auth/refresh')
        processQueue(null)
        return api(original)
      } catch (err) {
        processQueue(err)
        // Only redirect if not already on login page
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
