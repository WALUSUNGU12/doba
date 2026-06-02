'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Order {
  order_id: number
  order_number: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  street_address: string
  city: string
}

interface TrackedOrder {
  order_id: number
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  total_amount: string
  notes: string
  created_at: string
  updated_at: string
  items: Array<{ name: string; quantity: number; subtotal: number }>
  customer?: { first_name: string; last_name: string; email: string; phone: string }
  shipping?: { street_address: string; city: string }
  courier?: { first_name: string; last_name: string; phone: string }
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  preparing: 'bg-purple-50 text-purple-700 border-purple-200',
  ready_for_pickup: 'bg-teal-50 text-teal-700 border-teal-200',
  out_for_delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_transit: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-teal-50 text-teal-700 border-teal-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const filterOptions = ['all', 'pending', 'confirmed', 'in_transit', 'out_for_delivery', 'delivered']

function getStatusStep(status: string) {
  const steps = ['pending', 'confirmed', 'in_transit', 'out_for_delivery', 'delivered']
  if (status === 'assigned' || status === 'processing') return 1
  if (status === 'picked_up' || status === 'shipped') return 2
  if (status === 'collected') return 4
  const idx = steps.indexOf(status)
  return idx === -1 ? 0 : idx
}

export default function OrdersPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isTrackingLoading, setIsTrackingLoading] = useState(false)
  const [trackError, setTrackError] = useState('')

  useEffect(() => {
    if (isAuthLoading) return
    if (!user) { router.push('/auth/login'); return }
    loadOrders()
  }, [user, isAuthLoading, router])

  const loadOrders = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    try {
      const res = await fetch('https://api-doba.techgenesismw.com/api/orders/my-orders', { headers })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.data?.orders || [])
      }
    } catch (err) {
      console.error('Error loading orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrackOrder = async (orderNumber: string) => {
    setIsTrackingLoading(true)
    setTrackError('')
    try {
      const res = await fetch(`https://api-doba.techgenesismw.com/api/orders/track/${orderNumber}`)
      const data = await res.json()
      const orderData = data.data?.order || data.data
      if (data.success && orderData) {
        setTrackedOrder(orderData)
        setShowModal(true)
      } else {
        setTrackError('Failed to load order details.')
      }
    } catch {
      setTrackError('Failed to track order. Please try again.')
    } finally {
      setIsTrackingLoading(false)
    }
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (isAuthLoading || isLoading) {
    return (
      <DashboardLayout role="customer" title="My Orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-7 h-7 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer" title="My Orders">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track your purchases and deliveries</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {filterOptions.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-teal-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700'
              }`}
            >
              {status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {trackError && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {trackError}
          </div>
        )}

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No orders found</p>
            <p className="text-xs text-gray-500">Try a different filter or start shopping</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <div key={order.order_id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {(order.street_address || order.city) && (
                      <p className="text-xs text-gray-500">{[order.street_address, order.city].filter(Boolean).join(', ')}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Total</p>
                      <p className="text-base font-bold text-gray-900">MWK {order.total_amount.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleTrackOrder(order.order_number)}
                      disabled={isTrackingLoading}
                      className="px-3.5 py-2 text-xs font-semibold text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
                    >
                      {isTrackingLoading ? 'Loading...' : 'Track'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tracking modal */}
      {showModal && trackedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order Tracking</p>
                <h2 className="text-lg font-bold text-gray-900">{trackedOrder.order_number}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status steps */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Delivery Status</p>
                <div className="flex items-center justify-between">
                  {['Pending', 'Confirmed', 'In Transit', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                    const currentStep = getStatusStep(trackedOrder.status)
                    const isActive = idx <= currentStep
                    const isCurrent = idx === currentStep
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                          isActive ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-2 ring-teal-200 ring-offset-1' : ''}`}>
                          {isActive ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            <span className="text-xs font-semibold">{idx + 1}</span>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${isActive ? 'text-teal-700' : 'text-gray-400'}`}>{step}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Customer info */}
              {trackedOrder.customer && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Customer</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Name</p>
                      <p className="text-sm font-semibold text-gray-900">{trackedOrder.customer.first_name} {trackedOrder.customer.last_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{trackedOrder.customer.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery info */}
              {trackedOrder.shipping && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Delivery Address</p>
                  <p className="text-sm font-semibold text-gray-900">{trackedOrder.shipping.street_address}, {trackedOrder.shipping.city}</p>
                  {trackedOrder.notes && (
                    <p className="text-xs text-gray-500 mt-1">
                      {trackedOrder.notes.split(', ').filter(d => !d.includes('Operator:') && !d.includes('Charge ID:')).join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Courier info */}
              {trackedOrder.courier && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-3">Courier</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-teal-600 mb-0.5">Name</p>
                      <p className="text-sm font-semibold text-gray-900">{trackedOrder.courier.first_name} {trackedOrder.courier.last_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-teal-600 mb-0.5">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{trackedOrder.courier.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              {trackedOrder.items?.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Items</p>
                  <div className="space-y-2">
                    {trackedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                        <span className="text-sm font-semibold text-gray-900">MWK {item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
