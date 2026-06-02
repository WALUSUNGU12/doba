'use client'

import { useState } from 'react'

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSeed = async () => {
    setIsLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Database seeded successfully! Check console for details.')
        console.log('=== LOGIN CREDENTIALS ===')
        console.log('Admin: admin@dobadoba.com / admin123')
        console.log('Sellers: techstore@dobadoba.com / seller123')
        console.log('Customers: customer1@dobadoba.com / customer123')
        console.log('Couriers: courier1@dobadoba.com / courier123')
        console.log('========================')
      } else {
        setError(data.error || 'Failed to seed database')
      }
    } catch (err) {
      setError('Failed to seed database. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Database Seeding</h1>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Click the button below to populate the database with sample data including:
          </p>
          
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Admin user account</li>
            <li>• 4 Seller accounts with shops</li>
            <li>• 12 Sample products</li>
            <li>• 3 Customer accounts</li>
            <li>• 2 Courier accounts</li>
          </ul>

          <button
            onClick={handleSeed}
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? 'Seeding Database...' : 'Seed Database'}
          </button>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">{message}</p>
              <p className="text-green-600 text-xs mt-2">
                Check browser console (F12) for login credentials
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
