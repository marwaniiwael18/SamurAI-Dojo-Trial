import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Create axios instance
const api = axios.create({
  baseURL: '/api', // Use relative URL to leverage Vite proxy
  timeout: 10000,
  withCredentials: true
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const { refreshAuthToken, clearAuth } = useAuthStore.getState()

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshed = await refreshAuthToken()
        
        if (refreshed) {
          // Retry the original request with new token
          const { token } = useAuthStore.getState()
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        } else {
          // Refresh failed, clear auth and redirect to login
          clearAuth()
          if (window.location.pathname !== '/signin') {
            window.location.href = '/signin'
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear auth
        clearAuth()
        if (window.location.pathname !== '/signin') {
          window.location.href = '/signin'
        }
      }
    }

    // Handle specific error responses
    if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission to perform this action')
    } else if (error.response?.status === 423) {
      console.error('Account temporarily locked. Please try again later.')
    } else if (error.response?.status === 429) {
      console.error('Too many requests. Please slow down.')
    } else if (error.response?.status >= 500) {
      console.error('Server error. Please try again later.')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

export default api
