'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface OrderItem {
  product_name: string
  quantity: number
  price: number
  subtotal: number
}

interface TrackingResult {
  order_number: string
  status: string
  payment_status: string
  created_at: string
  updated_at: string
  total_amount: number
  items: OrderItem[]
  shipping_address: { street: string; city: string; district: string } | null
  estimated_delivery: string | null
}

const statusSteps = ['pending', 'confirmed', 'in_transit', 'out_for_delivery', 'delivered']

const statusLabels: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
}

const statusDescriptions: Record<string, string> = {
  pending: 'Your order has been received',
  confirmed: 'Seller has confirmed your order',
  in_transit: 'Package is on the way',
  out_for_delivery: 'Courier is delivering today',
  delivered: 'Package delivered successfully',
}

function getStatusStep(status: string) {
  if (status === 'assigned' || status === 'processing') return 1
  if (status === 'picked_up' || status === 'shipped') return 2
  if (status === 'collected') return 4
  const idx = statusSteps.indexOf(status)
  return idx === -1 ? 0 : idx
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    delivered: 'bg-teal-50 text-teal-700 border-teal-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    in_transit: 'bg-blue-50 text-blue-700 border-blue-200',
    out_for_delivery: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  const cls = colors[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  )
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState('')

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) { setError('Please enter an order number'); return }
    setIsLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/orders/track/${orderNumber.trim()}`)
      const data = await response.json()
      if (response.ok) {
        setResult(data.data)
      } else {
        setError(data.message || 'Order not found. Please check your order number.')
      }
    } catch {
      setError('Failed to track order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentStep = result ? getStatusStep(result.status) : -1

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-2">Order Tracking</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Track Your Order</h1>
            <p className="text-sm text-gray-500">Enter your order number to check the delivery status</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <form onSubmit={trackOrder} noValidate>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Order number
              </label>
              <div className="flex gap-2">
                <input
                  id="orderNumber"
                  type="text"
                  value={orderNumber}
                  onChange={e => { setOrderNumber(e.target.value); if (error) setError('') }}
                  placeholder="e.g. DOBA-1234567890-ABC12"
                  className={`flex-1 px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  )}
                  {isLoading ? 'Tracking...' : 'Track'}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </p>
              )}
            </form>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-5">
              {/* Order summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Order number</p>
                    <p className="text-lg font-bold text-gray-900">{result.order_number}</p>
                  </div>
                  <StatusBadge status={result.status} />
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 transition-all duration-700"
                      style={{ width: `${Math.min(((currentStep + 1) / statusSteps.length) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Ordered</span>
                  <span>Confirmed</span>
                  <span>In Transit</span>
                  <span>Out for Delivery</span>
                  <span>Delivered</span>
                </div>
              </div>

              {/* Order details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Details</h2>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Order date</p>
                    <p className="text-sm font-medium text-gray-800">{new Date(result.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Last updated</p>
                    <p className="text-sm font-medium text-gray-800">{new Date(result.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Payment</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      result.payment_status === 'paid' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {result.payment_status}
                    </span>
                  </div>
                  {result.estimated_delivery && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Est. delivery</p>
                      <p className="text-sm font-medium text-teal-700">{new Date(result.estimated_delivery).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Items */}
                {result.items?.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Items</p>
                    <div className="space-y-2">
                      {result.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-800">{item.product_name}</span>
                            <span className="text-xs text-gray-400">x{item.quantity}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">MWK {item.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm font-semibold text-gray-900">Total</span>
                      <span className="text-base font-bold text-teal-700">MWK {result.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping address */}
              {result.shipping_address && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    Delivery Address
                  </h2>
                  <p className="text-sm text-gray-800">{result.shipping_address.street}</p>
                  <p className="text-sm text-gray-500">{result.shipping_address.city}, {result.shipping_address.district}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-5">Order Timeline</h2>
                <div className="space-y-4">
                  {statusSteps.map((step, i) => {
                    const isCompleted = currentStep >= i
                    const isCurrent = result.status === step
                    return (
                      <div key={step} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          isCompleted ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-2 ring-teal-500 ring-offset-2' : ''}`}>
                          {isCompleted ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            <span className="text-xs font-semibold">{i + 1}</span>
                          )}
                        </div>
                        <div className={isCompleted ? '' : 'opacity-40'}>
                          <p className={`text-sm font-medium ${isCurrent ? 'text-teal-700' : 'text-gray-800'}`}>
                            {statusLabels[step]}
                          </p>
                          <p className="text-xs text-gray-400">{statusDescriptions[step]}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Help */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Need help?</h3>
                <p className="text-xs text-gray-500 mb-3">Contact our support team for assistance with your order.</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <a href="mailto:support@dobadoba.com" className="text-teal-700 hover:text-teal-800 font-medium transition-colors">
                    support@dobadoba.com
                  </a>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-600">+265 991 234 567</span>
                </div>
              </div>
            </div>
          )}

          {/* Back links */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/marketplace" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:border-teal-300 hover:text-teal-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              Back to Marketplace
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:border-teal-300 hover:text-teal-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
