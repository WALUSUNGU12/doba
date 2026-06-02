'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function AdminReportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    setIsLoading(false)
  }, [user, router])

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Platform Analytics">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading reports...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin" title="Platform Analytics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Network Intelligence</h1>
          <p className="text-sm text-gray-500">Global platform performance and ecosystem growth metrics</p>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden group">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Active Ecosystem</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">1,248</p>
              <div className="mt-3 flex items-center text-blue-600 font-semibold text-xs uppercase tracking-wider">
                 <span>↑ 8.4%</span>
                 <span className="ml-2 text-gray-400">Total Users</span>
              </div>
           </div>
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden group">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Marketplace GMV</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">MWK 14.5M</p>
              <div className="mt-3 flex items-center text-teal-700 font-semibold text-xs uppercase tracking-wider">
                 <span>↑ 15.2%</span>
                 <span className="ml-2 text-gray-400">Gross Volume</span>
              </div>
           </div>
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden group">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Logistics Performance</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">94.2%</p>
              <div className="mt-3 flex items-center text-purple-600 font-semibold text-xs uppercase tracking-wider">
                 <span>4.8/5</span>
                 <span className="ml-2 text-gray-400">Delivery Satisfaction</span>
              </div>
           </div>
           <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-6 text-white relative overflow-hidden">
              <p className="text-xs text-teal-100 uppercase tracking-wider mb-2">Merchant Density</p>
              <p className="text-2xl font-bold tracking-tight">84</p>
              <div className="mt-3 flex items-center text-white font-semibold text-xs uppercase tracking-wider">
                 <span>Active Shops</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Revenue Growth Chart */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-base font-bold text-gray-900">Revenue Growth</h2>
                 <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider">W</button>
                    <button className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold uppercase tracking-wider">M</button>
                 </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-2 px-4">
                 {[30, 45, 25, 60, 40, 85, 55, 70, 95, 65, 80, 50].map((h, i) => (
                   <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                      <div className="w-full bg-teal-50 rounded-t-lg group-hover:bg-teal-100 transition-all duration-500" style={{ height: `${h}%` }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            MWK {h}0k
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="mt-4 flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">
                 <span>Jan</span>
                 <span>Dec</span>
              </div>
           </div>

           {/* Regional Activity */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-6">Regional Activity</h2>
              <div className="space-y-4">
                 {[
                   { region: 'Mzuzu City', share: 45, color: 'bg-teal-700' },
                   { region: 'Lilongwe', share: 32, color: 'bg-blue-600' },
                   { region: 'Blantyre', share: 18, color: 'bg-purple-600' },
                   { region: 'Other', share: 5, color: 'bg-gray-300' }
                 ].map((r, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center font-semibold text-xs uppercase tracking-wider">
                         <span className="text-gray-900">{r.region}</span>
                         <span className="text-gray-400">{r.share}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                         <div className={`${r.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${r.share}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Top Merchants */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-6">Top Performing Outlets</h2>
              <div className="space-y-4">
                 {[
                   { name: 'Mzuzu Electronics', category: 'Tech', revenue: '4.8M', rank: 1 },
                   { name: 'Lakeside Fashion', category: 'Clothing', revenue: '2.5M', rank: 2 },
                   { name: 'Northern Groceries', category: 'Food', revenue: '1.9M', rank: 3 }
                 ].map((m, i) => (
                   <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-teal-700 text-white rounded-lg flex items-center justify-center font-semibold">
                            #{m.rank}
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{m.category}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-semibold text-gray-900">MWK {m.revenue}</p>
                         <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Performance Peak</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* System Health / Logistics Summary */}
           <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-6 text-white relative overflow-hidden">
              <h2 className="text-base font-bold mb-6 relative">System Integrity Audit</h2>
              <div className="grid grid-cols-2 gap-4 relative">
                 <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-xs text-gray-200 uppercase tracking-wider mb-1">Response Time</p>
                    <p className="text-xl font-bold">124ms</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-xs text-gray-200 uppercase tracking-wider mb-1">Success Rate</p>
                    <p className="text-xl font-bold text-teal-100">99.9%</p>
                 </div>
              </div>

              <div className="mt-6 p-4 border border-white/20 rounded-lg relative">
                 <p className="text-xs text-gray-200 uppercase tracking-wider mb-3">Logistics Health</p>
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-100">Fleet Utilization</span>
                    <span className="text-xs font-semibold text-teal-100">82%</span>
                 </div>
                 <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[82%]"></div>
                 </div>
              </div>

              <button className="w-full py-2.5 bg-white text-teal-700 rounded-lg font-semibold text-xs uppercase tracking-wider mt-6 hover:bg-gray-100 transition-colors shadow-sm relative">
                 Generate Master Audit Report (PDF)
              </button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
