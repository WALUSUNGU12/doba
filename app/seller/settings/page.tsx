'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import SellerSidebar from '@/components/SellerSidebar'

export default function SellerSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    shop_notifications: true,
    auto_accept_orders: false,
    delivery_radius: 10
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user && user.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    setIsLoading(false)
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Settings updated successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <SellerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading settings...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Manage your seller profile and business preferences</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Control Center</h1>
          <p className="text-sm text-gray-500">Manage your seller profile and business preferences</p>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-700">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
           {/* Profile Section */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                 <div className="w-12 h-12 bg-teal-700 rounded-lg flex items-center justify-center text-lg font-bold text-white">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-gray-900">Personal Identity</h2>
                    <p className="text-sm text-gray-500">Update your public information</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input 
                      type="text" 
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                 </div>
                 <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Business Contact</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                 </div>
              </div>
           </div>

           {/* Business Preferences */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Business Workflow</h2>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                       <p className="font-semibold text-gray-900">Push Notifications</p>
                       <p className="text-xs text-gray-500">Receive alerts for new orders and messages</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, shop_notifications: !formData.shop_notifications})}
                      className={`w-11 h-6 rounded-full transition-all relative ${formData.shop_notifications ? 'bg-teal-700' : 'bg-gray-300'}`}
                    >
                       <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${formData.shop_notifications ? 'left-6' : 'left-0.5'}`}></div>
                    </button>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                       <p className="font-semibold text-gray-900">Auto-Accept Orders</p>
                       <p className="text-xs text-gray-500">Automatically confirm orders upon placement</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, auto_accept_orders: !formData.auto_accept_orders})}
                      className={`w-11 h-6 rounded-full transition-all relative ${formData.auto_accept_orders ? 'bg-teal-700' : 'bg-gray-300'}`}
                    >
                       <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${formData.auto_accept_orders ? 'left-6' : 'left-0.5'}`}></div>
                    </button>
                 </div>

                 <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Standard Delivery Radius (KM)</p>
                    <input 
                       type="range" 
                       min="1" 
                       max="50" 
                       value={formData.delivery_radius}
                       onChange={(e) => setFormData({...formData, delivery_radius: parseInt(e.target.value)})}
                       className="w-full accent-teal-700" 
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-900">
                       <span>1 KM</span>
                       <span className="text-teal-700 font-semibold">{formData.delivery_radius} KM</span>
                       <span>50 KM</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Security / Critical Actions */}
           <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h2 className="text-lg font-bold text-red-900 mb-4">Security & Account</h2>
              <div className="flex flex-col md:flex-row gap-3">
                 <button type="button" className="flex-1 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
                    Change Password
                 </button>
                 <button type="button" className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                    Deactivate Shop
                 </button>
              </div>
           </div>

           <div className="flex justify-end">
              <button 
                type="submit"
                className="px-6 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
              >
                 Save All Changes
              </button>
           </div>
        </form>
        </div>
      </div>
    </div>
  )
}
