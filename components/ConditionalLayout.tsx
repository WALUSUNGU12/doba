'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isSellerRoute = pathname?.startsWith('/seller')
  const isCourierRoute = pathname?.startsWith('/courier')
  const isCustomerSidebarRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/orders') || pathname?.startsWith('/payments') || pathname?.startsWith('/profile')

  if (isAdminRoute || isSellerRoute || isCourierRoute || isCustomerSidebarRoute) {
    // Pages with sidebar have their own layout, no nav/footer
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}
