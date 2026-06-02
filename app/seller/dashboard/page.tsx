'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import SellerSidebar from '@/components/SellerSidebar'

interface Shop {
  shop_id: number
  shop_name: string
  description: string
  category: string
  address: string
  phone: string
  email: string
  is_active: boolean
  created_at: string
}

interface Product {
  product_id: number
  shop_id: number
  product_name: string
  description: string
  price: number
  category: string
  stock_quantity: number
  min_stock_level: number
  image_urls: string[]
  is_active: boolean
  created_at: string
}

interface Order {
  order_id: number
  order_number: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  notes?: string
  items?: Array<{
    product_id: number
    product_name: string
    quantity: number
    price: number
    subtotal: number
  }>
}

export default function SellerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [shops, setShops] = useState<Shop[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview')

  useEffect(() => {
    // Check if user is seller
    if (user && user.role !== 'seller') {
      router.push('/dashboard')
      return
    }

    loadDashboardData()
  }, [user, router])

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

    try {
      // Load only this seller's shops
      const shopsResponse = await fetch('https://api-doba.techgenesismw.com/api/shops/my-shops', { headers })
      if (shopsResponse.ok) {
        const shopsData = await shopsResponse.json()
        const sellerShops = shopsData.data || []
        setShops(sellerShops)

        // Load products only for this seller's shops
        if (sellerShops.length > 0) {
          const shopId = sellerShops[0].shop_id
          const productsResponse = await fetch(`https://api-doba.techgenesismw.com/api/products?shop_id=${shopId}`)
          if (productsResponse.ok) {
            const productsData = await productsResponse.json()
            setProducts(productsData.data || [])
          }
        }
      }

      const ordersResponse = await fetch('https://api-doba.techgenesismw.com/api/orders/seller-orders', { headers })
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.data?.orders || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-purple-100 text-purple-800'
      case 'ready_for_pickup': return 'bg-green-100 text-green-800'
      case 'out_for_delivery': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLowStockProducts = () => {
    return products.filter(product => product.stock_quantity <= product.min_stock_level)
  }

  const getTotalRevenue = () => {
    const total = orders
      .reduce((total, order) => {
        // Calculate revenue from items only (excluding shipping)
        const itemsTotal = order.items?.reduce((sum, item) => sum + parseFloat(String(item.subtotal || 0)), 0) || 0
        return total + itemsTotal
      }, 0)
    return isNaN(total) ? 0 : total
  }

  if (!user || user.role !== 'seller') {
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
        <SellerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
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
      <SellerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-gray-900">Seller</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.first_name}! Manage your shop and track sales.</p>
              </div>
              <button
                onClick={() => router.push('/seller/products/new')}
                className="px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Product
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab content */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">{getLowStockProducts().length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Revenue</p>
                <p className="text-2xl font-bold text-teal-700">MWK {getTotalRevenue().toLocaleString()}</p>
              </div>
            </div>

            {/* Shop Card */}
            {shops.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {shops[0].shop_name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-bold text-gray-900">{shops[0].shop_name}</h3>
                      <p className="text-sm text-gray-500">{shops[0].category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      shops[0].is_active ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {shops[0].is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders Table - Make it scrollable on mobile */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900">{order.order_number}</p>
                          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900">MWK {order.total_amount.toLocaleString()}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-gray-500 text-sm">No orders yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
