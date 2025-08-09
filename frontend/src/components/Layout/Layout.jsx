import React from 'react'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gradient">SamurAI Dojo</h1>
            </div>
            <nav className="flex space-x-4">
              <a href="/dashboard" className="text-gray-700 hover:text-primary-600">Dashboard</a>
              <a href="/settings" className="text-gray-700 hover:text-primary-600">Settings</a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 SamurAI Dojo. Built with ❤️ by Nihed Ben Abdennour & Team.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
