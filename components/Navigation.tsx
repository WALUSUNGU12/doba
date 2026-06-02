'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export default function Navigation() {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const cartItemCount = getTotalItems()

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white border-b border-gray-200 shadow-sm'
          : 'bg-white/95 border-b border-gray-100'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">DOBADoba</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/marketplace" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
              Marketplace
            </Link>
            <Link href="/courier" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
              Courier
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-amber-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                {user.role === 'seller' && (
                  <Link href="/seller/dashboard" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
                    Seller Dashboard
                  </Link>
                )}
                {user.role === 'courier' && (
                  <Link href="/courier/dashboard" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
                    Courier Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
                    Admin
                  </Link>
                )}
                <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-semibold bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 space-y-1">
            {[
              { href: '/marketplace', label: 'Marketplace' },
              { href: '/courier', label: 'Courier' },
              { href: '/cart', label: `Cart${cartItemCount > 0 ? ` (${cartItemCount})` : ''}` },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-700 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <>
                {user.role === 'seller' && (
                  <Link href="/seller/dashboard" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-700 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Seller Dashboard
                  </Link>
                )}
                {user.role === 'courier' && (
                  <Link href="/courier/dashboard" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-700 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Courier Dashboard
                  </Link>
                )}
                <Link href="/profile" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-700 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={logout} className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2 px-3">
                <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-teal-700 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/auth/register" className="text-sm font-semibold bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition-colors text-center" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
