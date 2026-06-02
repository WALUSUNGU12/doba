'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'

interface Order {
  order_id: number
  order_number: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
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

const quickActions = [
  {
    href: '/dashboard/marketplace',
    label: 'Browse Marketplace',
    desc: 'Shop from local sellers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
  },
  {
    href: '/orders',
    label: 'Track Orders',
    desc: 'Monitor your deliveries',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'My Profile',
    desc: 'Manage your account',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
]

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [assignedTerminal, setAssignedTerminal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (user.role === 'courier') { router.push('/courier/dashboard'); return }
    if (user.role === 'seller') { router.push('/seller/dashboard'); return }
    if (user.role === 'admin') { router.push('/admin/dashboard'); return }
    if (user.role === 'operator') { router.push('/dashboard/terminal-operator'); return }
    loadDashboardData()
  }, [user, isAuthLoading, router])

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    try {
      const res = await fetch('https://api-doba.techgenesismw.com/api/orders/my-orders', { headers })
      if (res.ok) {
        const data = await res.json()
        setRecentOrders(data.data?.orders?.slice(0, 5) || [])
      }

      // Fetch assigned active terminal
      const termRes = await fetch('https://api-doba.techgenesismw.com/api/terminals/my-terminal', { headers })
      if (termRes.ok) {
        const termData = await termRes.json()
        if (termData.success && termData.data) {
          setAssignedTerminal(termData.data)
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <DashboardLayout role="customer" title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-7 h-7 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const totalOrders = recentOrders.length
  const pendingOrders = recentOrders.filter(o => o.status === 'pending').length
  const deliveredOrders = recentOrders.filter(o => o.status === 'delivered').length

  return (
    <DashboardLayout role="customer" title="Dashboard">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Terminal Operator Banner */}
        {assignedTerminal && (
          <div className="mb-8 p-6 bg-gradient-to-r from-teal-800 to-emerald-800 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            {/* Background design elements */}
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-6 translate-y-6 transition-transform group-hover:scale-110 duration-500">
              <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 8H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 10h-2v-2h2v2zm0-4h-2V9h2v5z" />
              </svg>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/50 border border-teal-500/30 text-teal-200 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Terminal Operator Active
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Supervise {assignedTerminal.name}
                </h2>
                <p className="text-teal-100 text-sm max-w-xl">
                  You are the assigned supervisor for this logistics terminal. Click to access the Operator Dashboard where you can scan, manage collections, and handle parcel redemptions.
                </p>
              </div>
              <Link 
                href="/dashboard/terminal-operator"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-900 font-extrabold text-sm px-6 py-3.5 rounded-2xl hover:bg-teal-50 active:scale-95 transition-all shadow-md flex-shrink-0"
              >
                Go to Operator Portal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your account.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: totalOrders, color: 'text-gray-900' },
            { label: 'Pending', value: pendingOrders, color: 'text-amber-600' },
            { label: 'Delivered', value: deliveredOrders, color: 'text-teal-700' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-200 hover:shadow-sm transition-all group"
            >
              <div className="w-9 h-9 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center mb-3 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                {action.icon}
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">{action.label}</p>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/orders" className="text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No orders yet</p>
              <Link href="/dashboard/marketplace" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors">
                Start shopping
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div key={order.order_id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-gray-900">MWK {order.total_amount.toLocaleString()}</p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
