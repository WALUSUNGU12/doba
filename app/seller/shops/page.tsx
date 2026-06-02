'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Shop {
  shop_id: number
  shop_name: string
  description: string
  category: string
  address: string
  phone: string
  email: string
  logo_url: string | null
  banner_url: string | null
  is_active: boolean
  created_at: string
}

interface Product {
  product_id: number
  shop_id: number
  product_name: string
  description: string
  price: number | string
  weight_kg: number
  category: string
  stock_quantity: number
  min_stock_level: number
  image_urls: string[]
  is_active: boolean
  created_at: string
}

export default function SellerShopsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    loadShop()
  }, [user, router])

  const loadShop = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/shops/my-shops', { headers })
      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          setShops(data.data)
          setSelectedShop(data.data[0])
          loadProducts(data.data[0].shop_id)
        }
      }
    } catch (error) {
      console.error('Error loading shop:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProducts = async (shopId: number) => {
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/products?shop_id=${shopId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const handleSelectShop = (shop: Shop) => {
    setSelectedShop(shop)
    loadProducts(shop.shop_id)
  }

  if (isLoading) {
    return (
      <DashboardLayout role="seller" title="My Shops">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading shops...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="seller" title="My Shops">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Shop Management</h1>
            <p className="text-sm text-gray-500">Oversee your retail outlets and inventory</p>
          </div>
          <button
            onClick={() => router.push('/seller/products')}
            className="px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Manage Products
          </button>
        </div>

        {shops.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
             <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
               <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
               </svg>
             </div>
             <h2 className="text-base font-semibold text-gray-900 mb-1">No Shops Found</h2>
             <p className="text-sm text-gray-500 mb-4">You haven't registered any shops yet.</p>
             <button className="px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors">Register a Shop</button>
          </div>
        ) : (
          <>
            {/* Shop Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {shops.map((shop) => (
                <div
                  key={shop.shop_id}
                  onClick={() => handleSelectShop(shop)}
                  className={`bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    selectedShop?.shop_id === shop.shop_id ? 'border-teal-700 shadow-sm' : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="w-full h-32 relative overflow-hidden rounded-t-lg">
                    {shop.banner_url ? (
                      <img 
                        src={`https://api-doba.techgenesismw.com${shop.banner_url}`} 
                        alt={`${shop.shop_name} banner`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-teal-700 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-lg font-bold text-white">
                          {shop.shop_name.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                      <div className="w-full flex justify-between items-end">
                        <div>
                          <h3 className="text-white text-base font-semibold drop-shadow-lg">{shop.shop_name}</h3>
                          <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${
                            shop.is_active ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {shop.is_active ? 'Active' : 'Offline'}
                          </span>
                        </div>
                        <div className="text-white text-xs">
                          {shop.category}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Category</p>
                    <p className="text-sm font-semibold text-gray-600">{shop.category}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Shop Detail View */}
            {selectedShop && (
              <div className="space-y-6">
                {/* Shop Hero Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                   <div className="h-48 bg-gradient-to-r from-gray-900 via-teal-700 to-gray-900 relative">
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                      <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold text-gray-900 border-2 border-white">
                               {selectedShop.shop_name.charAt(0)}
                            </div>
                            <div className="text-white">
                               <h2 className="text-2xl font-bold mb-1">{selectedShop.shop_name}</h2>
                               <p className="text-teal-200 font-semibold uppercase tracking-wider text-xs">{selectedShop.category}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                         <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">About the Shop</p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                               {selectedShop.description || 'No specialized description provided for this retail outlet yet.'}
                            </p>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                               <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Contact Lines</p>
                               <p className="font-semibold text-gray-900 text-sm">{selectedShop.phone}</p>
                               <p className="text-xs text-gray-500">{selectedShop.email}</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Location</p>
                               <p className="font-semibold text-gray-900 text-sm">{selectedShop.address}</p>
                            </div>
                         </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-5 flex flex-col justify-between">
                         <div className="space-y-4">
                            <div>
                               <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Established</p>
                               <p className="font-semibold text-gray-900 text-sm">{new Date(selectedShop.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Inventory</p>
                               <p className="text-2xl font-bold text-teal-700">{products.length} Items</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => router.push(`/seller/shops/${selectedShop.shop_id}/edit`)}
                            className="w-full py-2.5 bg-teal-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider mt-4 hover:bg-teal-600 transition-colors"
                         >
                            Edit Shop Details
                         </button>
                      </div>
                   </div>
                </div>

                {/* Inventory Grid */}
                <section>
                   <div className="flex items-center justify-between mb-6 px-2">
                      <h2 className="text-lg font-bold text-gray-900">Current Inventory</h2>
                      <button className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors">View All Products →</button>
                   </div>
                   
                   {products.length === 0 ? (
                      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                         <p className="text-gray-400 text-xs uppercase tracking-wider">This shop has no products yet</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                         {products.map((p) => (
                            <div key={p.product_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-teal-200 transition-colors">
                               <div className="h-40 relative overflow-hidden">
                                  {p.image_urls && p.image_urls.length > 0 ? (
                                    <img src={p.image_urls[0]} alt={p.product_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                      </svg>
                                    </div>
                                  )}
                                  <div className="absolute top-3 right-3">
                                     <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                                       p.stock_quantity <= p.min_stock_level ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-teal-700'
                                     }`}>
                                        {p.stock_quantity <= p.min_stock_level ? 'Low Stock' : `${p.stock_quantity} in Stock`}
                                     </span>
                                  </div>
                               </div>
                               <div className="p-4">
                                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{p.category}</p>
                                  <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-1">{p.product_name}</h3>
                                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                     <p className="text-base font-semibold text-gray-900">MWK {Number(p.price).toLocaleString()}</p>
                                     <button className="w-8 h-8 bg-teal-700 text-white rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                                     </button>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
