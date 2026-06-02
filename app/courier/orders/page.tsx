'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface OrderItem {
  order_item_id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  subtotal: number
  image_urls: string[]
}

interface Order {
  order_id: number
  order_number: string
  customer_id: number
  customer_first_name: string
  customer_last_name: string
  customer_phone?: string
  seller_id: number
  seller_first_name: string
  seller_last_name: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  updated_at: string
  street_address: string
  city: string
  district: string
  estimated_delivery?: string
  courier_notes?: string
  items?: OrderItem[]
  courier_revenue?: number
  shop_name?: string
}

export default function CourierOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [orderType, setOrderType] = useState<'assigned' | 'available'>('assigned')
  const [message, setMessage] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (user && user.role !== 'courier') {
      router.push('/dashboard')
      return
    }
    if (user && user.role === 'courier') {
      loadOrders()
    }
  }, [user, orderType])

  const loadOrders = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    setOrders([])
    try {
      const endpoint = orderType === 'available'
        ? 'https://api-doba.techgenesismw.com/api/deliveries/available'
        : 'https://api-doba.techgenesismw.com/api/deliveries/my'
      const response = await fetch(endpoint, { headers })
      if (response.ok) {
        const data = await response.json()
        const uniqueOrders = (data.data?.orders || []).filter(
          (order: Order, index: number, self: Order[]) =>
            index === self.findIndex((o: Order) => o.order_id === order.order_id)
        )
        setOrders(uniqueOrders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateDeliveryStatus = async (orderId: number, status: string, notes?: string) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/orders/${orderId}/courier-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status, notes })
      })
      if (response.ok) {
        setMessage(`Order marked as ${status.replace('_', ' ')}!`)
        loadOrders()
        setSelectedOrder(null)
      }
    } catch (error) {
      setMessage('Failed to update status')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const selfAssignOrder = async (orderId: number) => {
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
        setMessage('Order accepted successfully!')
        loadOrders()
      }
    } catch (error) {
      setMessage('Failed to accept order')
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'in_transit': return 'bg-orange-100 text-orange-700'
      case 'delivered': return 'bg-emerald-100 text-emerald-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (isLoading) {
    return (
      <DashboardLayout role="courier" title="Orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading orders...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="courier" title="Orders">
      {/* Detail View Mode */}
      {selectedOrder ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => setSelectedOrder(null)} className="mb-6 flex items-center text-gray-700 font-semibold text-sm hover:text-teal-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to List
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
              {/* Main Order Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs text-teal-600 uppercase tracking-wider mb-1 font-semibold">Assigned Shipment</p>
                    <h1 className="text-xl font-bold text-gray-900">{selectedOrder.order_number}</h1>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                   <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                      <p className="text-xs text-gray-500">{selectedOrder.customer_phone}</p>
                   </div>
                   <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Earnings</p>
                      <p className="text-lg font-bold text-teal-700">MWK {(selectedOrder.courier_revenue || 0).toLocaleString()}</p>
                   </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Delivery Address</p>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{selectedOrder.street_address}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.city}, {selectedOrder.district}</p>
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Package Contents</h2>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.order_item_id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">MWK {item.subtotal.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-6 text-white">
                <h3 className="text-base font-bold mb-6">Management</h3>
                
                {selectedOrder.status === 'in_transit' ? (
                  <button 
                    onClick={() => updateDeliveryStatus(selectedOrder.order_id, 'delivered', 'Handed over to customer')}
                    className="w-full py-2.5 bg-white text-teal-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Confirm Delivery
                  </button>
                ) : (
                  <p className="text-xs font-semibold text-teal-100 text-center uppercase tracking-wider">
                    Status: {selectedOrder.status.replace('_', ' ')}
                  </p>
                )}

                <div className="mt-6 pt-6 border-t border-teal-600 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-teal-100 uppercase tracking-wider">Route</span>
                    <span className="text-xs font-semibold text-white">Mzuzu Central</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List Mode */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {message && (
            <div className="mb-6 flex items-center gap-2.5 p-3.5 rounded-lg text-sm bg-teal-50 border border-teal-200 text-teal-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold">{message}</p>
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200 mb-8 w-fit">
            <button
              onClick={() => setOrderType('assigned')}
              className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                orderType === 'assigned' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Fleet
            </button>
            <button
              onClick={() => setOrderType('available')}
              className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                orderType === 'available' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Market
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
               <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total</p>
               <p className="text-xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
               <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">To Deliver</p>
               <p className="text-xl font-bold text-orange-600">{orders.filter(o => ['confirmed', 'in_transit'].includes(o.status)).length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
               <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Revenue</p>
               <p className="text-xl font-bold text-teal-700">MWK {orders.reduce((sum, o) => sum + (o.courier_revenue || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-4 text-white">
               <p className="text-xs text-teal-100 uppercase tracking-wider mb-1">Market</p>
               <p className="text-xl font-bold">24h</p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {['all', 'confirmed', 'in_transit', 'delivered'].map((s) => (
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

          {/* Order Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div 
                key={order.order_id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-teal-300 transition-all group flex flex-col cursor-pointer p-6"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-base font-bold text-gray-900 mb-1">{order.order_number}</p>
                  <p className="text-xs text-teal-600 uppercase tracking-wider mb-3 font-semibold">Earnings: MWK {(order.courier_revenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {order.street_address}, {order.city}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Customer</span>
                    <span className="text-xs font-semibold text-gray-900">{order.customer_first_name} {order.customer_last_name}</span>
                  </div>
                  {orderType === 'available' ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); selfAssignOrder(order.order_id); }}
                      className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors"
                    >
                      Accept
                    </button>
                  ) : (
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No orders found</h3>
              <p className="text-sm text-gray-500">Try changing your filters or check the market for new orders.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
