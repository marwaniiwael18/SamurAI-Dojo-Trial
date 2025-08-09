import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <Link to="/" className="mt-6 btn btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
