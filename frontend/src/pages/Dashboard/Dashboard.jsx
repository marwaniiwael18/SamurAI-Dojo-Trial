import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { Navigate } from 'react-router-dom'

const Dashboard = () => {
  const { isAuthenticated, user, logout } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/" />
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div className="text-gray-900">
                <div className="text-lg font-bold">SamurAI</div>
                <div className="text-sm font-bold text-teal-600">DOJO</div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {user?.firstName} {user?.lastName}
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SamurAI Dojo Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your secure cybersecurity intelligence platform
          </p>

          {/* Success Message */}
          <div className="max-w-md mx-auto mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <h3 className="font-semibold mb-2">🎉 Authentication Successful!</h3>
            <p className="text-sm">
              You have successfully logged in with your corporate email: {user?.email}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Recommendations</h3>
              <p className="text-gray-600">
                Get personalized cybersecurity product recommendations based on your organization's needs.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Mindmaps</h3>
              <p className="text-gray-600">
                Explore interactive security mindmaps to understand threat landscapes and solutions.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Collaborate with your team to evaluate and implement security solutions together.
              </p>
            </div>
          </div>

          {/* User Info Card */}
          <div className="max-w-md mx-auto mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Account Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Name:</span> {user?.firstName} {user?.lastName}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Active</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
