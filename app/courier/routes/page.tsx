'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface WeightTier {
  minWeight: number
  maxWeight: number
  fee: number
}

interface DeliveryRoute {
  route_id?: number
  name: string
  origin: string
  destination: string
  baseFee: number
  weightTiers: WeightTier[]
  isActive: boolean
}

interface Terminal {
  terminal_id: number
  name: string
  code: string
  city: string
}

export default function CourierRoutesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [routes, setRoutes] = useState<DeliveryRoute[]>([])
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<DeliveryRoute | null>(null)
  const [viewingRoute, setViewingRoute] = useState<DeliveryRoute | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<DeliveryRoute>({
    name: '',
    origin: '',
    destination: '',
    baseFee: 0,
    weightTiers: [
      { minWeight: 0, maxWeight: 1, fee: 1000 },
      { minWeight: 1, maxWeight: 2, fee: 2000 },
      { minWeight: 2, maxWeight: 5, fee: 3500 },
      { minWeight: 5, maxWeight: 10, fee: 5000 },
      { minWeight: 10, maxWeight: 20, fee: 8000 },
    ],
    isActive: true
  })

  useEffect(() => {
    if (!user || user.role !== 'courier') {
      router.push('/auth/login')
      return
    }
    loadRoutes()
    loadTerminals()
  }, [user, router])

  const loadTerminals = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://api-doba.techgenesismw.com/api/terminals', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (response.ok) {
        const data = await response.json()
        setTerminals(data.data || [])
      }
    } catch (err) {
      console.error('Error loading terminals:', err)
    }
  }

  const loadRoutes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://api-doba.techgenesismw.com/api/courier/routes', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (response.ok) {
        const data = await response.json()
        setRoutes(data.data || [])
      }
    } catch (error) {
      console.error('Error loading routes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const url = editingRoute?.route_id 
        ? `https://api-doba.techgenesismw.com/api/courier/routes/${editingRoute.route_id}`
        : 'https://api-doba.techgenesismw.com/api/courier/routes'
      
      const response = await fetch(url, {
        method: editingRoute ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Failed to save route')

      setSuccess(editingRoute ? 'Route updated!' : 'Route created!')
      setShowModal(false)
      setEditingRoute(null)
      resetForm()
      loadRoutes()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save route')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      origin: '',
      destination: '',
      baseFee: 0,
      weightTiers: [
        { minWeight: 0, maxWeight: 1, fee: 1000 },
        { minWeight: 1, maxWeight: 2, fee: 2000 },
        { minWeight: 2, maxWeight: 5, fee: 3500 },
        { minWeight: 5, maxWeight: 10, fee: 5000 },
        { minWeight: 10, maxWeight: 20, fee: 8000 },
      ],
      isActive: true
    })
  }

  const handleEdit = (route: DeliveryRoute) => {
    setEditingRoute(route)
    setFormData(route)
    setShowModal(true)
  }

  const handleDelete = async (routeId: number) => {
    if (!confirm('Are you sure?')) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://api-doba.techgenesismw.com/api/courier/routes/${routeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setSuccess('Route deleted')
        loadRoutes()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      setError('Failed to delete route')
    }
  }

  const addWeightTier = () => {
    const lastTier = formData.weightTiers[formData.weightTiers.length - 1]
    const newMin = lastTier ? lastTier.maxWeight : 0
    setFormData({
      ...formData,
      weightTiers: [...formData.weightTiers, { minWeight: newMin, maxWeight: newMin + 5, fee: 10000 }]
    })
  }

  const updateWeightTier = (index: number, field: keyof WeightTier, value: number) => {
    const updatedTiers = formData.weightTiers.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    )
    setFormData({ ...formData, weightTiers: updatedTiers })
  }

  if (isLoading) {
    return (
      <DashboardLayout role="courier" title="Routes">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading routes...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="courier" title="Routes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Delivery Routes</h1>
            <p className="text-sm text-gray-500">Manage your shipping lanes and pricing</p>
          </div>
          <button
            onClick={() => { setEditingRoute(null); resetForm(); setShowModal(true); }}
            className="bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
          >
            + Add Route
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg text-sm bg-teal-50 border border-teal-200 text-teal-700 mb-6">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <div key={route.route_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-teal-300 transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-base font-bold text-gray-900">{route.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${route.isActive ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-700'}`}>
                    {route.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Base Fee</p>
                  <p className="text-lg font-bold text-teal-700">MWK {route.baseFee.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setViewingRoute(route)} className="flex-1 bg-teal-50 text-teal-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-100 transition-colors">Details</button>
                  <button onClick={() => handleEdit(route)} className="flex-1 bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(route.route_id!)} className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {routes.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <p className="text-sm text-gray-500 font-medium">No routes created yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingRoute ? 'Edit Route' : 'Create New Route'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="font-semibold">{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Route Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-0 text-sm"
                    placeholder="e.g., Mzuzu City Route"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Base Fee (MWK)</label>
                  <input
                    type="number"
                    value={formData.baseFee}
                    onChange={(e) => setFormData({ ...formData, baseFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-0 text-sm"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Origin Terminal</label>
                  <select
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-0 text-sm bg-white"
                    required
                  >
                    <option value="">Select Origin Terminal</option>
                    {terminals
                      .filter((t) => t.name !== formData.destination)
                      .map((t) => (
                        <option key={t.terminal_id} value={t.name}>
                          {t.name} ({t.city})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Destination Terminal</label>
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-0 text-sm bg-white"
                    required
                  >
                    <option value="">Select Destination Terminal</option>
                    {terminals
                      .filter((t) => t.name !== formData.origin)
                      .map((t) => (
                        <option key={t.terminal_id} value={t.name}>
                          {t.name} ({t.city})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Route is Active</span>
                </label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">Weight Tiers</label>
                  <button
                    type="button"
                    onClick={addWeightTier}
                    className="text-teal-700 text-sm font-semibold hover:text-teal-600"
                  >
                    + Add Tier
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.weightTiers.map((tier, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={tier.minWeight}
                        onChange={(e) => updateWeightTier(index, 'minWeight', Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Min kg"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        value={tier.maxWeight}
                        onChange={(e) => updateWeightTier(index, 'maxWeight', Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Max kg"
                      />
                      <input
                        type="number"
                        value={tier.fee}
                        onChange={(e) => updateWeightTier(index, 'fee', Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Fee (MWK)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.weightTiers.filter((_, i) => i !== index)
                          setFormData({ ...formData, weightTiers: updated })
                        }}
                        className="text-red-600 hover:text-red-700 font-semibold px-2 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingRoute(null); resetForm(); }}
                  className="flex-1 bg-white text-gray-700 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
                >
                  {editingRoute ? 'Update Route' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{viewingRoute.name}</h2>
              <button onClick={() => setViewingRoute(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${viewingRoute.isActive ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-700'}`}>
                  {viewingRoute.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Origin</p>
                  <p className="text-sm font-semibold text-gray-900">{viewingRoute.origin}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Destination</p>
                  <p className="text-sm font-semibold text-gray-900">{viewingRoute.destination}</p>
                </div>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <p className="text-xs text-teal-600 uppercase tracking-wider">Base Fee</p>
                <p className="text-lg font-bold text-teal-700">MWK {viewingRoute.baseFee.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Weight Tiers</p>
                <div className="space-y-2">
                  {viewingRoute.weightTiers.map((tier, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700">{tier.minWeight} - {tier.maxWeight} kg</span>
                      <span className="text-sm font-semibold text-teal-700">MWK {tier.fee.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
