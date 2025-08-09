import React, { useState } from 'react'
import api from '../../services/api'

const ApiTestPage = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testHealth = async () => {
    setLoading(true)
    try {
      // Test direct API call (this should work now with relative URLs)
      const response = await api.get('/health')
      setResult(JSON.stringify(response.data, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}\nURL: ${error.config?.url}`)
    }
    setLoading(false)
  }

  const testRegistration = async () => {
    setLoading(true)
    try {
      const response = await api.post('/auth/register', {
        firstName: 'Debug',
        lastName: 'Test',
        email: 'debug.test@company.com',
        password: 'TestPassword123!'
      })
      setResult(JSON.stringify(response.data, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>
        
        <div className="space-y-4 mb-8">
          <button 
            onClick={testHealth}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Health Endpoint
          </button>
          
          <button 
            onClick={testRegistration}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
          >
            Test Registration
          </button>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-2">API Configuration:</h2>
          <p>Base URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003/api'}</p>
          <p>Backend URL: {import.meta.env.VITE_BACKEND_URL || 'http://localhost:5003'}</p>
        </div>

        {result && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiTestPage
