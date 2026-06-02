'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import SellerSidebar from '@/components/SellerSidebar'

interface Transaction {
  order_id: number
  order_number: string
  total_amount: number
  shipping_fee: number
  items_total: number
  payment_status: string
  payment_method: string
  created_at: string
  status: string
}

export default function SellerPaymentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMobile, setWithdrawMobile] = useState('')
  const [withdrawOperator, setWithdrawOperator] = useState('airtel')
  const [withdrawSuccess, setWithdrawSuccess] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawals, setWithdrawals] = useState<any[]>([])

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    loadTransactions()
    loadWithdrawals()
  }, [user, router])

  const loadTransactions = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/orders/seller-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        const orders = data.data?.orders || []
        const transactions = orders.map((order: any) => {
          const itemsTotal = order.items?.reduce((sum: number, item: any) => sum + parseFloat(item.subtotal || 0), 0) || 0
          const shippingFee = parseFloat(order.total_amount || 0) - itemsTotal
          return {
            order_id: order.order_id,
            order_number: order.order_number,
            total_amount: order.total_amount,
            shipping_fee: shippingFee,
            items_total: itemsTotal,
            payment_status: order.payment_status,
            payment_method: order.payment_method,
            created_at: order.created_at,
            status: order.status
          }
        })
        setTransactions(transactions)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      setError('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalRevenue = () => {
    const paidTransactions = transactions.filter(t => t.payment_status === 'paid')
    return paidTransactions.reduce((sum, t) => sum + (Number(t.items_total) || 0), 0)
  }

  const loadWithdrawals = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/payments/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setWithdrawals(data.data || [])
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawError('')
    setWithdrawSuccess('')
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/payments/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          mobile_number: withdrawMobile,
          mobile_money_operator: withdrawOperator
        })
      })
      if (response.ok) {
        setWithdrawSuccess('Withdrawal request submitted successfully!')
        setShowWithdrawModal(false)
        setWithdrawAmount('')
        setWithdrawMobile('')
        loadWithdrawals()
      } else {
        const data = await response.json()
        setWithdrawError(data.message || 'Failed to submit withdrawal request')
      }
    } catch (error) {
      setWithdrawError('Failed to submit withdrawal request')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <SellerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading payments...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
              <p className="text-sm text-gray-500">Track your earnings and manage withdrawals</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Financials</h1>
            <p className="text-sm text-gray-500">Track your earnings and manage withdrawals</p>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Withdraw Funds
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}
        {withdrawSuccess && (
          <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-700">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {withdrawSuccess}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-teal-700">MWK {getTotalRevenue().toLocaleString()}</p>
          </div>
          <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-5">
             <p className="text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1">Current Balance</p>
             <p className="text-2xl font-bold text-white">MWK {getTotalRevenue().toLocaleString()}</p>
          </div>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
             <h2 className="text-base font-bold text-gray-900">Recent Transactions</h2>
             <span className="text-xs text-gray-400">{transactions.length} Total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t.order_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-gray-900">{t.order_number}</td>
                    <td className="px-5 py-3 font-semibold text-teal-700">MWK {t.items_total.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        t.payment_status === 'paid' ? 'bg-teal-50 text-teal-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {t.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="lg:hidden space-y-4 mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4 px-2">Transactions</h2>
          {transactions.map((t) => (
            <div key={t.order_id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-base font-semibold text-gray-900">{t.order_number}</p>
                  <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                  t.payment_status === 'paid' ? 'bg-teal-50 text-teal-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {t.payment_status}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <p className="text-xs text-gray-400">Revenue</p>
                <p className="text-sm font-semibold text-teal-700">MWK {t.items_total.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Withdrawal History */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4 px-2">Withdrawal Log</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Method</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {withdrawals.map((w) => (
                    <tr key={w.withdrawal_id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-semibold text-gray-900">MWK {w.amount.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <p className="text-xs font-semibold text-gray-900">{w.mobile_money_operator.toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{w.mobile_number}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          w.status === 'completed' ? 'bg-teal-50 text-teal-700' :
                          w.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400">{new Date(w.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Withdrawal</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              {withdrawError && (
                <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {withdrawError}
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Amount (MWK)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-teal-700">Available: MWK {getTotalRevenue().toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <input
                      type="tel"
                      value={withdrawMobile}
                      onChange={(e) => setWithdrawMobile(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="+265..."
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Operator</label>
                    <select
                      value={withdrawOperator}
                      onChange={(e) => setWithdrawOperator(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="airtel">Airtel Money</option>
                      <option value="tnm">TNM Mpamba</option>
                      <option value="mtn">MTN Mobile Money</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors">
                    Request Payout
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
