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
  courier_id?: number
  courier_first_name?: string
  courier_last_name?: string
  courier_phone?: string
  total_amount: number
  status: string
  payment_status: string
  payment_method: string
  created_at: string
  updated_at: string
  street_address: string
  city: string
  district: string
  estimated_delivery?: string
  notes?: string
  items?: OrderItem[]
}

export default function SellerOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user && user.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    loadOrders()
  }, [user, router])

  const loadOrders = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/orders/seller-orders', { headers })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.data?.orders || [])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status })
      })
      if (response.ok) loadOrders()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'in_transit': return 'bg-indigo-100 text-indigo-700'
      case 'out_for_delivery': return 'bg-orange-100 text-orange-700'
      case 'delivered': return 'bg-emerald-100 text-emerald-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (isLoading) {
    return (
      <DashboardLayout role="seller" title="Orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading orders...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="seller" title="Orders">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
          <p className="text-sm text-gray-500">Track customer purchases and fulfillment status</p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total</p>
             <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pending</p>
             <p className="text-2xl font-bold text-yellow-500">{orders.filter(o => o.status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active</p>
             <p className="text-2xl font-bold text-blue-500">{orders.filter(o => ['confirmed', 'in_transit', 'out_for_delivery'].includes(o.status)).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Completed</p>
             <p className="text-2xl font-bold text-teal-700">{orders.filter(o => o.status === 'delivered').length}</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {['all', 'pending', 'confirmed', 'in_transit', 'out_for_delivery', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                filter === s ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Orders Cards / Table */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-teal-200 transition-colors">
              <div className="p-5 flex flex-col lg:flex-row justify-between gap-4">
                {/* Info Column */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Number</p>
                      <h3 className="text-base font-bold text-gray-900">{order.order_number}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${order.payment_status === 'paid' ? 'bg-teal-50 text-teal-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {order.payment_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="space-y-3">
                       <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer Details</p>
                          <p className="font-semibold text-gray-900 text-sm">{order.customer_first_name} {order.customer_last_name}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {order.street_address}, {order.city}
                          </p>
                       </div>
                       
                       {order.courier_id && (
                         <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Assigned Courier</p>
                            <p className="font-semibold text-blue-900 text-sm">{order.courier_first_name} {order.courier_last_name}</p>
                            <p className="text-xs text-blue-600 mt-1">{order.courier_phone}</p>
                         </div>
                       )}
                    </div>

                    <div>
                       <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Ordered Items</p>
                       <div className="space-y-2">
                          {order.items?.map((item) => (
                            <div key={item.order_item_id} className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-semibold text-gray-900">{item.quantity}x</span>
                                  <span className="text-sm text-gray-600">{item.product_name}</span>
                               </div>
                               <span className="text-sm font-semibold text-gray-900">MWK {item.subtotal.toLocaleString()}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Summary & Actions Column */}
                <div className="lg:w-48 flex flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-4">
                   <div className="text-center lg:text-right w-full">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Total</p>
                      <p className="text-xl font-bold text-gray-900">MWK {order.total_amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   </div>
                   
                   <div className="w-full space-y-2 mt-4 lg:mt-0">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'confirmed')}
                          className="w-full py-2.5 bg-teal-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-teal-600 transition-colors"
                        >
                          Confirm Order
                        </button>
                      )}
                      <button className="w-full py-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors">
                        View Details
                      </button>
                   </div>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No orders found</h3>
              <p className="text-sm text-gray-500">There are no orders matching your current filter.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
