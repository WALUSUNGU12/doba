'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DeliveryRoute {
  route_id: number
  name: string
  origin: string
  destination: string
  baseFee: number
  weightTiers: { minWeight: number; maxWeight: number; fee: number }[]
  courier_name?: string
}

interface Terminal {
  terminal_id: number
  name: string
  code: string
  city: string
  address: string
  phone: string
  isActive?: boolean | number
}

interface MobileMoneyOperator {
  ref_id: string
  name: string
  country: string
}

type PaymentStatus = 'idle' | 'charging' | 'pending' | 'success' | 'failed'

function calcShipping(route: DeliveryRoute | null, weight: number): number {
  if (!route) return 0
  const tier = route.weightTiers.find(t => weight > t.minWeight && weight <= t.maxWeight)
  const fee = tier ? tier.fee : (route.weightTiers[route.weightTiers.length - 1]?.fee || 0)
  return Number(route.baseFee) + Number(fee)
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [isProcessing, setIsProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [paymentProgress, setPaymentProgress] = useState(0)

  const [hasPendingCheckout, setHasPendingCheckout] = useState(false)
  const [pendingTxRef, setPendingTxRef] = useState('')

  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null)
  const [isLoadingTerminals, setIsLoadingTerminals] = useState(true)

  const [shopTerminal, setShopTerminal] = useState<{ terminal_id: number; name: string } | null>(null)
  const [isLoadingShopTerminal, setIsLoadingShopTerminal] = useState(true)
  
  const [allRoutes, setAllRoutes] = useState<DeliveryRoute[]>([])

  const [operators, setOperators] = useState<MobileMoneyOperator[]>([])
  const [selectedOperator, setSelectedOperator] = useState<MobileMoneyOperator | null>(null)
  const [isLoadingOperators, setIsLoadingOperators] = useState(true)
  const [paymentPhone, setPaymentPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '', notes: '',
  })
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({})

  // Find matched route between shopTerminal and selectedTerminal
  const getMatchedRoute = (targetTerminal: Terminal | null): DeliveryRoute | null => {
    if (!shopTerminal || !targetTerminal) return null
    return allRoutes.find(r => 
      (r.origin.toLowerCase() === shopTerminal.name.toLowerCase() && r.destination.toLowerCase() === targetTerminal.name.toLowerCase()) ||
      (r.destination.toLowerCase() === shopTerminal.name.toLowerCase() && r.origin.toLowerCase() === targetTerminal.name.toLowerCase())
    ) || null
  }

  const matchedRoute = getMatchedRoute(selectedTerminal)
  const totalPrice = getTotalPrice()
  const totalWeight = items.reduce((sum, item) => sum + ((item.product.weight_kg || 0) * item.quantity), 0)
  
  // Dynamic shipping fee: use matched route fee, or fallback to 2,000 MWK flat rate if no route exists
  const shippingFee = selectedTerminal 
    ? (matchedRoute ? calcShipping(matchedRoute, totalWeight) : 2000)
    : 0
  const finalTotal = totalPrice + shippingFee

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) router.push('/cart')
    if (user) {
      setShippingInfo(p => ({
        ...p,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      }))
    }
  }, [items, router, user, orderPlaced])

  // Fetch shop terminal
  useEffect(() => {
    if (items.length > 0) {
      const shopId = items[0]?.product.shop_id
      if (shopId) {
        setIsLoadingShopTerminal(true)
        fetch(`https://api-doba.techgenesismw.com/api/shops/${shopId}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (d && d.success && d.data) {
              setShopTerminal({
                terminal_id: d.data.terminal_id,
                name: d.data.terminal_name || 'Mzuzu Hub'
              })
            }
          })
          .catch(console.error)
          .finally(() => setIsLoadingShopTerminal(false))
      } else {
        setIsLoadingShopTerminal(false)
      }
    } else {
      setIsLoadingShopTerminal(false)
    }
  }, [items])

  // Fetch public terminals
  useEffect(() => {
    fetch('https://api-doba.techgenesismw.com/api/terminals/public')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setTerminals(d.data || []) })
      .catch(console.error)
      .finally(() => setIsLoadingTerminals(false))
  }, [])

  // Check for pending checkout session to recover
  useEffect(() => {
    const stored = localStorage.getItem('pending_checkout')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.txRef || parsed.charge_id) {
          setHasPendingCheckout(true)
          setPendingTxRef(parsed.txRef || parsed.charge_id)
        }
      } catch {
        localStorage.removeItem('pending_checkout')
      }
    }
  }, [])

  // Fetch all public courier routes
  useEffect(() => {
    fetch('https://api-doba.techgenesismw.com/api/courier/routes/public')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setAllRoutes(d.data || []) })
      .catch(console.error)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('https://api-doba.techgenesismw.com/api/payments/mobile-money/operators', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setOperators(d.data || []) })
      .catch(console.error)
      .finally(() => setIsLoadingOperators(false))
  }, [])

  useEffect(() => {
    if (paymentStatus === 'pending') {
      const interval = setInterval(() => {
        setPaymentProgress(p => (p >= 98 ? p : p + Math.random() * 3))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [paymentStatus])

  const validateShipping = () => {
    const e: Record<string, string> = {}
    if (!shippingInfo.firstName.trim()) e.firstName = 'First name is required'
    if (!shippingInfo.lastName.trim()) e.lastName = 'Last name is required'
    return e
  }

  const validatePaymentPhone = () => {
    if (!paymentPhone.trim()) return 'Payment phone number is required'
    
    const phone = paymentPhone.trim()
    const operatorName = selectedOperator?.name.toLowerCase() || ''
    
    if (operatorName.includes('mpamba')) {
      if (!phone.startsWith('088') && !phone.startsWith('089')) {
        return 'TNM Mpamba numbers must start with 088 or 089'
      }
    } else if (operatorName.includes('airtel')) {
      if (!phone.startsWith('099') && !phone.startsWith('098')) {
        return 'Airtel Money numbers must start with 099 or 098'
      }
    }
    
    if (phone.length !== 10) {
      return 'Phone number must be 10 digits'
    }
    
    return ''
  }

  const createOrder = async (txRef: string, storedPayload?: any) => {
    const token = localStorage.getItem('token')
    const payload = storedPayload || {
      route_id: matchedRoute?.route_id || null,
      delivery_terminal_id: selectedTerminal?.terminal_id || null,
      shipping_info: shippingInfo,
      payment_method: 'mobile_money',
      mobile_operator: selectedOperator?.ref_id,
      payment_phone: paymentPhone,
      charge_id: txRef,
      payment_status: 'paid',
      total_amount: finalTotal,
      shipping_fee: shippingFee,
      items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })),
    }

    const res = await fetch('https://api-doba.techgenesismw.com/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      setOrderNumber(data.data.order_number)
      setOrderPlaced(true)
      localStorage.removeItem('pending_checkout')
      setHasPendingCheckout(false)
      clearCart()
    } else {
      throw new Error('Order recording failed. Please contact support.')
    }
  }

  const pollPayment = async (chargeId: string) => {
    const token = localStorage.getItem('token')
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`https://api-doba.techgenesismw.com/api/payments/mobile-money/verify/${chargeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const result = await res.json()
          const paymentState = result.data?.status?.toLowerCase()
          if (paymentState === 'success' || paymentState === 'successful') {
            clearInterval(interval)
            setPaymentStatus('success')
            setPaymentProgress(100)
            setTimeout(() => createOrder(chargeId).catch(err => { alert(err.message); setIsProcessing(false) }), 1500)
            return
          } else if (paymentState === 'failed') {
            clearInterval(interval)
            setPaymentStatus('failed')
            setIsProcessing(false)
            return
          }
          // If 'pending', continue polling — update progress to show activity
          setPaymentProgress(Math.min(20 + Math.floor((attempts / 60) * 70), 90))
        }
      } catch { /* continue polling */ }
      if (attempts >= 60) {
        clearInterval(interval)
        setPaymentStatus('failed')
        setIsProcessing(false)
      }
    }, 3000)
  }

  const handleReverify = async (txRef: string) => {
    const stored = localStorage.getItem('pending_checkout')
    if (!stored) {
      alert('No pending transaction details found in your browser cache.')
      return
    }

    let pendingCheckout: any
    try {
      pendingCheckout = JSON.parse(stored)
    } catch {
      alert('Invalid pending transaction data. Starting a new checkout is recommended.')
      return
    }

    setIsProcessing(true)
    setPaymentStatus('pending')
    setPaymentProgress(50)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`https://api-doba.techgenesismw.com/api/payments/mobile-money/verify/${txRef}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.ok) {
        const result = await res.json()
        const paymentState = result.data?.status?.toLowerCase()
        if (paymentState === 'success' || paymentState === 'successful') {
          setPaymentStatus('success')
          setPaymentProgress(100)
          setTimeout(() => {
            createOrder(txRef, pendingCheckout).catch(err => {
              alert(err.message)
              setIsProcessing(false)
            })
          }, 1500)
        } else if (paymentState === 'pending') {
          setPaymentStatus('failed')
          alert('Your payment is still being processed by the mobile money provider. This can take up to a minute after confirming your PIN. Please wait a moment and try re-verifying again.')
        } else {
          const statusMsg = result.data?.status || 'unknown'
          setPaymentStatus('failed')
          alert(`Verification failed: transaction status is '${statusMsg}'. If you confirmed the PIN, please wait a moment and try re-verifying again.`)
        }
      } else {
        setPaymentStatus('failed')
        alert('Could not verify status with PayChangu. Please check your network and try again.')
      }
    } catch (err: any) {
      setPaymentStatus('failed')
      alert('An error occurred during verification: ' + err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateShipping()
    if (Object.keys(errs).length) { setShippingErrors(errs); return }
    if (!selectedTerminal) { alert('Please select a delivery terminal'); return }
    if (!selectedOperator) { alert('Please select a payment method'); return }
    const phoneError = validatePaymentPhone()
    if (phoneError) { setPhoneError(phoneError); return }
    setShippingErrors({})
    setPhoneError('')
    setIsProcessing(true)
    setPaymentStatus('charging')
    setPaymentProgress(10)

    try {
      const token = localStorage.getItem('token')
      const txRef = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Store checkout details in localStorage before initiating payment
      const pendingCheckout = {
        route_id: matchedRoute?.route_id || null,
        delivery_terminal_id: selectedTerminal?.terminal_id || null,
        shipping_info: shippingInfo,
        payment_method: 'mobile_money',
        mobile_operator: selectedOperator.ref_id,
        payment_phone: paymentPhone,
        charge_id: txRef,
        txRef,
        payment_status: 'paid',
        total_amount: finalTotal,
        shipping_fee: shippingFee,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })),
      }
      localStorage.setItem('pending_checkout', JSON.stringify(pendingCheckout))

      const res = await fetch('https://api-doba.techgenesismw.com/api/payments/mobile-money/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          mobile: paymentPhone,
          mobile_money_operator_ref_id: selectedOperator.ref_id,
          amount: finalTotal,
          charge_id: txRef,
          email: shippingInfo.email,
          first_name: shippingInfo.firstName,
          last_name: shippingInfo.lastName,
        }),
      })
      const chargeData = await res.json()
      if (!res.ok || !chargeData.success) throw new Error(chargeData.message || 'Payment gateway error')
      
      // Use the actual charge_id from PayChangu response for verification
      const actualChargeId = chargeData.data?.charge_id || txRef
      
      // Update localStorage with the actual charge_id from PayChangu
      const stored = localStorage.getItem('pending_checkout')
      if (stored) {
        try {
          const pendingCheckout = JSON.parse(stored)
          pendingCheckout.charge_id = actualChargeId
          pendingCheckout.txRef = actualChargeId
          localStorage.setItem('pending_checkout', JSON.stringify(pendingCheckout))
        } catch (e) {
          console.error('Error updating pending_checkout:', e)
        }
      }
      
      setPaymentStatus('pending')
      setPaymentProgress(30)
      pollPayment(actualChargeId)
    } catch (err: any) {
      setPaymentStatus('failed')
      setIsProcessing(false)
      alert(err.message)
    }
  }

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        {msg}
      </p>
    ) : null

  const inputClass = (hasError: boolean, isReadOnly: boolean = false) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
      hasError ? 'border-red-400 bg-red-50' : isReadOnly ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
    }`

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed</h2>
          <p className="text-sm text-gray-500 mb-6">Payment confirmed. Your order has been recorded.</p>
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <p className="text-xs text-gray-400 mb-1">Order Number</p>
            <p className="text-xl font-bold text-gray-900 font-mono">{orderNumber}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/dashboard')} className="w-full py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors">
              Go to Dashboard
            </button>
            <button onClick={() => router.push('/marketplace')} className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:border-teal-300 transition-colors">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full text-center">
            {(paymentStatus === 'charging' || paymentStatus === 'pending') && (
              <>
                <div className="w-14 h-14 border-2 border-teal-700/20 border-t-teal-700 rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {paymentStatus === 'charging' ? 'Connecting to gateway...' : 'Awaiting confirmation'}
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                  {paymentStatus === 'pending' ? 'Confirm the payment prompt on your phone.' : 'Establishing secure connection...'}
                </p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-700 transition-all duration-500" style={{ width: `${paymentProgress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">{Math.round(paymentProgress)}%</p>
              </>
            )}
            {paymentStatus === 'success' && (
              <>
                <div className="w-14 h-14 bg-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-teal-700 mb-2">Payment Verified</h2>
                <p className="text-sm text-gray-500">Recording your order...</p>
              </>
            )}
            {paymentStatus === 'failed' && (
              <>
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
                <p className="text-sm text-gray-500 mb-6">
                  We couldn't confirm your payment status. If you already approved the PIN prompt on your phone and money was deducted, click <strong>Re-Verify Payment</strong> to check again and complete your order.
                </p>
                <div className="flex flex-col gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      const stored = localStorage.getItem('pending_checkout')
                      if (stored) {
                        try {
                          const parsed = JSON.parse(stored)
                          handleReverify(parsed.txRef || parsed.charge_id)
                        } catch {
                          setIsProcessing(false)
                        }
                      } else {
                        setIsProcessing(false)
                      }
                    }}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    Re-Verify Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProcessing(false)}
                    className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                  >
                    Cancel & Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Cart
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">Orders are only recorded after successful payment</p>
        </div>

        {hasPendingCheckout && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 text-teal-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-teal-900">Unverified Payment Found</h3>
                <p className="text-xs text-teal-700 mt-0.5">
                  We found a payment attempt (Ref: <code className="font-mono bg-teal-100/80 px-1 py-0.5 rounded">{pendingTxRef}</code>) from your last checkout session. 
                  If you already confirmed the PIN on your phone and money was deducted, click "Verify & Complete Order".
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 flex-shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleReverify(pendingTxRef)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                Verify & Complete Order
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.confirm("Are you sure you want to discard this pending transaction? Use this only if you haven't been charged or want to start a completely new payment.")) {
                    try {
                      localStorage.removeItem('pending_checkout')
                      setHasPendingCheckout(false)
                      setPendingTxRef('')
                    } catch (error) {
                      console.error('Error discarding pending checkout:', error)
                      alert('Failed to discard pending transaction. Please try clearing your browser cache.')
                    }
                  }
                }}
                className="px-4 py-2 bg-white border border-gray-200 hover:border-red-200 hover:text-red-600 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Step 1: Delivery details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 bg-teal-700 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</div>
                  <h2 className="text-base font-semibold text-gray-900">Delivery Details</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                    <input type="text" value={shippingInfo.firstName} readOnly className={inputClass(!!shippingErrors.firstName, true)} />
                    <FieldError msg={shippingErrors.firstName} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                    <input type="text" value={shippingInfo.lastName} readOnly className={inputClass(!!shippingErrors.lastName, true)} />
                    <FieldError msg={shippingErrors.lastName} />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Terminal */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 bg-teal-700 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</div>
                  <h2 className="text-base font-semibold text-gray-900">Delivery Terminal</h2>
                </div>

                {shopTerminal && (
                  <div className="mb-5 p-3.5 bg-teal-50/70 border border-teal-100 rounded-lg text-xs text-teal-800 flex items-center gap-2.5">
                    <svg className="w-5 h-5 text-teal-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span>
                      Shipping from: <strong className="font-semibold">{shopTerminal.name}</strong> (Seller nearby terminal station)
                    </span>
                  </div>
                )}

                {isLoadingTerminals || isLoadingShopTerminal ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                    <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                    Loading terminal stations...
                  </div>
                ) : terminals.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">No terminal stations available.</p>
                ) : (
                  <div className="space-y-3">
                    {terminals
                      .filter(t => t.terminal_id !== shopTerminal?.terminal_id)
                      .map(terminal => {
                        const route = getMatchedRoute(terminal)
                        const cost = route ? calcShipping(route, totalWeight) : 2000
                        const isSelected = selectedTerminal?.terminal_id === terminal.terminal_id
                        return (
                          <label key={terminal.terminal_id} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-teal-700 bg-teal-50/40 shadow-sm' : 'border-gray-200 hover:border-teal-300'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-teal-700' : 'border-gray-300'}`}>
                                {isSelected && <div className="w-2 h-2 bg-teal-700 rounded-full" />}
                              </div>
                              <input type="radio" name="terminal" checked={isSelected} onChange={() => setSelectedTerminal(terminal)} className="sr-only" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{terminal.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Code: {terminal.code}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{terminal.address}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{terminal.phone}</p>
                                {route ? (
                                  <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
                                    Direct Route: {route.courier_name || 'System Route'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-100">
                                    Standard Flat Rate
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-teal-700">MWK {cost.toLocaleString()}</p>
                            </div>
                          </label>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Step 3: Payment */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 bg-teal-700 text-white rounded-lg flex items-center justify-center text-xs font-bold">3</div>
                  <h2 className="text-base font-semibold text-gray-900">Payment</h2>
                </div>
                {isLoadingOperators ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                    Loading payment options...
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {operators.map(op => {
                        const isSelected = selectedOperator?.ref_id === op.ref_id
                        const lname = op.name.toLowerCase()
                        const logoSrc = lname.includes('airtel') 
                          ? '/images/AirtelMoney.png' 
                          : lname.includes('mpamba') 
                          ? '/images/mpamba.png' 
                          : null

                        return (
                          <button
                            key={op.ref_id}
                            type="button"
                            onClick={() => setSelectedOperator(op)}
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              isSelected ? 'border-teal-700 bg-teal-50/50 shadow-sm' : 'border-gray-200 hover:border-teal-300'
                            }`}
                          >
                            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden bg-white border border-gray-100 p-1.5 shadow-sm">
                              {logoSrc ? (
                                <img src={logoSrc} alt={op.name} className="w-full h-full object-contain" />
                              ) : (
                                <div className={`w-full h-full rounded-lg flex items-center justify-center text-lg font-bold ${
                                  isSelected ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {op.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{op.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Mobile Money</p>
                          </button>
                        )
                      })}
                    </div>

                    {selectedOperator && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {selectedOperator.name} phone number
                        </label>
                        <input
                          type="tel"
                          placeholder={
                            selectedOperator.name.toLowerCase().includes('mpamba') 
                              ? '088xxxxxxxxx or 089xxxxxxxxx' 
                              : '099xxxxxxxxx or 098xxxxxxxxx'
                          }
                          value={paymentPhone}
                          onChange={e => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setPaymentPhone(value)
                            if (phoneError) setPhoneError('')
                          }}
                          className={inputClass(!!phoneError)}
                        />
                        <FieldError msg={phoneError} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right column — summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                <h2 className="text-base font-semibold text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={item.product_id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 bg-teal-50 text-teal-700 rounded text-xs font-bold flex items-center justify-center flex-shrink-0">{item.quantity}</span>
                        <span className="text-sm text-gray-700 truncate">{item.product.product_name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 flex-shrink-0">MWK {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">MWK {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {selectedTerminal ? `MWK ${shippingFee.toLocaleString()}` : 'Select terminal'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-teal-700">MWK {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !selectedTerminal || !selectedOperator || !paymentPhone}
                  className="w-full py-3 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  )}
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Secure payment via mobile money
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
