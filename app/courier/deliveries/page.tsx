'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Delivery {
  order_id: number
  customer_name: string
  shop_name: string
  product_name: string
  quantity: number
  total_amount: number
  status: string
  delivery_address: string
  delivery_phone: string
  pickup_address: string
  estimated_delivery_time?: string
  actual_delivery_time?: string
  created_at: string
}

export default function CourierDeliveriesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user && user.role !== 'courier') {
      router.push('/dashboard')
      return
    }
    loadDeliveries()
  }, [user, router])

  const loadDeliveries = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/deliveries/my', { headers })
      if (response.ok) {
        const data = await response.json()
        const orders = data.data?.orders || []
        
        // Deduplicate orders by order_id to prevent duplicates
        const uniqueOrders = orders.filter((order: any, index: number, self: any[]) => 
          index === self.findIndex((o: any) => o.order_id === order.order_id)
        )
        
        setDeliveries(uniqueOrders)
      }
    } catch (error) {
      console.error('Error loading deliveries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const completeDelivery = async (orderId: number) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/deliveries/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ order_id: orderId }),
      })
      if (response.ok) {
        setMessage('Delivery completed successfully!')
        loadDeliveries()
      }
    } catch (error) {
      setMessage('Failed to complete delivery')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'in_transit': return 'bg-orange-100 text-orange-700'
      case 'delivered': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredDeliveries = filter === 'all' ? deliveries : deliveries.filter(d => d.status === filter)
  const activeDeliveriesCount = deliveries.filter(d => ['in_transit', 'picked_up', 'assigned'].includes(d.status)).length
  const completedTodayCount = deliveries.filter(d => {
    const today = new Date().toDateString()
    return d.actual_delivery_time && new Date(d.actual_delivery_time).toDateString() === today
  }).length

  if (isLoading) {
    return (
      <DashboardLayout role="courier" title="Deliveries">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading deliveries...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="courier" title="Deliveries">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Deliveries</h1>
          <p className="text-sm text-gray-500">Track and manage your ongoing and past assignments</p>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-2.5 p-3.5 rounded-lg text-sm bg-teal-50 border border-teal-200 text-teal-700">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">{message}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Active</p>
            <p className="text-2xl font-bold text-orange-600">{activeDeliveriesCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Today's Completion</p>
            <p className="text-2xl font-bold text-teal-700">{completedTodayCount}</p>
          </div>
          <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-6 text-white relative overflow-hidden">
             <p className="text-xs text-teal-100 uppercase tracking-wider mb-2">Total Deliveries</p>
             <p className="text-2xl font-bold text-white">{deliveries.filter(d => d.status === 'delivered').length}</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {['all', 'in_transit', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === s ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Deliveries List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredDeliveries.map((delivery, index) => (
            <div key={`${delivery.order_id}-${index}`} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-teal-300 transition-all group">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h3.375c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5V14.25m0 0V3.375c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v10.875" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900 mb-1">Order #{delivery.order_id}</p>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="space-y-3">
                         <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Shipment</p>
                            <p className="text-sm font-semibold text-gray-900">{delivery.product_name}</p>
                            <p className="text-xs text-teal-600 font-medium">Quantity: {delivery.quantity}</p>
                         </div>
                         <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Pick up From</p>
                            <p className="text-sm font-semibold text-gray-900">{delivery.shop_name}</p>
                            <p className="text-xs text-gray-500">{delivery.pickup_address}</p>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                            <p className="text-sm font-semibold text-gray-900">{delivery.customer_name}</p>
                            <p className="text-xs text-teal-600 font-medium">{delivery.delivery_phone}</p>
                         </div>
                         <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Drop off At</p>
                            <p className="text-sm font-semibold text-gray-900">{delivery.delivery_address}</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-col items-center lg:items-end justify-center gap-4 lg:border-l lg:border-gray-100 lg:pl-6">
                     <div className="text-center lg:text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Fee</p>
                        <p className="text-lg font-bold text-gray-900">MWK {delivery.total_amount.toLocaleString()}</p>
                     </div>
                     
                     {delivery.status === 'in_transit' && (
                       <button
                         onClick={() => completeDelivery(delivery.order_id)}
                         className="w-full px-4 py-2.5 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
                       >
                         Mark Completed
                       </button>
                     )}
                  </div>
                </div>
                
                {delivery.estimated_delivery_time && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                     <p className="text-xs text-gray-400 uppercase tracking-wider">Target Arrival</p>
                     <p className="text-xs font-semibold text-gray-900">{new Date(delivery.estimated_delivery_time).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredDeliveries.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h3.375c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5V14.25m0 0V3.375c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v10.875" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No deliveries active</h3>
              <p className="text-sm text-gray-500">Your tracking queue is currently empty.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
