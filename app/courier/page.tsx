'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: OrderItem[]
  totalAmount: number
  shippingFee?: number
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered'
  courierId?: number
  courierName?: string
  courierPhone?: string
  estimatedDelivery: string
  createdAt: string
  pickupAddress: string
  sellerPhone?: string
  deliveryAddress: string
  routeId?: string
  routeName?: string
  specialInstructions?: string
  trackingHistory: Array<{ status: string; timestamp: string; location?: string; notes?: string }>
}

interface DeliveryRoute {
  route_id: number
  name: string
  origin: string
  destination: string
  baseFee: number
  courier_name?: string
  weightTiers: { minWeight: number; maxWeight: number; fee: number }[]
}

interface Terminal {
  terminal_id: number
  name: string
  code: string
  address: string
  city: string
  district?: string
  phone?: string
  operatingHours?: any
}

function getStatusStep(status: string) {
  const steps = ['pending', 'confirmed', 'in_transit', 'out_for_delivery', 'delivered']
  if (status === 'assigned' || status === 'processing') return 1
  if (status === 'picked_up' || status === 'shipped') return 2
  if (status === 'collected') return 4
  const idx = steps.indexOf(status)
  return idx === -1 ? 0 : idx
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    in_transit: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
    delivered: 'bg-teal-50 text-teal-700 border-teal-200',
  }
  const cls = map[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  )
}

