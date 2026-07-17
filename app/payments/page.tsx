'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Transaction {
  order_id: number
  order_number: string
  total_amount: number
  payment_status: string
  actual_status?: string
  payment_method: string
  created_at: string
  charge_id: string | null
}

interface ChargeDetails {
  status: string
  amount: string
  currency: string
  created_at: string
  mobile: string
  mobile_money_operator: string
}

export default function PaymentsPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedCharge, setSelectedCharge] = useState<ChargeDetails | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCharge, setIsLoadingCharge] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthLoading) return
    if (!user) { router.push('/auth/login'); return }
    loadTransactions()
  }, [user, isAuthLoading, router])

  const loadTransactions = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('https://api-doba.techgenesismw.com/api/payments/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.data?.transactions || [])
      }
    } catch {
      setError('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const loadChargeDetails = async (chargeId: string, transaction: Transaction) => {
    const token = localStorage.getItem('token')
    setIsLoadingCharge(true)
    setSelectedTransaction(transaction)
    setSelectedCharge(null)
    try {
      const res = await fetch(`https://api-doba.techgenesismw.com/api/payments/charge/${chargeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedCharge(data.data)
      }
    } catch {
      // still show receipt with order data
    } finally {
      setIsLoadingCharge(false)
      setShowReceipt(true)
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <DashboardLayout role="customer" title="Payments">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-7 h-7 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="customer" title="Payments">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">View your transactions and download receipts</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Transactions</h2>
            <span className="text-xs text-gray-400">{transactions.length} total</span>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map(tx => (
                <div key={tx.order_id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      (tx.actual_status === 'success' || tx.actual_status === 'successful' || tx.payment_status === 'paid') ? 'bg-teal-50' : 
                      tx.actual_status === 'failed' ? 'bg-red-50' : 'bg-amber-50'
                    }`}>
                      {(tx.actual_status === 'success' || tx.actual_status === 'successful' || tx.payment_status === 'paid') ? (
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : tx.actual_status === 'failed' ? (
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tx.order_number}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}
                        <span className="uppercase">{tx.payment_method?.replace(/_/g, ' ')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900">MWK {tx.total_amount.toLocaleString()}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        (tx.actual_status === 'success' || tx.actual_status === 'successful' || tx.payment_status === 'paid') ? 'bg-teal-50 text-teal-700' : 
                        tx.actual_status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {(tx.actual_status === 'success' || tx.actual_status === 'successful' || tx.payment_status === 'paid') ? 'paid' : 
                         tx.actual_status ? tx.actual_status : tx.payment_status}
                      </span>
                    </div>
                    <button
                      onClick={() => loadChargeDetails(tx.charge_id || 'N/A', tx)}
                      disabled={isLoadingCharge}
                      className="px-3.5 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:border-teal-300 hover:text-teal-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Receipt modal */}
      {showReceipt && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-none print:rounded-none">
            {/* Receipt header */}
            <div className="bg-teal-700 text-white px-6 py-5 rounded-t-2xl print:rounded-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-xs font-medium mb-0.5">Payment Receipt</p>
                  <h2 className="text-xl font-bold">DOBADoba</h2>
                </div>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors print:hidden"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Receipt body */}
            <div className="p-6 space-y-5">
              {/* Status */}
              <div className="flex justify-center">
                <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                  (selectedTransaction.actual_status === 'success' || selectedTransaction.actual_status === 'successful' || selectedTransaction.payment_status === 'paid')
                    ? 'bg-teal-50 text-teal-700'
                    : selectedTransaction.actual_status === 'failed'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {(selectedTransaction.actual_status === 'success' || selectedTransaction.actual_status === 'successful' || selectedTransaction.payment_status === 'paid') 
                    ? 'Payment Confirmed' 
                    : selectedTransaction.actual_status === 'failed' 
                    ? 'Payment Failed' 
                    : 'Payment Pending'}
                </span>
              </div>

              {/* Order details */}
              <div className="border-t border-b border-gray-100 py-4 space-y-3">
                {[
                  { label: 'Order Number', value: selectedTransaction.order_number },
                  {
                    label: 'Date',
                    value: new Date(selectedTransaction.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    }),
                  },
                  { label: 'Payment Method', value: selectedTransaction.payment_method?.replace(/_/g, ' ').toUpperCase() },
                  ...(selectedTransaction.charge_id && selectedTransaction.charge_id !== 'N/A'
                    ? [{ label: 'Transaction ID', value: selectedTransaction.charge_id }]
                    : []),
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-start gap-4">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Amount */}
              <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-teal-700">MWK {selectedTransaction.total_amount.toLocaleString()}</span>
              </div>

              {/* Charge details */}
              {selectedCharge && (
                <div className="border-t border-gray-100 pt-4 space-y-3 print:hidden">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Payment Provider</p>
                  {[
                    { label: 'Status', value: selectedCharge.status },
                    ...(selectedCharge.mobile ? [{ label: 'Mobile', value: selectedCharge.mobile }] : []),
                    ...(selectedCharge.mobile_money_operator ? [{ label: 'Operator', value: selectedCharge.mobile_money_operator }] : []),
                  ].map(row => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-sm text-gray-500">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">Thank you for shopping with DOBADoba</p>
                <p className="text-xs text-gray-400 mt-0.5">Powered by Tech Genesis Malawi</p>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors print:hidden flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
