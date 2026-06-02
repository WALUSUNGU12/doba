'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Transaction {
  id: number
  order_id: number
  order_number: string
  amount: number
  type: 'delivery' | 'withdrawal'
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  customer_name?: string
  delivery_address?: string
}

interface WithdrawalRequest {
  amount: number
  payment_method: string
  account_details: string
  notes?: string
}

export default function CourierPaymentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [accountDetails, setAccountDetails] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState({
    totalEarned: 0,
    availableBalance: 0,
    pendingWithdrawals: 0,
    thisMonth: 0
  })

  useEffect(() => {
    if (user && user.role !== 'courier') {
      router.push('/dashboard')
      return
    }
    loadPayments()
  }, [user, router])

  const loadPayments = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      // Load completed deliveries for transaction history
      const deliveriesRes = await fetch('https://api-doba.techgenesismw.com/api/deliveries/my', { headers })
      if (deliveriesRes.ok) {
        const data = await deliveriesRes.json()
        const deliveries = data.data?.orders || []
        const completedDeliveries = deliveries.filter((d: any) => d.status === 'delivered')
        const totalEarned = completedDeliveries.reduce((sum: number, d: any) => sum + (d.courier_revenue || 0), 0)
        
        // Calculate this month's earnings
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const thisMonthEarned = completedDeliveries
          .filter((d: any) => {
            const deliveryDate = new Date(d.created_at)
            return deliveryDate.getMonth() === currentMonth && deliveryDate.getFullYear() === currentYear
          })
          .reduce((sum: number, d: any) => sum + (d.courier_revenue || 0), 0)

        // Create transaction history from deliveries
        const deliveryTransactions: Transaction[] = completedDeliveries.map((d: any) => ({
          id: d.order_id,
          order_id: d.order_id,
          order_number: d.order_number,
          amount: d.courier_revenue || 0,
          type: 'delivery' as const,
          status: 'completed' as const,
          created_at: d.created_at,
          completed_at: d.updated_at,
          customer_name: d.customer_name,
          delivery_address: `${d.delivery_city}, ${d.delivery_district}`
        }))

        setTransactions(deliveryTransactions)
        setStats({
          totalEarned,
          availableBalance: totalEarned,
          pendingWithdrawals: 0,
          thisMonth: thisMonthEarned
        })
      }
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setMessage('Please enter a valid withdrawal amount')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (parseFloat(withdrawalAmount) > stats.availableBalance) {
      setMessage('Insufficient balance for withdrawal')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (!accountDetails.trim()) {
      setMessage('Please enter your account details')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setIsWithdrawing(true)
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    try {
      const withdrawalData: WithdrawalRequest = {
        amount: parseFloat(withdrawalAmount),
        payment_method: paymentMethod,
        account_details: accountDetails.trim()
      }

      const response = await fetch('https://api-doba.techgenesismw.com/api/courier/withdraw', {
        method: 'POST',
        headers,
        body: JSON.stringify(withdrawalData)
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage('Withdrawal request submitted successfully!')
        setWithdrawalAmount('')
        setAccountDetails('')
        setShowWithdrawModal(false)
        loadPayments() // Reload to update balance
      } else {
        setMessage(result.error || 'Failed to submit withdrawal request')
      }
    } catch (error) {
      setMessage('Failed to process withdrawal. Please try again.')
    } finally {
      setIsWithdrawing(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="courier" title="Payments">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading payments...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="courier" title="Payments">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 flex items-center gap-2.5 p-3.5 rounded-lg text-sm ${
            message.includes('success') || message.includes('submitted') 
              ? 'bg-teal-50 border border-teal-200 text-teal-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              {message.includes('success') || message.includes('submitted') ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              )}
            </svg>
            <p className="font-semibold">{message}</p>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Earnings & Payments</h1>
          <p className="text-sm text-gray-500">Track your delivery commissions and manage withdrawals</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Earned</p>
            <p className="text-2xl font-bold text-teal-700">MWK {stats.totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Available Balance</p>
            <p className="text-2xl font-bold text-blue-600">MWK {stats.availableBalance.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Pending Withdrawals</p>
            <p className="text-2xl font-bold text-yellow-600">MWK {stats.pendingWithdrawals.toLocaleString()}</p>
          </div>
          <div className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-6 text-white">
            <p className="text-xs text-teal-100 uppercase tracking-wider mb-2">This Month</p>
            <p className="text-2xl font-bold text-white">MWK {stats.thisMonth.toLocaleString()}</p>
          </div>
        </div>

        {/* Withdrawal Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={stats.availableBalance <= 0}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              stats.availableBalance > 0
                ? 'bg-teal-700 text-white hover:bg-teal-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Withdraw Funds
          </button>
        </div>

        {/* Transaction History Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
             <h2 className="text-base font-bold text-gray-900">Transaction History</h2>
             <span className="text-xs text-gray-400 uppercase tracking-wider">{transactions.length} Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider font-semibold">Type</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider font-semibold">Order</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        t.type === 'delivery' 
                          ? 'bg-teal-50 text-teal-700' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{t.order_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.customer_name || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-teal-700">MWK {t.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        t.status === 'completed' ? 'bg-teal-50 text-teal-700' : 
                        t.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 
                        'bg-red-50 text-red-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {t.completed_at ? new Date(t.completed_at).toLocaleDateString() : new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">No transaction history found yet.</p>
                <p className="text-xs text-gray-400 mt-1">Complete deliveries to see your earnings here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Withdraw Funds</h3>
            <p className="text-sm text-gray-500 mb-6">Request a withdrawal from your available balance</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Available Balance</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-lg font-bold text-teal-700">MWK {stats.availableBalance.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Withdrawal Amount</label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={stats.availableBalance}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-0 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-0 transition-all text-sm"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash_pickup">Cash Pickup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Account Details</label>
                <textarea
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={paymentMethod === 'bank_transfer' ? 'Bank name, Account number, Account name' : 
                              paymentMethod === 'mobile_money' ? 'Phone number, Provider name' : 
                              'ID number, Pickup location'}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-0 transition-all resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawal}
                disabled={isWithdrawing || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || parseFloat(withdrawalAmount) > stats.availableBalance}
                className="flex-1 px-4 py-2.5 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? 'Processing...' : 'Submit Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
