import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Import components
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import PublicRoute from './components/Auth/PublicRoute'

// Import pages
import HomePage from './pages/Home/HomePage'
import SignUpPage from './pages/Auth/SignUpPage'
import SignInPage from './pages/Auth/SignInPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'
import VerifyEmailPage from './pages/Auth/VerifyEmailPage'
import ProfilingWizardPage from './pages/Profiling/ProfilingWizardPage'
import DashboardPage from './pages/Dashboard/Dashboard'
import WorkspacePage from './pages/Workspace/WorkspacePage'
import SettingsPage from './pages/Settings/SettingsPage'
import NotFoundPage from './pages/Error/NotFoundPage'

function App() {
  const { isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SamurAI Dojo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
        
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          }
        />
        
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignInPage />
            </PublicRoute>
          }
        />
        
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        
        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        
        <Route
          path="/verify-email/:token"
          element={
            <PublicRoute>
              <VerifyEmailPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/profiling"
          element={
            <ProtectedRoute>
              <ProfilingWizardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/workspace/:workspaceId"
          element={
            <ProtectedRoute>
              <Layout>
                <WorkspacePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <Layout>
              <NotFoundPage />
            </Layout>
          }
        />
      </Routes>
    </div>
  )
}

export default App
