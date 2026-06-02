'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface DashboardStats {
  totalUsers: number
  totalShops: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalShops: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      try {
        const usersRes = await fetch('https://api-doba.techgenesismw.com/api/users', { headers })
        const usersData = await usersRes.json()
        const shopsRes = await fetch('https://api-doba.techgenesismw.com/api/shops', { headers })
        const shopsData = await shopsRes.json()
        const ordersRes = await fetch('https://api-doba.techgenesismw.com/api/orders', { headers })
        const ordersData = await ordersRes.json()

        setStats({
          totalUsers: usersData.data?.length || 0,
          totalShops: shopsData.data?.length || 0,
          totalOrders: ordersData.data?.length || 0,
          totalRevenue: (ordersData.data || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchStats()
    } else if (user) {
      router.push('/dashboard')
    }
  }, [user])

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Admin Control">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', color: 'bg-blue-50 text-blue-600', trend: '+12%' },
    { label: 'Total Shops', value: stats.totalShops.toString(), icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z', color: 'bg-teal-50 text-teal-700', trend: '+5%' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z', color: 'bg-purple-50 text-purple-600', trend: '+24%' },
    { label: 'Revenue', value: `MWK ${stats.totalRevenue.toLocaleString()}`, icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-amber-50 text-amber-600', trend: '+18%' },
  ]

  return (
    <DashboardLayout role="admin" title="System Overview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
           <h1 className="text-2xl font-bold text-gray-900 mb-1">Platform Control</h1>
           <p className="text-sm text-gray-500">Central command for user management, commerce, and system health.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           {statCards.map((stat) => (
             <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-teal-300 transition-all">
                <div className="flex items-center justify-between mb-4">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                      </svg>
                   </div>
                   <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">{stat.trend}</span>
                </div>
                <div>
                   <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                   <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Recent Activity Card */}
           <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-base font-bold text-gray-900">Recent Operations</h2>
                 <button className="text-xs font-semibold text-teal-700 hover:underline">View System Logs</button>
              </div>
              <div className="space-y-4">
                 {[
                   { user: 'Banda J.', action: 'Created new shop', target: 'Central Market', time: '2m ago', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
                   { user: 'Phiri L.', action: 'Assigned courier', target: 'Order #892', time: '15m ago', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h3.375c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5V14.25m0 0V3.375c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125v10.875' },
                   { user: 'System', action: 'Payout processed', target: 'MWK 450,000', time: '1h ago', icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                   { user: 'Mwale T.', action: 'User registered', target: 'Customer Role', time: '3h ago', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' }
                 ].map((act, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={act.icon} />
                            </svg>
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-gray-900">
                               <span className="text-teal-700">{act.user}</span> {act.action}
                            </p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{act.target}</p>
                         </div>
                      </div>
                      <span className="text-xs text-gray-400">{act.time}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Quick Actions Sidebar */}
           <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-6 text-white">
              <h2 className="text-base font-bold mb-6">Management</h2>
              <div className="space-y-3">
                 {[
                   { label: 'Register Admin', href: '/admin/users/new', color: 'bg-white/10 hover:bg-white/20' },
                   { label: 'Audit Payments', href: '/admin/reports', color: 'bg-white/10 hover:bg-white/20' },
                   { label: 'System Settings', href: '/profile', color: 'bg-white hover:bg-gray-100 text-teal-700' }
                 ].map((btn, i) => (
                   <button 
                     key={i}
                     onClick={() => router.push(btn.href)}
                     className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${btn.color}`}
                   >
                      {btn.label}
                   </button>
                 ))}
              </div>
              <div className="mt-8 pt-6 border-t border-teal-600">
                 <p className="text-xs text-teal-100 uppercase tracking-wider mb-3">System Status</p>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span className="text-xs font-semibold">API Online</span>
                 </div>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span className="text-xs font-semibold">Logistics Hook Active</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
