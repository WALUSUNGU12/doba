'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import CourierSidebar from '@/components/CourierSidebar'

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
  customer_name: string
  customer_first_name: string
  customer_last_name: string
  customer_phone: string
  seller_name: string
  seller_first_name: string
  seller_last_name: string
  shop_name: string
  items: OrderItem[]
  total_amount: number
  status: string
  payment_status: string
  delivery_address: string
  delivery_city: string
  delivery_district: string
  shipping_fee: number
  courier_revenue: number
  route_id?: string
  route_name?: string
  estimated_delivery?: string
  created_at: string
  updated_at: string
  courier_id?: number
}

export default function CourierDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'available' | 'my-orders'>('available')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Check if user is courier
    if (user && user.role !== 'courier') {
      router.push('/dashboard')
      return
    }

    // Only load if we have a user (prevents duplicate calls during auth state changes)
    if (user && user.role === 'courier') {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

    // Clear existing orders to prevent duplicates
    setAvailableOrders([])
    setMyOrders([])

    try {
      // Load available orders - now includes confirmed orders only (ready for pickup)
      const availableResponse = await fetch('https://api-doba.techgenesismw.com/api/deliveries/available', { headers })
      if (availableResponse.ok) {
        const availableData = await availableResponse.json()
        // Deduplicate orders by order_id
        const uniqueAvailableOrders = (availableData.data?.orders || []).filter(
          (order: Order, index: number, self: Order[]) =>
            index === self.findIndex((o: Order) => o.order_id === order.order_id)
        )
        setAvailableOrders(uniqueAvailableOrders)
      } else {
        console.error('Failed to load available orders')
      }

      // Load my assigned orders
      const myOrdersResponse = await fetch('https://api-doba.techgenesismw.com/api/deliveries/my', { headers })
      if (myOrdersResponse.ok) {
        const myOrdersData = await myOrdersResponse.json()
        // Deduplicate orders by order_id
        const uniqueMyOrders = (myOrdersData.data?.orders || []).filter(
          (order: Order, index: number, self: Order[]) =>
            index === self.findIndex((o: Order) => o.order_id === order.order_id)
        )
        setMyOrders(uniqueMyOrders)
      } else {
        console.error('Failed to load my orders')
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const acceptOrder = async (orderId: number) => {
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/deliveries/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          order_id: orderId,
          estimated_delivery_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Order accepted successfully!')
        loadOrders()
      } else {
        setError(data.error || 'Failed to accept order')
      }
    } catch (error) {
      setError('Failed to accept order. Please try again.')
    }

    // Clear messages after 3 seconds
    setTimeout(() => {
      setError('')
      setSuccess('')
    }, 3000)
  }

  const completeOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to mark this order as delivered?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://api-doba.techgenesismw.com/api/deliveries/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Order marked as delivered!')
        loadOrders()
      } else {
        setError(data.error || 'Failed to complete order')
      }
    } catch (error) {
      setError('Failed to complete order. Please try again.')
    }

    // Clear messages after 3 seconds
    setTimeout(() => {
      setError('')
      setSuccess('')
    }, 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_transit': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEarnings = () => {
    return myOrders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + (order.courier_revenue || 0), 0)
  }

  const getPendingEarnings = () => {
    return myOrders
      .filter(order => order.status === 'in_transit')
      .reduce((total, order) => total + (order.courier_revenue || 0), 0)
  }

  if (!user || user.role !== 'courier') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <CourierSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <CourierSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <span className="font-bold text-gray-900">Courier</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.first_name}!</p>
              </div>
              <div className="text-right flex gap-4">
                <div className="bg-orange-50 px-4 py-2.5 rounded-lg border border-orange-200">
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Pending</p>
                  <p className="text-lg font-bold text-orange-700">MWK {getPendingEarnings().toLocaleString()}</p>
                </div>
                <div className="bg-teal-50 px-4 py-2.5 rounded-lg border border-teal-200">
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Earnings</p>
                  <p className="text-lg font-bold text-teal-700">MWK {getEarnings().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats Summary */}
        <div className="lg:hidden px-4 py-4 grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-base font-bold text-orange-700">MWK {getPendingEarnings().toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-teal-200">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Earnings</p>
            <p className="text-base font-bold text-teal-700">MWK {getEarnings().toLocaleString()}</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {success && (
            <div className="mb-4 flex items-center gap-2.5 p-3.5 rounded-lg text-sm bg-teal-50 border border-teal-200 text-teal-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2.5 p-3.5 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-[64px] lg:top-0 z-10 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all ${
                  activeTab === 'available'
                    ? 'border-teal-700 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Orders ({availableOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('my-orders')}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all ${
                  activeTab === 'my-orders'
                    ? 'border-teal-700 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Orders ({myOrders.length})
              </button>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Content area - Orders list */}
          <div className="space-y-4">
            {(activeTab === 'available' ? availableOrders : myOrders).length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No orders found</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  {activeTab === 'available' 
                    ? "Check back later for new delivery requests in your area."
                    : "You haven't accepted any orders yet. Go to the available tab to start earning!"}
                </p>
              </div>
            ) : (
              (activeTab === 'available' ? availableOrders : myOrders).map((order) => (
                <div key={`${activeTab}-${order.order_id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between md:justify-start md:gap-4 mb-2">
                          <h4 className="text-base font-bold text-gray-900">{order.order_number}</h4>
                          <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                          {order.items?.map(item => `${item.product_name} x${item.quantity}`).join(', ')}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Pickup From</p>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{order.shop_name}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Deliver To</p>
                            <p className="text-sm font-semibold text-blue-900 line-clamp-1">{order.delivery_city}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                        <div className="text-right">
                          <p className="text-xs text-teal-600 uppercase tracking-wider mb-1">Revenue</p>
                          <p className="text-lg font-bold text-gray-900">MWK {order.courier_revenue.toLocaleString()}</p>
                        </div>
                        {activeTab === 'available' ? (
                          <button
                            onClick={() => acceptOrder(order.order_id)}
                            className="px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                          >
                            Accept
                          </button>
                        ) : order.status === 'in_transit' ? (
                          <button
                            onClick={() => completeOrder(order.order_id)}
                            className="px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                          >
                            Delivered
                          </button>
                        ) : (
                          <span className="px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-semibold">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
