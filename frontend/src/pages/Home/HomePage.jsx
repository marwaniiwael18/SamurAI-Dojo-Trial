import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import authService from '../../services/authService'

const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [currentView, setCurrentView] = useState('signup') // 'signup', 'signin', 'forgot'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form states
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  })
  
  const [forgotEmail, setForgotEmail] = useState('')

  // Handle signup form changes
  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error when user types
  }

  // Handle signin form changes
  const handleSigninChange = (e) => {
    setSigninData({
      ...signinData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error when user types
  }

  // Handle signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate password match
      if (signupData.password !== signupData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Validate password strength
      if (signupData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      // Basic email format validation
      if (!signupData.email || !signupData.email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      // Basic name validation
      if (!signupData.firstName.trim() || !signupData.lastName.trim()) {
        throw new Error('First name and last name are required')
      }

      // Pre-validate email with server to catch existing/invalid emails early
      try {
        await authService.validateCorporateEmailServer(signupData.email)
      } catch (preErr) {
        const preMsg = preErr?.response?.data?.message || 'Email validation failed'
        setError(preMsg)
        setIsLoading(false)
        return
      }

      console.log('Sending registration data:', {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: '[HIDDEN]'
      })

      // Use the authStore instead of direct service call
      const result = await useAuthStore.getState().register({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password
      })

      if (result.success) {
        setSuccessMessage('Account created successfully! Please check your email for verification.')
        
        // Clear form
        setSignupData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        
        // Switch to signin view after 3 seconds
        setTimeout(() => {
          setCurrentView('signin')
          setSuccessMessage('')
        }, 3000)
      } else {
        // Bubble a descriptive error so the catch can format
        const err = new Error(result.error || 'Registration failed')
        err.response = { data: { message: result.error } }
        throw err
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle different types of errors
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map(err => err.msg || err.message).join(', ')
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle signin submission
  const handleSigninSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Use the authStore instead of direct service call
      const result = await useAuthStore.getState().login(signinData)
      
      if (result.success) {
        setSuccessMessage('Login successful! Redirecting...')
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      let errorMessage = 'Login failed. Please check your credentials.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle forgot password submission
  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await useAuthStore.getState().forgotPassword(forgotEmail)
      
      if (result.success) {
        setSuccessMessage('Reset password link sent to your email!')
      } else {
        throw new Error(result.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError(error.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Brand & Value Props */}
      <div className="w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-16">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">S</span>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold">SamurAI</div>
              <div className="text-xl font-bold text-teal-400">DOJO</div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              {currentView === 'signup' ? (
                <>
                  Join the <br />
                  <span className="text-teal-400">security</span><br />
                  revolution
                </>
              ) : currentView === 'signin' ? (
                <>
                  Master your <br />
                  <span className="text-teal-400">security</span><br />
                  intelligence
                </>
              ) : (
                <>
                  Reset your <br />
                  <span className="text-teal-400">password</span><br />
                  securely
                </>
              )}
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              {currentView === 'signup' 
                ? "Connect with thousands of security professionals and discover the perfect cybersecurity solutions for your organization with AI-powered intelligence."
                : currentView === 'signin'
                ? "Join thousands of security professionals discovering, evaluating, and mastering the latest cybersecurity solutions with AI-powered insights."
                : "Enter your corporate email and we'll send you a secure link to reset your password."
              }
            </p>

            {/* Feature Points */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg text-gray-200">AI-powered product recommendations</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg text-gray-200">Interactive security mindmaps</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-lg text-gray-200">Team collaboration tools</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400">1000+</div>
              <div className="text-gray-300">Security Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400">50k+</div>
              <div className="text-gray-300">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-1/2 bg-white flex flex-col">
        {/* Header */}
        <div className="p-12 pb-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentView === 'signup' ? 'Create your account' : 
               currentView === 'signin' ? 'Welcome back' : 
               'Reset password'}
            </h2>
            <p className="text-gray-600">
              {currentView === 'signup' ? 'Join SamurAI Dojo with your corporate email' :
               currentView === 'signin' ? 'Sign in to your SamurAI Dojo account' :
               'Enter your email to reset your password'}
            </p>
          </div>

          {/* Corporate Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-600 rounded mt-0.5"></div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Corporate Access Only</h3>
                <p className="text-sm text-blue-700">
                  SamurAI Dojo is for enterprise, organizational, and institutional users. Please use your corporate or university email address to access the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium">LinkedIn</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#333" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="flex-1 px-12 pb-12">
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {currentView === 'signup' ? (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text"
                    name="firstName"
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text"
                    name="lastName"
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Email</label>
                <input 
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="john.doe@company.com"
                />
                <p className="text-xs text-gray-500 mt-1">Corporate or institutional email required - personal emails not allowed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password"
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                  minLength="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Create a strong password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input 
                  type="password"
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" required className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                <label className="text-sm text-gray-600">
                  I agree to the <Link to="/terms" className="text-teal-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('signin')}
                  className="text-teal-600 hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </form>
          ) : currentView === 'signin' ? (
            <form onSubmit={handleSigninSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Email</label>
                <input 
                  type="email"
                  name="email"
                  value={signinData.email}
                  onChange={handleSigninChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="john.doe@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password"
                  name="password"
                  value={signinData.password}
                  onChange={handleSigninChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot')}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <p className="text-center text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('signup')}
                  className="text-teal-600 hover:underline font-medium"
                >
                  Create one now
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Email</label>
                <input 
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="john.doe@company.com"
                />
                <p className="text-xs text-gray-500 mt-1">We'll send a reset link to your email</p>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('signin')}
                className="w-full text-teal-600 hover:text-teal-700 text-sm"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        {/* Enterprise Security Notice */}
        <div className="mx-12 mt-8 mb-12 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-teal-600 rounded mt-0.5"></div>
            <div>
              <h3 className="font-semibold text-teal-800 mb-1">Enterprise Security</h3>
              <p className="text-sm text-teal-700">
                Your account will be protected by multi-factor authentication and enterprise-grade security protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
