'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface ParcelStats {
  total_parcels: number
  arrived_parcels: number
  collected_parcels: number
  out_for_delivery_parcels: number
}

interface Terminal {
  terminal_id: number
  name: string
  code: string
  address: string
  city: string
  district?: string
  latitude?: string | number
  longitude?: string | number
  phone?: string
  isActive: boolean | number
  operating_hours?: any
  managerId?: number
  manager_name?: string
  manager_email?: string
  created_at: string
  parcelStats?: ParcelStats
}

interface CustomerUser {
  user_id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

export default function TerminalsPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // State
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [customers, setCustomers] = useState<CustomerUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null)
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    district: '',
    latitude: '',
    longitude: '',
    phone: '',
    isActive: true,
    managerId: '' // assigned customer
  })

  useEffect(() => {
    if (!user || user.role !== 'courier') {
      router.push('/auth/login')
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

      // Fetch Terminals
      const termResponse = await fetch('https://api-doba.techgenesismw.com/api/terminals', { headers })
      let terminalsData: Terminal[] = []
      if (termResponse.ok) {
        const data = await termResponse.json()
        terminalsData = data.data || []
        setTerminals(terminalsData)
      } else {
        throw new Error('Failed to load terminals from API')
      }

      // Fetch Customers for assignment dropdown
      const custResponse = await fetch('https://api-doba.techgenesismw.com/api/terminals/available-managers', { headers })
      if (custResponse.ok) {
        const data = await custResponse.json()
        setCustomers(data.data || [])
      }
    } catch (err: any) {
      console.error('Error loading terminals data:', err)
      setError(err.message || 'Error connecting to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      district: '',
      latitude: '',
      longitude: '',
      phone: '',
      isActive: true,
      managerId: ''
    })
    setError('')
  }

  const handleOpenAddModal = () => {
    setEditingTerminal(null)
    resetForm()
    setShowModal(true)
  }

  const handleOpenEditModal = (terminal: Terminal) => {
    setEditingTerminal(terminal)
    setFormData({
      name: terminal.name || '',
      code: terminal.code || '',
      address: terminal.address || '',
      city: terminal.city || '',
      district: terminal.district || '',
      latitude: terminal.latitude ? String(terminal.latitude) : '',
      longitude: terminal.longitude ? String(terminal.longitude) : '',
      phone: terminal.phone || '',
      isActive: Boolean(terminal.isActive),
      managerId: terminal.managerId ? String(terminal.managerId) : ''
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Please fill out all required fields.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingTerminal
        ? `https://api-doba.techgenesismw.com/api/terminals/${editingTerminal.terminal_id}`
        : 'https://api-doba.techgenesismw.com/api/terminals'
      
      const payload = {
        name: formData.name,
        code: editingTerminal 
          ? editingTerminal.code 
          : formData.name.toUpperCase().trim().replace(/[^A-Z0-9]/g, '-').slice(0, 10) + '-' + Math.floor(1000 + Math.random() * 9000),
        address: formData.address,
        city: editingTerminal 
          ? editingTerminal.city 
          : (formData.address.split(',').pop()?.trim() || formData.address),
        district: editingTerminal ? editingTerminal.district : null,
        latitude: editingTerminal ? (editingTerminal.latitude ? parseFloat(String(editingTerminal.latitude)) : null) : null,
        longitude: editingTerminal ? (editingTerminal.longitude ? parseFloat(String(editingTerminal.longitude)) : null) : null,
        phone: formData.phone || null,
        isActive: formData.isActive,
        managerId: formData.managerId ? parseInt(formData.managerId) : null
      }

      const response = await fetch(url, {
        method: editingTerminal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save terminal')
      }

      setSuccess(editingTerminal ? 'Terminal updated successfully!' : 'Terminal created successfully!')
      setShowModal(false)
      resetForm()
      loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to save terminal details.')
    }
  }

  const handleDelete = async (terminalId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the terminal "${name}"?`)) return
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`https://api-doba.techgenesismw.com/api/terminals/${terminalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete terminal')
      }

      setSuccess('Terminal deleted successfully.')
      loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message || 'Could not delete terminal. Check if there are active parcels assigned to it.')
    }
  }

  // Filter logic
  const filteredTerminals = terminals.filter((terminal) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      terminal.name.toLowerCase().includes(searchLower) ||
      terminal.code.toLowerCase().includes(searchLower) ||
      terminal.city.toLowerCase().includes(searchLower) ||
      (terminal.district && terminal.district.toLowerCase().includes(searchLower))
    );
  })

  // Compute stat indicators
  const totalCount = terminals.length
  const activeCount = terminals.filter(t => Boolean(t.isActive)).length
  const maintenanceCount = terminals.filter(t => !Boolean(t.isActive)).length
  const totalAssignedCount = terminals.filter(t => t.managerId !== null && t.managerId !== undefined).length

  if (isLoading && terminals.length === 0) {
    return (
      <DashboardLayout role="courier" title="Terminals">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium animate-pulse">Loading logistics terminals network...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="courier" title="Terminals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Terminals & Hubs</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure shipping hubs, deploy terminal locations, and assign customer supervisors.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-[1px] active:translate-y-[1px] transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New Hub
          </button>
        </div>

        {/* Global Notifications */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl text-sm bg-teal-50 border border-teal-200 text-teal-800 shadow-sm animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {error && !showModal && (
          <div className="flex items-center gap-3 p-4 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-800 shadow-sm animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-2 bg-teal-700 transition-all duration-300" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Terminals</p>
            <p className="text-4xl font-extrabold text-gray-900 group-hover:scale-105 transition-transform origin-left">{totalCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-2 bg-emerald-500 transition-all duration-300" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Operational</p>
            <p className="text-4xl font-extrabold text-emerald-600 group-hover:scale-105 transition-transform origin-left">{activeCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-2 bg-amber-500 transition-all duration-300" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Inactive / Maint.</p>
            <p className="text-4xl font-extrabold text-amber-600 group-hover:scale-105 transition-transform origin-left">{maintenanceCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-2 bg-indigo-500 transition-all duration-300" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Assigned Managers</p>
            <p className="text-4xl font-extrabold text-indigo-600 group-hover:scale-105 transition-transform origin-left">{totalAssignedCount}</p>
          </div>
        </div>

        {/* Toolbar & Listing */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-150 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by terminal name, code, or city..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-sm transition-all shadow-sm"
              />
            </div>
            <p className="text-xs text-gray-400 font-semibold self-end md:self-center">
              Showing {filteredTerminals.length} of {terminals.length} hubs
            </p>
          </div>

          {/* Cards Grid */}
          <div className="divide-y divide-gray-100 bg-white">
            {filteredTerminals.map((terminal) => {
              const isActive = Boolean(terminal.isActive)
              const hasManager = terminal.managerId !== null && terminal.managerId !== undefined
              const hasParcelStats = terminal.parcelStats !== undefined

              return (
                <div 
                  key={terminal.terminal_id} 
                  className="p-6 hover:bg-gray-50/60 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex-1 space-y-3.5">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-3.5">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {terminal.name}
                      </h3>
                      <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-teal-50 border border-teal-200 text-teal-700 tracking-wider">
                        {terminal.code}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border uppercase ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isActive ? 'Active' : 'Maintenance'}
                      </span>
                    </div>

                    {/* Meta info tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{terminal.address}, {terminal.city}{terminal.district ? ` (${terminal.district})` : ''}</span>
                      </div>
                      
                      {terminal.phone && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 00.996.77h.398a1 1 0 00.785-.386l.89-1.11.23-.07a9.05 9.05 0 017.13 7.13l-.071.23-1.11.89a1 1 0 00-.387.785v.398a1 1 0 00.77.996l2.2.547a1 1 0 01.725.94V19a2 2 0 01-2 2h-1c-5.523 0-10-4.477-10-10V5z" />
                          </svg>
                          <span>{terminal.phone}</span>
                        </div>
                      )}

                      {(terminal.latitude && terminal.longitude) && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {Number(terminal.latitude).toFixed(5)}, {Number(terminal.longitude).toFixed(5)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Supervisor Assignee row */}
                    <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          hasManager ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Assigned Customer Assignee</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {hasManager ? terminal.manager_name : 'No Customer Assigned'}
                          </p>
                        </div>
                      </div>
                      {hasManager && (
                        <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                          {terminal.manager_email}
                        </span>
                      )}
                    </div>

                    {/* Capacity & Parcels Stats */}
                    {hasParcelStats && (
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs bg-teal-50/20 border border-teal-100 rounded-xl p-3 text-gray-600">
                        <span className="font-semibold text-teal-800 uppercase tracking-wider">Parcels at Hub:</span>
                        <span>Total: <b>{terminal.parcelStats?.total_parcels || 0}</b></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        <span>Arrived: <b>{terminal.parcelStats?.arrived_parcels || 0}</b></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>Out for Delivery: <b>{terminal.parcelStats?.out_for_delivery_parcels || 0}</b></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Collected: <b>{terminal.parcelStats?.collected_parcels || 0}</b></span>
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-2 sm:self-end lg:self-center flex-shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleOpenEditModal(terminal)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(terminal.terminal_id, terminal.name)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4 mr-1.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}

            {filteredTerminals.length === 0 && (
              <div className="p-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500 font-medium text-sm">No logistics terminals match your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Center Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div 
            className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slide-up"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-200 bg-gray-50/70 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {editingTerminal ? 'Edit Logistics Hub' : 'Add New Terminal Hub'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure coordinates, contacts, and customer supervision assignments.
                </p>
              </div>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-800 shadow-sm">
                  <svg className="w-5 h-5 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Simplified Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Terminal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-sm transition-all shadow-sm"
                    placeholder="e.g. Mzuzu North Central"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Location Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-sm transition-all shadow-sm"
                    placeholder="e.g. Plot 15, City Road, Mzuzu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-sm transition-all shadow-sm"
                    placeholder="e.g. +265 99 999 999"
                  />
                </div>

                {/* User Assignment (Role: Customer) */}
                <div className="bg-teal-50/35 border border-teal-150 rounded-2xl p-5 space-y-3.5 mt-2">
                  <div className="flex items-center gap-2 text-teal-800">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="font-extrabold text-sm uppercase tracking-wide">Assign Customer Assignee</span>
                  </div>
                  
                  <div>
                    <select
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-teal-200 bg-white text-gray-800 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-sm transition-all"
                    >
                      <option value="">-- Click to Select / Unassign Supervisor --</option>
                      {customers.map((cust) => (
                        <option key={cust.user_id} value={cust.user_id}>
                          {cust.first_name} {cust.last_name} ({cust.username} - {cust.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-teal-600 mt-1.5 font-medium leading-relaxed">
                      Only registered system users with the <b>Customer</b> role can be selected and assigned as the terminal supervisor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions Footer inside modal */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-white text-gray-700 py-3 rounded-xl text-sm font-bold border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {editingTerminal ? 'Save Changes' : 'Create Terminal Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
