'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface Terminal {
  terminal_id: number
  name: string
  code: string
  address: string
  city: string
  district: string
  phone: string
  is_active: number
}

interface Parcel {
  terminal_parcel_id: number
  status: 'arrived' | 'collected' | 'out_for_delivery'
  arrived_at: string
  collected_at: string | null
  notes: string | null
  delivery_id: number
  tracking_number: string
  delivery_status: string
  order_number: string
  customer_name: string
  customer_phone: string
  street_address: string
  delivery_city: string
}

interface InvolvedOrder {
  order_id: number
  order_number: string
  status: string
  courier_id?: number | null
  total_amount: number
  payment_status: string
  created_at: string
  customer_name: string
  customer_phone: string
  shop_name: string
  origin_terminal_name: string
  delivery_terminal_name: string
  terminal_involvement_role: string
}

export default function TerminalOperatorPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [terminal, setTerminal] = useState<Terminal | null>(null)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [involvedOrders, setInvolvedOrders] = useState<InvolvedOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'out_for_delivery' | 'completed' | 'all' | 'involved_orders'>('involved_orders')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all')
  
  // Modal / Drawer state for actions
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Simulated Scanner State
  const [scannerInput, setScannerInput] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    if (isAuthLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    // Verify user role is customer or operator
    if (user.role !== 'customer' && user.role !== 'operator') {
      router.push('/dashboard')
      return
    }
    loadOperatorData()
  }, [user, isAuthLoading, router])

  const loadOperatorData = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    try {
      // 1. Fetch assigned terminal
      const termRes = await fetch('https://api-doba.techgenesismw.com/api/terminals/my-terminal', { headers })
      if (!termRes.ok) throw new Error('Failed to load assigned terminal.')
      
      const termData = await termRes.json()
      if (!termData.success || !termData.data) {
        setTerminal(null)
        setIsLoading(false)
        return
      }
      
      const activeTerminal = termData.data
      setTerminal(activeTerminal)

      // 2. Fetch parcels at this terminal
      const parcelsRes = await fetch(`https://api-doba.techgenesismw.com/api/terminals/${activeTerminal.terminal_id}/parcels`, { headers })
      if (parcelsRes.ok) {
        const parcelsData = await parcelsRes.json()
        setParcels(parcelsData.data || [])
      }

      // 3. Fetch involved marketplace orders
      setIsLoadingOrders(true)
      const ordersRes = await fetch(`https://api-doba.techgenesismw.com/api/terminals/${activeTerminal.terminal_id}/orders`, { headers })
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setInvolvedOrders(ordersData.data || [])
      }
    } catch (err) {
      console.error('Error loading operator dashboard:', err)
      setMessage({ type: 'error', text: 'Could not load your active terminal dashboard.' })
    } finally {
      setIsLoading(false)
      setIsLoadingOrders(false)
    }
  }

  // Handle Mark as Collected (Redemption)
  const handleRedeem = async (parcelId: number) => {
    if (!terminal) return
    setSubmitting(true)
    setMessage(null)
    
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    try {
      const res = await fetch(`https://api-doba.techgenesismw.com/api/terminals/${terminal.terminal_id}/parcels/${parcelId}/collect`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ notes: actionNotes })
      })
      
      const data = await res.json()
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Parcel successfully marked as REDEEMED / COLLECTED!' })
        setSelectedParcel(null)
        setActionNotes('')
        // Refresh parcel list
        loadOperatorData()
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to complete redemption.' })
      }
    } catch (err) {
      console.error('Redeem parcel error:', err)
      setMessage({ type: 'error', text: 'Server error during redemption submission.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Dispatch local delivery
  const handleDispatch = async (parcelId: number) => {
    if (!terminal) return
    setSubmitting(true)
    setMessage(null)
    
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    try {
      const res = await fetch(`https://api-doba.techgenesismw.com/api/terminals/${terminal.terminal_id}/parcels/${parcelId}/out-for-delivery`, {
        method: 'PUT',
        headers
      })
      
      const data = await res.json()
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Parcel marked as OUT FOR DELIVERY successfully!' })
        setSelectedParcel(null)
        loadOperatorData()
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to dispatch parcel.' })
      }
    } catch (err) {
      console.error('Dispatch parcel error:', err)
      setMessage({ type: 'error', text: 'Server error during dispatch submission.' })
    } finally {
      setSubmitting(false)
    }
  }

  const acceptOrder = async (orderId: number) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/deliveries/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ 
          order_id: orderId,
          estimated_delivery_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        })
      })
      if (response.ok) {
        setMessage({ type: 'success', text: 'Order accepted successfully!' })
        loadOperatorData()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.message || 'Failed to accept order.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to accept order due to server error.' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  // Barcode search trigger
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scannerInput.trim()) return
    
    const cleanInput = scannerInput.trim().toUpperCase()
    const foundParcel = parcels.find(
      p => p.tracking_number.toUpperCase() === cleanInput || p.order_number.toUpperCase() === cleanInput
    )
    
    if (foundParcel) {
      setSelectedParcel(foundParcel)
      setMessage({ type: 'success', text: `Scanned Parcel found: ${foundParcel.tracking_number}` })
    } else {
      setMessage({ type: 'error', text: `No parcel found with barcode: "${cleanInput}"` })
    }
    setScannerInput('')
  }

  if (isAuthLoading || isLoading) {
    return (
      <DashboardLayout role={user?.role || 'customer'} title="Terminal Operator Portal">
        <div className="flex flex-col items-center justify-center min-h-[450px]">
          <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-500 animate-pulse">Initializing terminal supervisor environment...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!terminal) {
    return (
      <DashboardLayout role={user?.role || 'customer'} title="Access Denied">
        <div className="max-w-md mx-auto my-16 text-center bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">No Active Assignment</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            You are not currently registered as the active supervisor of any logistics hub terminal. Please contact system support or logistics couriers to assign you.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  // Filter parcels
  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = 
      parcel.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.customer_phone.includes(searchTerm)
      
    if (activeTab === 'pending') return matchesSearch && parcel.status === 'arrived'
    if (activeTab === 'out_for_delivery') return matchesSearch && parcel.status === 'out_for_delivery'
    if (activeTab === 'completed') return matchesSearch && parcel.status === 'collected'
    return matchesSearch
  })

  // Metrics
  const pendingCount = parcels.filter(p => p.status === 'arrived').length
  const outForDeliveryCount = parcels.filter(p => p.status === 'out_for_delivery').length
  const completedCount = parcels.filter(p => p.status === 'collected').length
  const totalCount = parcels.length

  return (
    <DashboardLayout role={user?.role || 'customer'} title="Terminal Operator Portal">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Link href="/dashboard" className="text-xs font-bold text-teal-700 hover:text-teal-800 uppercase tracking-wider transition-colors flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">Terminal Operator Hub</h1>
            <p className="text-xs text-gray-500 mt-0.5">Authorized staff portal for parcel arrivals, pickups, and redemptions.</p>
          </div>
          
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="flex items-center gap-2 bg-teal-900 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-teal-800 transition-colors shadow-sm active:scale-95 duration-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {showScanner ? 'Close Scanner Tool' : 'Simulate Scanner Tool'}
          </button>
        </div>

        {/* Global Alert Notification */}
        {message && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 border text-sm font-semibold shadow-sm animate-fadeIn ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              {message.type === 'success' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              )}
            </svg>
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
          </div>
        )}

        {/* Scanner Panel */}
        {showScanner && (
          <div className="p-6 bg-teal-50 border border-teal-200 rounded-3xl animate-slideDown shadow-inner space-y-4">
            <div className="flex items-center gap-2 text-teal-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-16v4m0 4h.01M4 12h2m0 0h2v-4m0 8h-2v4m12 0h-2v-4m0-4h.01M16 16h.01M12 12h.01M8 16h.01" />
              </svg>
              <h2 className="font-extrabold text-sm uppercase tracking-wider">Simulated Barcode Scanner Input</h2>
            </div>
            <p className="text-xs text-teal-700 leading-relaxed max-w-2xl">
              Type or paste a tracking code (e.g. <code>DBX-XXXXXXXXXX</code>) or order number to simulate scanning a parcel's physically arriving barcode label at the terminal door.
            </p>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2 max-w-md">
              <input
                type="text"
                required
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value)}
                placeholder="e.g. DB-2026-..."
                className="flex-1 px-4 py-2.5 border border-teal-300 bg-white rounded-xl focus:border-teal-600 focus:outline-none text-sm transition-all shadow-sm font-mono"
              />
              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Scan Barcode
              </button>
            </form>
          </div>
        )}

        {/* Terminal Info Overview */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wide">Terminal Operational</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{terminal.name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                🔑 <b>Code:</b> <code className="font-mono bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">{terminal.code}</code>
              </span>
              <span>•</span>
              <span>📍 <b>Location:</b> {terminal.address}, {terminal.city}</span>
              {terminal.phone && (
                <>
                  <span>•</span>
                  <span>📞 <b>Phone:</b> {terminal.phone}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 md:w-80">
            {[
              { label: 'Pending', count: pendingCount, color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'Transit', count: outForDeliveryCount, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
              { label: 'Delivered', count: completedCount, color: 'text-teal-700 bg-teal-50 border-teal-100' }
            ].map((m) => (
              <div key={m.label} className={`border rounded-2xl p-3 text-center ${m.color}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">{m.label}</p>
                <p className="text-lg font-black mt-0.5">{m.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Worklist Grid */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Control Bar */}
          <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All Orders', count: involvedOrders.length },
                { id: 'pending', label: 'Pending', count: involvedOrders.filter(o => o.status === 'pending').length },
                { id: 'confirmed', label: 'Confirmed', count: involvedOrders.filter(o => o.status === 'confirmed').length },
                { id: 'in_transit', label: 'In Transit', count: involvedOrders.filter(o => o.status === 'in_transit').length },
                { id: 'out_for_delivery', label: 'Out for Delivery', count: involvedOrders.filter(o => o.status === 'out_for_delivery').length },
                { id: 'delivered', label: 'Delivered', count: involvedOrders.filter(o => o.status === 'delivered').length },
                { id: 'cancelled', label: 'Cancelled', count: involvedOrders.filter(o => o.status === 'cancelled').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    orderStatusFilter === tab.id
                      ? 'bg-teal-900 text-white border-teal-900 shadow-sm'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Smart Search */}
            <div className="relative md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search code, phone, name..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none text-xs transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            {activeTab === 'involved_orders' ? (
              (() => {
                const filteredOrders = involvedOrders.filter(order => {
                  const matchesSearch = (
                    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.customer_phone.includes(searchTerm) ||
                    (order.shop_name && order.shop_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (order.origin_terminal_name && order.origin_terminal_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (order.delivery_terminal_name && order.delivery_terminal_name.toLowerCase().includes(searchTerm.toLowerCase()))
                  );
                  const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
                  return matchesSearch && matchesStatus;
                });

                return filteredOrders.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p className="text-sm font-semibold">No involved orders found</p>
                    <p className="text-xs text-gray-400 mt-1">Try clearing your search or checking active listings.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-200">
                        <th className="px-6 py-4">Order Number & Shop</th>
                        <th className="px-6 py-4">Customer Info</th>
                        <th className="px-6 py-4">Hub Involvement & Routing</th>
                        <th className="px-6 py-4">Date Placed</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-sm">
                      {filteredOrders.map((order) => (
                        <tr key={order.order_id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-6 py-4.5 space-y-1">
                            <div className="font-extrabold text-gray-900 font-mono tracking-tight">
                              {order.order_number}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              Seller Shop: <span className="font-semibold text-teal-800">{order.shop_name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 space-y-0.5">
                            <div className="font-bold text-gray-800">{order.customer_name}</div>
                            <div className="text-xs text-gray-400 font-mono">{order.customer_phone}</div>
                          </td>
                          <td className="px-6 py-4.5 space-y-1">
                            <div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                order.terminal_involvement_role.includes('Origin & Destination') 
                                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                  : order.terminal_involvement_role.includes('Origin')
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-teal-50 text-teal-700 border-teal-200'
                              }`}>
                                {order.terminal_involvement_role}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 font-medium mt-1">
                              Origin: <span className="font-semibold text-gray-700">{order.origin_terminal_name || 'N/A'}</span> → Destination: <span className="font-semibold text-gray-700">{order.delivery_terminal_name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-xs text-gray-500 font-medium">
                            {new Date(order.created_at).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4.5 space-y-1">
                            <div>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                order.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : order.status === 'delivered' || order.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                                  : order.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  order.status === 'pending'
                                    ? 'bg-amber-500 animate-pulse'
                                    : order.status === 'delivered' || order.status === 'completed'
                                    ? 'bg-emerald-500'
                                    : 'bg-blue-500'
                                }`} />
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                order.payment_status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-100'
                              }`}>
                                {order.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-right whitespace-nowrap">
                            {(() => {
                              const isOrigin = order.terminal_involvement_role === 'Origin Hub (Seller nearby)' || order.terminal_involvement_role === 'Origin & Destination';
                              const isDest = order.terminal_involvement_role === 'Destination Hub (Delivery target)' || order.terminal_involvement_role === 'Origin & Destination';

                              if (order.status === 'confirmed' && isOrigin) {
                                return (
                                  <button
                                    onClick={() => acceptOrder(order.order_id)}
                                    className="bg-teal-900 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-teal-800 transition-colors shadow-sm"
                                  >
                                    Accept
                                  </button>
                                )
                              }
                              if (order.status === 'in_transit' && isDest) {
                                return (
                                  <button
                                    onClick={() => acceptOrder(order.order_id)}
                                    className="bg-teal-900 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-teal-800 transition-colors shadow-sm"
                                  >
                                    Accept
                                  </button>
                                )
                              }
                              return (
                                <span className="text-xs text-gray-400 font-semibold italic capitalize">
                                  {order.status.replace('_', ' ')}
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()
            ) : filteredParcels.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-sm font-semibold">No parcels found</p>
                <p className="text-xs text-gray-400 mt-1">Try switching filter tabs or clearing your search.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-200">
                    <th className="px-6 py-4">Tracking & Order</th>
                    <th className="px-6 py-4">Customer Info</th>
                    <th className="px-6 py-4">Arrived At</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-sm">
                  {filteredParcels.map((parcel) => (
                    <tr key={parcel.terminal_parcel_id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-6 py-4.5 space-y-1">
                        <div className="font-extrabold text-gray-900 font-mono tracking-tight">
                          {parcel.tracking_number}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          Order: <span className="font-semibold text-gray-600">{parcel.order_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 space-y-0.5">
                        <div className="font-bold text-gray-800">{parcel.customer_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{parcel.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4.5 text-xs text-gray-500 font-medium">
                        {new Date(parcel.arrived_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          parcel.status === 'arrived' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : parcel.status === 'out_for_delivery'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-250'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            parcel.status === 'arrived' 
                              ? 'bg-amber-500 animate-pulse' 
                              : parcel.status === 'out_for_delivery'
                              ? 'bg-indigo-500 animate-pulse'
                              : 'bg-emerald-500'
                          }`} />
                          {parcel.status === 'arrived' 
                            ? 'Pending Redemption' 
                            : parcel.status === 'out_for_delivery'
                            ? 'Out for Delivery'
                            : 'Collected / Redeemed'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        {parcel.status !== 'collected' ? (
                          <button
                            onClick={() => {
                              setSelectedParcel(parcel)
                              setActionNotes(parcel.notes || '')
                            }}
                            className="bg-teal-900 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg hover:bg-teal-800 transition-colors shadow-sm"
                          >
                            Redeem / Dispatch
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-2 flex items-center justify-end gap-1">
                            ✅ Redeemed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal: Redemption / Action Portal */}
        {selectedParcel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white border border-gray-150 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-950 to-teal-900 text-white px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">Parcel Redemption Operations</h3>
                  <p className="text-[10px] text-teal-200 font-bold uppercase tracking-widest mt-0.5">
                    ID: {selectedParcel.tracking_number}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="text-teal-300 hover:text-white transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                
                {/* Details grid */}
                <div className="bg-gray-50 rounded-2xl p-4.5 border border-gray-100 space-y-3 text-xs leading-relaxed">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Customer Name</p>
                      <p className="font-bold text-gray-900">{selectedParcel.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Phone Number</p>
                      <p className="font-bold text-gray-900 font-mono">{selectedParcel.customer_phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Delivery Address</p>
                    <p className="font-medium text-gray-800">
                      {selectedParcel.street_address}, {selectedParcel.delivery_city}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Order Number</p>
                      <p className="font-bold text-teal-800 font-mono">{selectedParcel.order_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px] mb-0.5">Arrived At Hub</p>
                      <p className="font-bold text-gray-700">
                        {new Date(selectedParcel.arrived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Operations Actions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Collection / Staff Handover Notes
                    </label>
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="e.g. Verification ID checked, collected by customer in-person."
                      rows={3}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs transition-all shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    
                    {/* Collection Redemption Option */}
                    <button
                      onClick={() => handleRedeem(selectedParcel.terminal_parcel_id)}
                      disabled={submitting || selectedParcel.status === 'collected'}
                      className="w-full bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:bg-gray-200 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      🎁 Mark as Collected (Redeem In-Person)
                    </button>

                    {/* Dispatch Out for Delivery Option */}
                    {selectedParcel.status === 'arrived' && (
                      <button
                        onClick={() => handleDispatch(selectedParcel.terminal_parcel_id)}
                        disabled={submitting}
                        className="w-full bg-teal-900 hover:bg-teal-800 active:bg-teal-950 disabled:bg-gray-200 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl border border-teal-800 transition-all flex items-center justify-center gap-2"
                      >
                        🚚 Dispatch for Local Courier Delivery
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedParcel(null)}
                      className="w-full bg-white text-gray-700 border border-gray-300 font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Close / Cancel
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
