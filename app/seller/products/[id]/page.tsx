'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Product {
  product_id: number
  shop_id: number
  product_name: string
  description: string
  price: number
  weight_kg: number
  category: string
  stock_quantity: number
  min_stock_level: number
  image_urls: string[]
  is_active: boolean
  created_at: string
  shop_name?: string
}

export default function SellerProductDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    loadProduct()
  }, [user, router, productId])

  const loadProduct = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      const res = await fetch(`https://api-doba.techgenesismw.com/api/products/${productId}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setProduct(data.data)
      } else {
        router.push('/seller/products')
      }
    } catch (error) {
      console.error('Error loading product:', error)
      router.push('/seller/products')
    } finally {
      setIsLoading(false)
    }
  }

  const updateProductStatus = async (isActive: boolean) => {
    if (!product) return
    
    setIsUpdatingStatus(true)
    const token = localStorage.getItem('token')
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    
    try {
      const res = await fetch(`https://api-doba.techgenesismw.com/api/products/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ is_active: isActive })
      })
      
      if (res.ok) {
        const data = await res.json()
        setProduct(data.data)
      } else {
        console.error('Failed to update product status')
      }
    } catch (error) {
      console.error('Error updating product status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="seller" title="Product Details">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading product...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!product) {
    return (
      <DashboardLayout role="seller" title="Product Details">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Product not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="seller" title="Product Details">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => router.push('/seller/products')} 
              className="mb-2 flex items-center text-gray-600 text-sm font-semibold hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Products
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Product Details</h1>
            <p className="text-sm text-gray-500">View complete product information</p>
          </div>
          <button
            onClick={() => router.push(`/seller/products/${product.product_id}/edit`)}
            className="px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
          >
            Edit Product
          </button>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Images Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Product Images</h2>
            <div className="grid grid-cols-2 gap-3">
              {product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0 ? (
                product.image_urls.map((url, index) => {
                  const imageSrc = url.startsWith('http') ? url : `https://api-doba.techgenesismw.com${url}`
                  return (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={imageSrc} 
                        alt={`${product.product_name} ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"%3E%3Cpath fill="%23999" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  )
                })
              ) : (
                <div className="col-span-2 aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  <p className="text-sm text-gray-500">No images available</p>
                </div>
              )}
            </div>
            {product.image_urls && Array.isArray(product.image_urls) && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                {product.image_urls.length} image{product.image_urls.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          {/* Information Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Product Information</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Product Name</p>
                  <p className="text-base font-semibold text-gray-900">{product.product_name}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-700">{product.description || 'No description provided'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Category</p>
                    <p className="text-sm font-semibold text-gray-900">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Shop</p>
                    <p className="text-sm font-semibold text-gray-900">{product.shop_name || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Price</p>
                  <p className="text-lg font-semibold text-teal-700">MWK {product.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                  <p className="text-sm font-semibold text-gray-900">{product.weight_kg} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Stock Quantity</p>
                  <p className={`text-sm font-semibold ${product.stock_quantity <= product.min_stock_level ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock_quantity} units
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Min Stock Level</p>
                  <p className="text-sm font-semibold text-gray-900">{product.min_stock_level} units</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Product Status</h2>
                <p className="text-sm text-gray-500 mb-4">Toggle product listing status</p>
                
                <div className="space-y-2">
                  <label className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer hover:bg-gray-50 ${
                    product.is_active 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="product-status"
                      checked={product.is_active}
                      onChange={() => updateProductStatus(true)}
                      disabled={isUpdatingStatus}
                      className="w-4 h-4 text-teal-700 focus:ring-teal-500 disabled:opacity-50"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Active</span>
                      <p className="text-xs text-gray-500">Product is visible to customers</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer hover:bg-gray-50 ${
                    !product.is_active 
                      ? 'border-gray-500 bg-gray-50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="product-status"
                      checked={!product.is_active}
                      onChange={() => updateProductStatus(false)}
                      disabled={isUpdatingStatus}
                      className="w-4 h-4 text-gray-600 focus:ring-gray-500 disabled:opacity-50"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Inactive</span>
                      <p className="text-xs text-gray-500">Product is hidden from customers</p>
                    </div>
                  </label>
                </div>
                
                {isUpdatingStatus && (
                  <div className="mt-3 flex items-center text-gray-600">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm">Updating status...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
