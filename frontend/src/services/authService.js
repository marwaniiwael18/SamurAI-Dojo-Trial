import api from './api'

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', {}, {
      headers: {
        'x-refresh-token': refreshToken
      }
    })
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`)
    return response.data
  },

  // Resend verification email
  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification')
    return response.data
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (token, passwords) => {
    const response = await api.patch(`/auth/reset-password/${token}`, passwords)
    return response.data
  },

  // Update password
  updatePassword: async (passwords) => {
    const response = await api.patch('/auth/update-password', passwords)
    return response.data
  },

  // OAuth login
  oauthLogin: async (provider, code, state) => {
    const response = await api.post(`/auth/oauth/${provider}`, { code, state })
    return response.data
  },

  // Check corporate email with server validation
  validateCorporateEmailServer: async (email) => {
    const response = await api.post('/auth/validate-email', { email })
    return response.data
  },

  // Validate corporate email locally (quick check)
  validateCorporateEmail: (email) => {
    // List of personal and academic email domains to block
    const blockedDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
      'icloud.com', 'me.com', 'mac.com', 'live.com', 'msn.com',
      'edu', '.edu', 'ac.uk', 'uni-', 'university', 'college',
      'student.', 'alumni.', 'school.', 'academic.'
    ]
    
    if (!email || !email.includes('@')) return false
    
    const domain = email.split('@')[1].toLowerCase()
    
    // Check if domain is in blocked list
    return !blockedDomains.some(blocked => 
      domain === blocked || 
      domain.endsWith('.' + blocked) || 
      domain.includes(blocked)
    )
  }
}

export default authService
