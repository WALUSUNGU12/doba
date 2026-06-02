'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function SellerReportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    setIsLoading(false)
  }, [user, router])

  const productData = [
    { name: 'Smartphone X', sales: 124, revenue: '25.8M', trend: 'up' },
    { name: 'Wireless Buds', sales: 89, revenue: '4.2M', trend: 'up' },
    { name: 'Laptop Pro', sales: 32, revenue: '48.5M', trend: 'down' },
    { name: 'Power Bank', sales: 156, revenue: '3.1M', trend: 'up' }
  ]

  if (isLoading) {
    return (
      <DashboardLayout role="seller" title="Analytics">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading reports...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="seller" title="Analytics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Business Insights</h1>
          <p className="text-sm text-gray-500">Performance metrics and growth analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">MWK 1.2M</p>
              <p className="text-xs text-teal-700 mt-2">↑ 12.5% vs last month</p>
           </div>
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">48</p>
              <p className="text-xs text-blue-500 mt-2">87% completion rate</p>
           </div>
           <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-5">
              <p className="text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1">Top Shop</p>
              <p className="text-lg font-bold text-white">Main Street Retail</p>
              <p className="text-xs text-teal-200 mt-2">Best Seller</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-gray-900">Sales Overview</h2>
                 <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                    <option>Year to Date</option>
                 </select>
              </div>
              <div className="h-48 flex items-end justify-between gap-2">
                 {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-teal-50 rounded-t-lg relative group cursor-pointer" style={{ height: `${h}%` }}>
                         <div className="absolute inset-0 bg-teal-700 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-300 rounded-t-lg"></div>
                      </div>
                      <span className="text-xs text-gray-400">Day {i+1}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Product Performance</h2>
              <div className="space-y-4">
                 {productData.map((p, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                         </div>
                         <div>
                            <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.sales} Units Sold</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="font-semibold text-gray-900 text-sm">MWK {p.revenue}</p>
                         <p className={`text-xs font-semibold ${p.trend === 'up' ? 'text-teal-700' : 'text-red-500'}`}>
                            {p.trend === 'up' ? '↑ Rising' : '↓ Dropping'}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Customer Insights</h2>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">New Customers</p>
                    <p className="text-xl font-bold text-gray-900">+142</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Returning</p>
                    <p className="text-xl font-bold text-teal-700">68%</p>
                 </div>
              </div>
              <div className="mt-6 p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                    ))}
                 </div>
                 <p className="text-xs text-gray-500">Top regions: Mzuzu, Lilongwe</p>
              </div>
           </div>

           <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-6 relative overflow-hidden">
              <h2 className="text-lg font-bold text-white mb-4">Inventory Health</h2>
              <p className="text-teal-100 text-sm mb-6">System analysis indicates your stock levels are optimal for the current demand cycle.</p>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-xs text-teal-100 uppercase tracking-wider">Stock Level</span>
                       <span className="text-xs text-white font-semibold">85% Capacity</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                       <div className="bg-white h-full w-[85%]"></div>
                    </div>
                 </div>
                 <button className="w-full py-2.5 bg-white text-teal-700 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-teal-50 transition-colors">
                    Generate Full Report (PDF)
                 </button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
