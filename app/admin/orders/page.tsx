'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface OrderItem {
  order_item_id: number
  product_name: string
  quantity: number
  price: number
  subtotal: number
}

interface Order {
  order_id: number
  order_number: string
  customer_first_name: string
  customer_last_name: string
  shop_name: string
  courier_first_name?: string
  courier_last_name?: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  items?: OrderItem[]
}

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    loadOrders()
  }, [user, router])

  const loadOrders = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/orders/admin', { headers })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.data?.orders || [])
      } else {
        console.error('Admin orders response not ok:', response.status)
      }
    } catch (error) {
      console.error('Error loading admin orders:', error)
    } finally {
      setIsLoading(false)
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

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setOrders(orders.map(order => 
          order.order_id === orderId ? { ...order, status: newStatus } : order
        ))
        setSuccess(`Order #${orderId} status updated to ${newStatus}`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update order status')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('Network error while updating order')
      setTimeout(() => setError(''), 3000)
    }
  }

  const assignCourier = async (orderId: number, courierId: number) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ courier_id: courierId })
      })
      
      if (response.ok) {
        setOrders(orders.map(order => 
          order.order_id === orderId ? { ...order, courier_id: courierId } : order
        ))
        setSuccess(`Courier assigned to Order #${orderId}`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to assign courier')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error assigning courier:', error)
      setError('Network error while assigning courier')
      setTimeout(() => setError(''), 3000)
    }
  }

  const cancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      })
      
      if (response.ok) {
        setOrders(orders.filter(order => order.order_id !== orderId))
        setSuccess(`Order #${orderId} cancelled successfully`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to cancel order')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      setError('Network error while cancelling order')
      setTimeout(() => setError(''), 3000)
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const getAvailableStatuses = (currentStatus: string) => {
    const allStatuses = ['pending', 'confirmed', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled']
    return allStatuses.filter(status => status !== currentStatus)
  }

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Order Control">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading orders...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin" title="Global Logistics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Global Logistics</h1>
          <p className="text-sm text-gray-500">System-wide order surveillance and fulfillment tracking</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-teal-700">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Volume</p>
              <p className="text-xl font-bold text-gray-900">{orders.length}</p>
           </div>
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Pending Sync</p>
              <p className="text-xl font-bold text-amber-600">{orders.filter(o => o.status === 'pending').length}</p>
           </div>
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">In Transit / OFD</p>
              <p className="text-xl font-bold text-blue-600">{orders.filter(o => o.status === 'in_transit' || o.status === 'out_for_delivery').length}</p>
           </div>
           <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-4 text-white">
              <p className="text-xs text-teal-100 uppercase tracking-wider mb-1">Total Value</p>
              <p className="text-lg font-bold truncate">MWK {orders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString()}</p>
           </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {['all', 'pending', 'confirmed', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
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

        {/* Orders Master List */}
        <div className="space-y-4">
           {filteredOrders.map((order) => (
             <div key={order.order_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:border-teal-300 transition-all">
                <div className="p-6 flex flex-col lg:flex-row justify-between gap-6">
                   <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                         <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.75c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                           </svg>
                         </div>
                         <div>
                            <h3 className="text-base font-bold text-gray-900">{order.order_number}</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                         </div>
                         <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)} ml-auto lg:ml-4`}>
                            {order.status.replace('_', ' ')}
                         </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                         <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                            <p className="text-sm font-semibold text-gray-900">{order.customer_first_name} {order.customer_last_name}</p>
                         </div>
                         <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Shop Outlet</p>
                            <p className="text-sm font-semibold text-teal-700">{order.shop_name}</p>
                         </div>
                         <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Courier Service</p>
                            <p className="text-sm font-semibold text-blue-600">{order.courier_first_name ? `${order.courier_first_name} ${order.courier_last_name}` : 'Unassigned'}</p>
                         </div>
                      </div>
                   </div>

                   <div className="lg:w-48 flex flex-col items-center lg:items-end justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Grand Total</p>
                      <p className="text-xl font-bold text-gray-900">MWK {order.total_amount.toLocaleString()}</p>
                      <span className={`mt-1 text-xs font-semibold uppercase tracking-wider ${order.payment_status === 'paid' ? 'text-teal-700' : 'text-amber-600'}`}>
                         Payment {order.payment_status}
                      </span>
                       
                      {/* Order Control Actions */}
                      <div className="mt-4 space-y-2 w-full">
                        <button 
                          onClick={() => viewOrderDetails(order)}
                          className="w-full py-2 bg-gray-50 text-gray-900 hover:bg-gray-100 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors"
                        >
                           View Details
                        </button>
                        
                        {/* Status Update Dropdown */}
                        <div className="relative">
                          <button 
                            className="w-full py-2 bg-teal-700 text-white hover:bg-teal-800 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-between"
                            onClick={() => {
                              const dropdown = document.getElementById(`status-dropdown-${order.order_id}`)
                              if (dropdown) {
                                dropdown.classList.toggle('hidden')
                              }
                            }}
                          >
                           Update Status
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                          </button>
                          <div 
                            id={`status-dropdown-${order.order_id}`}
                            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-sm hidden z-50"
                          >
                            {getAvailableStatuses(order.status).map(status => (
                              <button
                                key={status}
                                onClick={() => {
                                  updateOrderStatus(order.order_id, status)
                                  document.getElementById(`status-dropdown-${order.order_id}`)?.classList.add('hidden')
                                }}
                                className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                              >
                                {status.replace('_', ' ').toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => viewOrderDetails(order)}
                            className="flex-1 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors"
                          >
                             Assign Courier
                          </button>
                          <button 
                            onClick={() => cancelOrder(order.order_id)}
                            disabled={order.status === 'cancelled' || order.status === 'delivered'}
                            className={`flex-1 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors ${
                              order.status === 'cancelled' || order.status === 'delivered'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                             Cancel
                          </button>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
           ))}

           {filteredOrders.length === 0 && (
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">No Orders Tracked</h3>
                <p className="text-sm text-gray-500">System reports zero matches for the selected status.</p>
             </div>
           )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
              <button 
                onClick={() => setShowOrderModal(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Order #{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-500">Detailed order information and management controls</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Shop</p>
                    <p className="text-sm font-semibold text-teal-700">{selectedOrder.shop_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Courier</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {selectedOrder.courier_first_name ? `${selectedOrder.courier_first_name} ${selectedOrder.courier_last_name}` : 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Status</p>
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Payment Status</p>
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      selectedOrder.payment_status === 'paid' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {selectedOrder.payment_status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">MWK {selectedOrder.total_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.order_item_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.75c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900">{item.product_name}</h4>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">MWK {item.subtotal.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
               <div className="flex flex-wrap gap-2.5 border-t border-gray-100 pt-6">
                 <button
                   onClick={() => {
                     updateOrderStatus(selectedOrder.order_id, 'confirmed')
                     setShowOrderModal(false)
                   }}
                   disabled={selectedOrder.status === 'confirmed' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                   className="flex-1 min-w-[120px] py-2.5 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors"
                 >
                   Confirm Order
                 </button>
                 <button
                   onClick={() => {
                     updateOrderStatus(selectedOrder.order_id, 'in_transit')
                     setShowOrderModal(false)
                   }}
                   disabled={selectedOrder.status === 'in_transit' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled' || selectedOrder.status === 'pending'}
                   className="flex-1 min-w-[120px] py-2.5 bg-teal-700 text-white hover:bg-teal-800 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors"
                 >
                   Mark In Transit
                 </button>
                 <button
                   onClick={() => {
                     updateOrderStatus(selectedOrder.order_id, 'out_for_delivery')
                     setShowOrderModal(false)
                   }}
                   disabled={selectedOrder.status === 'out_for_delivery' || selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled' || selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed'}
                   className="flex-1 min-w-[120px] py-2.5 bg-indigo-700 text-white hover:bg-indigo-800 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors"
                 >
                   Mark Out for Delivery
                 </button>
                 <button
                   onClick={() => {
                     updateOrderStatus(selectedOrder.order_id, 'delivered')
                     setShowOrderModal(false)
                   }}
                   disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                   className="flex-1 min-w-[120px] py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors"
                 >
                   Mark Delivered
                 </button>
                 <button
                   onClick={() => {
                     cancelOrder(selectedOrder.order_id)
                     setShowOrderModal(false)
                   }}
                   disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                   className="flex-1 min-w-[120px] py-2.5 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors"
                 >
                   Cancel Order
                 </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  )
}
