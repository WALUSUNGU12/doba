'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Product {
  product_id: number
  shop_id: number
  shop_name?: string
  product_name: string
  description: string
  price: number
  category: string
  stock_quantity: number
  min_stock_level: number
  image_urls: string[]
  is_active: boolean
  created_at: string
}

export default function SellerProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user && user.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      const shopsRes = await fetch('https://api-doba.techgenesismw.com/api/shops/my-shops', { headers })
      if (shopsRes.ok) {
        const shopsData = await shopsRes.json()
        if (shopsData.data && shopsData.data.length > 0) {
          const allProducts = []
          for (const shop of shopsData.data) {
            const productsRes = await fetch(`https://api-doba.techgenesismw.com/api/products?shop_id=${shop.shop_id}`, { headers })
            if (productsRes.ok) {
              const productsData = await productsRes.json()
              const productsWithShop = (productsData.data || []).map((p: Product) => ({
                ...p,
                shop_name: shop.shop_name
              }))
              allProducts.push(...productsWithShop)
            }
          }
          setProducts(allProducts)
        }
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockCount = products.filter(p => p.stock_quantity <= p.min_stock_level).length
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length

  if (isLoading) {
    return (
      <DashboardLayout role="seller" title="Inventory">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading products...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="seller" title="Inventory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Products</h1>
            <p className="text-sm text-gray-500">Manage your product inventory</p>
          </div>
          <button
            onClick={() => router.push('/seller/products/new')}
            className="px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total</p>
             <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active</p>
             <p className="text-2xl font-bold text-teal-700">{products.filter(p => p.is_active).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Low Stock</p>
             <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-orange-500' : 'text-gray-900'}`}>{lowStockCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Out of Stock</p>
             <p className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>{outOfStockCount}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 mb-8 flex items-center">
           <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
           </div>
        </div>

        {/* Products Grid / Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Shop & Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Inventory</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                          {product.image_urls?.[0] ? (
                            <img src={product.image_urls[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{product.product_name}</p>
                          <p className="text-xs text-gray-400">ID: #{product.product_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                       <p className="text-xs font-semibold text-gray-900 uppercase">{product.shop_name}</p>
                       <p className="text-xs text-teal-700">{product.category}</p>
                    </td>
                    <td className="px-5 py-3">
                       <p className="text-sm font-semibold text-gray-900">MWK {product.price.toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-3">
                       <p className={`text-sm font-semibold ${product.stock_quantity <= product.min_stock_level ? 'text-red-500' : 'text-gray-900'}`}>
                          {product.stock_quantity}
                       </p>
                       <p className="text-xs text-gray-400">Units Left</p>
                    </td>
                    <td className="px-5 py-3">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                         product.is_active ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-600'
                       }`}>
                         {product.is_active ? 'Active' : 'Offline'}
                       </span>
                    </td>
                    <td className="px-5 py-3">
                       <button
                          onClick={() => router.push(`/seller/products/${product.product_id}`)}
                          className="text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                       >
                          View Details
                       </button>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="lg:hidden divide-y divide-gray-100">
             {filteredProducts.map((product) => (
               <div key={product.product_id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                           {product.image_urls?.[0] ? (
                             <img src={product.image_urls[0]} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                           )}
                        </div>
                        <div>
                           <p className="font-semibold text-gray-900 text-sm">{product.product_name}</p>
                           <p className="text-xs text-teal-700">{product.category}</p>
                        </div>
                     </div>
                     <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                       product.is_active ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-600'
                     }`}>
                       {product.is_active ? 'Active' : 'Offline'}
                     </span>
                  </div>
                   
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
                     <div>
                        <p className="text-xs text-gray-400 mb-1">Price</p>
                        <p className="text-sm font-semibold text-gray-900">MWK {product.price.toLocaleString()}</p>
                     </div>
                     <div>
                        <p className="text-xs text-gray-400 mb-1">Inventory</p>
                        <p className={`text-sm font-semibold ${product.stock_quantity <= product.min_stock_level ? 'text-red-500' : 'text-gray-900'}`}>
                           {product.stock_quantity} Units
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={() => router.push(`/seller/products/${product.product_id}`)}
                        className="flex-1 py-2.5 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
                     >
                        View Details
                     </button>
                  </div>
               </div>
             ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No products found</h3>
              <p className="text-sm text-gray-500 mb-4">Your search query did not match any inventory.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
