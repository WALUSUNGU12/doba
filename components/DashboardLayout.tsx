'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import SellerSidebar from './SellerSidebar'
import CourierSidebar from './CourierSidebar'
import CustomerSidebar from './CustomerSidebar'
import OperatorSidebar from './OperatorSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'admin' | 'seller' | 'courier' | 'customer' | 'operator'
  title: string
}

export default function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const getSidebar = () => {
    switch (role) {
      case 'admin': return <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      case 'seller': return <SellerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      case 'courier': return <CourierSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      case 'operator': return <OperatorSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      default: return <CustomerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {getSidebar()}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 h-14 px-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-teal-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 capitalize">{title}</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 min-h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
