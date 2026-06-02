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
}

export default function EditProductPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    weight_kg: '',
    category: '',
    stock_quantity: '',
    min_stock_level: '5',
    is_active: true,
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

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
        const productData: Product = data.data
        setProduct(productData)
        setFormData({
          product_name: productData.product_name,
          description: productData.description || '',
          price: productData.price.toString(),
          weight_kg: productData.weight_kg ? productData.weight_kg.toString() : '',
          category: productData.category,
          stock_quantity: productData.stock_quantity.toString(),
          min_stock_level: productData.min_stock_level.toString(),
          is_active: productData.is_active,
        })
        if (productData.image_urls && productData.image_urls.length > 0) {
          setImagePreviews(productData.image_urls.map(url => `https://api-doba.techgenesismw.com${url}`))
        }
      } else {
        setMessage('Critical: Failed to load product data.')
      }
    } catch (error) {
      setMessage('Network error while fetching product.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const newImages = [...images]
    const newPreviews = [...imagePreviews]
    
    Array.from(files).forEach(file => {
      newImages.push(file)
      newPreviews.push(URL.createObjectURL(file))
    })
    
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const uploadImages = async () => {
    if (images.length === 0) {
      setMessage('No new images to upload')
      return
    }
    
    setIsUploading(true)
    const token = localStorage.getItem('token')
    
    try {
      const formData = new FormData()
      images.forEach(file => {
        formData.append('images', file)
      })
      
      const response = await fetch('https://api-doba.techgenesismw.com/api/upload/images', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newImageUrls = data.data.images || []
        // Combine existing images with new ones
        const allImageUrls = [...(product?.image_urls || []), ...newImageUrls]
        setProduct(prev => prev ? { ...prev, image_urls: allImageUrls } : null)
        setImages([])
        setMessage('Images uploaded successfully!')
      } else {
        setMessage(data.message || 'Failed to upload images')
      }
      
    } catch (error) {
      console.error('Image upload error:', error)
      setMessage('Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          product_name: formData.product_name,
          description: formData.description,
          price: parseFloat(formData.price),
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          category: formData.category,
          stock_quantity: parseInt(formData.stock_quantity),
          min_stock_level: parseInt(formData.min_stock_level),
          is_active: formData.is_active,
          image_urls: product?.image_urls || [],
        }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Success! Product updated.')
        setTimeout(() => router.push('/seller/products'), 1500)
      } else {
        setMessage(data.error || 'Update failed. Check inputs.')
      }
    } catch (error) {
      setMessage('Failed to update product.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Permanent Action: Are you sure you want to delete this listing?')) return
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      })
      if (response.ok) router.push('/seller/products')
    } catch (error) {
      setMessage('Deletion failed.')
    }
  }

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books',
    'Health & Beauty', 'Toys', 'Food & Beverages', 'Automotive', 'Other'
  ]

  if (isLoading) {
    return (
      <DashboardLayout role="seller" title="Edit Listing">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading product...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="seller" title="Edit Listing">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <button onClick={() => router.push('/seller/products')} className="mb-2 flex items-center text-gray-600 text-sm font-semibold hover:text-gray-900 transition-colors">
                 <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                 </svg>
                 Back to Inventory
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Listing</h1>
              <p className="text-sm text-gray-500">Modify product details and manage stock for #{productId}</p>
           </div>
           <button onClick={handleDelete} className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete Product
           </button>
        </div>

        {message && (
          <div className={`mb-6 flex items-center gap-2.5 p-3.5 rounded-lg text-sm animate-in fade-in zoom-in-95 ${message.includes('Success') ? 'bg-teal-50 border border-teal-200 text-teal-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {message.includes('Success') ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
           {/* Core Details */}
           <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                   <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                   </svg>
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">Core Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Listing Name</label>
                    <input
                      type="text"
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                 </div>
                 <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                 </div>
              </div>
           </section>

           {/* Product Images */}
           <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                   <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                   </svg>
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">Product Images</h2>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-2">
                  Current images: {imagePreviews.length}
                </div>
                
                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <label 
                    htmlFor="image-upload-edit" 
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-semibold text-sm">Add More Images</span>
                    <span className="text-gray-500 text-xs">Click to upload additional images</span>
                  </label>
                </div>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Product image ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload Button */}
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={uploadImages}
                    disabled={isUploading}
                    className="w-full py-2.5 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Uploading Images...' : `Upload ${images.length} New Image${images.length !== 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
           </section>

           {/* Financials & Specs */}
           <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                   <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 </div>
                 <h2 className="text-lg font-bold text-gray-900">Price & Specs</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Base Price (MWK)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Weight (KG)</label>
                    <input
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      min="0"
                      step="0.001"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                 </div>
              </div>
           </section>

           {/* Inventory Management */}
           <section className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-6 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1m1-1l-1 1m7.5-7.5-7.5 7.5" />
                   </svg>
                 </div>
                 <h2 className="text-lg font-bold text-white">Inventory Controls</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-teal-100">Current Stock</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                      min="0"
                      className="w-full px-3.5 py-2.5 text-sm border border-white/20 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/60"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-teal-100">Min. Threshold</label>
                    <input
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                      required
                      min="0"
                      className="w-full px-3.5 py-2.5 text-sm border border-white/20 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/60"
                    />
                 </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                 <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded bg-white/10 border-0 focus:ring-0 focus:ring-offset-0 focus:ring-offset-teal-700 text-teal-700"
                    />
                    <label className="ml-3 text-sm font-semibold text-white">Active & Discoverable</label>
                 </div>
              </div>
           </section>

           {/* Submit Actions */}
           <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push('/seller/products')}
                className="flex-1 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-[2] py-2.5 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Updating...' : 'Save Changes'}
              </button>
           </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