export default function CourierPage() {
  const [orderId, setOrderId] = useState('')
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [routes, setRoutes] = useState<DeliveryRoute[]>([])
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true)
  const [isLoadingTerminals, setIsLoadingTerminals] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null)

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await fetch('https://api-doba.techgenesismw.com/api/courier/routes/public')
        if (response.ok) {
          const data = await response.json()
          setRoutes(data.data || [])
        }
      } catch (error) {
        console.error('Error loading routes:', error)
      } finally {
        setIsLoadingRoutes(false)
      }
    }

    const loadTerminals = async () => {
      try {
        const response = await fetch('https://api-doba.techgenesismw.com/api/terminals/public')
        if (response.ok) {
          const data = await response.json()
          setTerminals(data.data || [])
        }
      } catch (error) {
        console.error('Error loading terminals:', error)
      } finally {
        setIsLoadingTerminals(false)
      }
    }

    loadRoutes()
    loadTerminals()
  }, [])

  const handleTrackOrder = async () => {
    if (!orderId.trim()) { setError('Please enter an order ID'); return }
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/orders/track/${orderId.trim()}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const order = data.data
          setTrackedOrder({
            id: order.order_id?.toString() || order.order_number,
            orderNumber: order.order_number,
            customerName: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
            customerPhone: order.customer?.phone || order.notes?.match(/Phone:\s*([^\s,]+)/)?.[1] || 'N/A',
            customerAddress: order.shipping_address ? `${order.shipping_address.street || ''}, ${order.shipping_address.city || ''}` : 'N/A',
            items: order.items?.map((item: any) => ({ name: item.product_name, quantity: item.quantity, price: item.price })) || [],
            totalAmount: order.total_amount || 0,
            shippingFee: order.notes?.match(/Shipping:\s*MWK\s*(\d+)/)?.[1] || 0,
            routeId: order.route_id,
            routeName: order.route_name,
            status: order.status as any,
            courierId: order.courier ? 1 : undefined,
            courierName: order.courier ? `${order.courier.first_name} ${order.courier.last_name}` : undefined,
            courierPhone: order.courier?.phone,
            estimatedDelivery: order.estimated_delivery || order.updated_at,
            createdAt: order.created_at,
            pickupAddress: order.seller ? `${order.seller.first_name} ${order.seller.last_name}'s Shop` : 'Seller Location',
            sellerPhone: order.seller?.phone,
            specialInstructions: order.notes?.split(', Operator:')[0]?.split('Route: ')[1]?.split(', ')[1] || '',
            deliveryAddress: order.shipping_address ? `${order.shipping_address.street}, ${order.shipping_address.city}` : 'N/A',
            trackingHistory: [
              { status: 'Order placed', timestamp: order.created_at, location: 'Online' },
              { status: order.status, timestamp: order.updated_at, location: order.shipping_address?.city },
            ],
          })
          setShowDetails(true)
          setError('')
        } else {
          setError('Order not found. Please check your order ID and try again.')
          setTrackedOrder(null)
          setShowDetails(false)
        }
      } else {
        setError('Order not found. Please check your order ID and try again.')
        setTrackedOrder(null)
        setShowDetails(false)
      }
    } catch (error) {
      console.error('Error tracking order:', error)
      setError('Failed to track order. Please try again.')
      setTrackedOrder(null)
      setShowDetails(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-2">Order Tracking</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Track Your Order</h1>
            <p className="text-sm text-gray-500">Enter your order ID to track your package and get real-time delivery updates</p>

            {/* Search form */}
            <div className="mt-6 max-w-md">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g., DOB-2024-001)"
                  value={orderId}
                  onChange={e => { setOrderId(e.target.value); if (error) setError('') }}
                  onKeyPress={e => e.key === 'Enter' && handleTrackOrder()}
                  className={`flex-1 px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <button
                  onClick={handleTrackOrder}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
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
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Routes */}
          {!trackedOrder && (
            <>
              {/* Routes */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                  Available Delivery Routes & Fees
                </h3>
                {isLoadingRoutes ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading routes...</p>
                  </div>
                ) : routes.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">No delivery routes available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {routes.map(route => (
                      <div key={route.route_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-teal-300 transition-colors bg-gray-50">
                        <div>
                          <h4 className="font-semibold text-gray-900">{route.name}</h4>
                          <p className="text-sm text-teal-700 font-medium mt-0.5">Base Fee: MWK {Number(route.baseFee).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => setSelectedRoute(route)}
                          className="px-3 py-1.5 text-xs font-semibold text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terminal Stations */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  Our Logistics Terminal Stations (Collection & Drop-off)
                </h3>
                {isLoadingTerminals ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading terminal stations...</p>
                  </div>
                ) : terminals.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">No active terminal stations available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {terminals.map(terminal => (
                      <div key={terminal.terminal_id} className="flex flex-col justify-between p-5 border border-gray-200 rounded-xl hover:border-teal-300 transition-colors bg-gray-50">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900 text-sm sm:text-base">{terminal.name}</h4>
                            <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                              Active Station
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Station Code: {terminal.code}</p>
                          
                          <div className="space-y-2 mt-3 text-xs text-gray-600 font-medium">
                            <div className="flex items-start gap-1.5">
                              <svg className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              <p className="leading-relaxed">
                                {terminal.address}, {terminal.city}{terminal.district ? ` (${terminal.district})` : ''}
                              </p>
                            </div>

                            {terminal.phone && (
                              <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                                <span>{terminal.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {terminal.operatingHours && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1.5">Operating Hours</p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-500 font-semibold">
                              <div>Mon-Fri: <span className="font-semibold text-gray-700">{terminal.operatingHours.weekday || '08:00 - 17:00'}</span></div>
                              <div>Saturday: <span className="font-semibold text-gray-700">{terminal.operatingHours.saturday || '09:00 - 13:00'}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Route modal */}
          {selectedRoute && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-lg w-full overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-teal-700 text-white">
                  <div>
                    <h3 className="text-lg font-bold">{selectedRoute.name}</h3>
                    <p className="text-teal-100 text-sm">Complete Delivery Information</p>
                  </div>
                  <button onClick={() => setSelectedRoute(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Origin</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedRoute.origin}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Destination</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedRoute.destination}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Weight-Based Pricing</h4>
                      <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-md font-semibold">
                        Base: MWK {Number(selectedRoute.baseFee).toLocaleString()}
                      </span>
                    </div>
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-600 font-semibold text-xs">Weight Range</th>
                            <th className="px-3 py-2 text-right text-gray-600 font-semibold text-xs">Total Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedRoute.weightTiers.map((tier, idx) => (
                            <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                              <td className="px-3 py-2 text-gray-700">{tier.minWeight} - {tier.maxWeight} kg</td>
                              <td className="px-3 py-2 text-right font-semibold text-teal-700">
                                MWK {(Number(selectedRoute.baseFee) + Number(tier.fee)).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {selectedRoute.courier_name && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      Provided by: {selectedRoute.courier_name}
                    </div>
                  )}
                  <button onClick={() => setSelectedRoute(null)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tracked order */}
          {trackedOrder && showDetails && (
            <div className="space-y-6">
              {/* Status card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Tracking number</p>
                    <h2 className="text-2xl font-bold text-gray-900">{trackedOrder.orderNumber}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={trackedOrder.status} />
                    <button onClick={() => { setTrackedOrder(null); setShowDetails(false); setOrderId('') }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="relative pt-6 pb-2">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 transition-all duration-700" style={{ width: `${(getStatusStep(trackedOrder.status) / 4) * 100}%` }} />
                  </div>
                  <div className="flex justify-between relative -mt-3">
                    {['Pending', 'Confirmed', 'In Transit', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                      const currentStep = getStatusStep(trackedOrder.status)
                      const isActive = idx <= currentStep
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 transition-colors ${isActive ? 'bg-teal-600' : 'bg-gray-200'}`} />
                          <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-teal-700' : 'text-gray-400'}`}>{step}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Parcel Items
                  </h3>
                  <div className="space-y-3">
                    {trackedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity} • MWK {item.price.toLocaleString()} each</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-900">MWK {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping Fee</span>
                      <span className="font-semibold text-gray-900">MWK {Number(trackedOrder.shippingFee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center bg-teal-50 rounded-lg p-3">
                      <span className="text-sm font-semibold text-teal-900">Total Paid</span>
                      <span className="text-xl font-bold text-teal-700">MWK {trackedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Courier */}
                <div className="space-y-6">
                  {trackedOrder.courierName ? (
                    <div className="bg-gray-900 rounded-xl p-6 text-white">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Courier Assigned</p>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center text-lg font-bold">
                          {trackedOrder.courierName[0]}
                        </div>
                        <div>
                          <p className="font-bold">{trackedOrder.courierName}</p>
                          <p className="text-xs text-teal-400">Verified Courier</p>
                        </div>
                      </div>
                      <a href={`tel:${trackedOrder.courierPhone}`} className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg font-semibold transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        Call Courier
                      </a>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Assigning Courier</p>
                        <p className="text-xs text-amber-700">Finding the best route...</p>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Delivery History</p>
                    <div className="space-y-4">
                      {trackedOrder.trackingHistory.map((event, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? 'bg-teal-600' : 'bg-gray-200'}`} />
                          <div>
                            <p className={`text-sm font-semibold ${i === 0 ? 'text-teal-700' : 'text-gray-500'}`}>{event.status}</p>
                            <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleTrackOrder} className="w-full py-3 bg-white border-2 border-teal-600 text-teal-700 rounded-lg font-semibold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Tracking
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-500 mb-5">Can't find your order? Contact our support team for assistance.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/marketplace" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:border-teal-300 hover:text-teal-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  Back to Marketplace
                </Link>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:border-teal-300 hover:text-teal-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
