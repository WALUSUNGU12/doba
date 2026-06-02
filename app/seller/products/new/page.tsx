'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Shop {
  shop_id: number
  shop_name: string
}

export default function NewProductPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingShops, setIsLoadingShops] = useState(true)
  const [shops, setShops] = useState<Shop[]>([])
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    shop_id: '',
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
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    loadShops()
  }, [user, router])

  const loadShops = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      const res = await fetch('https://api-doba.techgenesismw.com/api/shops/my-shops', { headers })
      if (res.ok) {
        const data = await res.json()
        setShops(data.data || [])
        if (data.data && data.data.length > 0) {
          setFormData(prev => ({ ...prev, shop_id: data.data[0].shop_id.toString() }))
        }
      }
    } catch (error) {
      console.error('Error loading shops:', error)
    } finally {
      setIsLoadingShops(false)
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
    if (images.length < 3) {
      setMessage('Please upload at least 3 images for your product')
      return []
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
        // Ensure image URLs are in the correct format (array of strings)
        const imageUrls = data.data.images || []
        console.log('Uploaded image URLs:', imageUrls) // Debug log
        
        // Validate that image URLs are in the correct format
        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
          // Update form data with image URLs
          setFormData(prev => ({ ...prev, image_urls: imageUrls }))
          setMessage('Images uploaded successfully!')
          return imageUrls // Return the image URLs
        } else {
          setMessage('Invalid image format received from server')
          return []
        }
      } else {
        setMessage(data.message || 'Failed to upload images')
        return []
      }
      
    } catch (error) {
      console.error('Image upload error:', error)
      setMessage('Failed to upload images')
      return []
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (images.length < 3) {
      setMessage('Please upload at least 3 images before submitting')
      return
    }
    
    setIsLoading(true)
    setMessage('')
    const token = localStorage.getItem('token')
    
    try {
      // Upload images and get the returned URLs
      let uploadedImageUrls = (formData as any).image_urls || []
      if (images.length > 0) {
        uploadedImageUrls = await uploadImages()
      }
      
      const response = await fetch('https://api-doba.techgenesismw.com/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          shop_id: parseInt(formData.shop_id),
          product_name: formData.product_name,
          description: formData.description,
          price: parseFloat(formData.price),
          weight_kg: parseFloat(formData.weight_kg),
          category: formData.category,
          stock_quantity: parseInt(formData.stock_quantity),
          min_stock_level: parseInt(formData.min_stock_level),
          is_active: formData.is_active,
          image_urls: uploadedImageUrls,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Success! Product has been listed.')
        setTimeout(() => router.push('/seller/products'), 1500)
      } else {
        setMessage(data.error || 'Validation error. Please check your inputs.')
      }
    } catch (error) {
      setMessage('Network error. Failed to list product.')
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books',
    'Health & Beauty', 'Toys', 'Food & Beverages', 'Automotive', 'Other'
  ]

  if (isLoadingShops) {
    return (
      <DashboardLayout role="seller" title="New Product">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading shops...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="seller" title="New Product">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Listing</h1>
              <p className="text-sm text-gray-500">Add a new item to your product catalog</p>
           </div>
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

        {shops.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">No Shop Found</h2>
            <p className="text-sm text-gray-500 mb-4">You must have an active shop before listing products.</p>
            <button onClick={() => router.push('/seller/shops')} className="px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors">Register a Shop</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pb-12">
             {/* Core Details */}
             <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                     </svg>
                   </div>
                   <h2 className="text-lg font-bold text-gray-900">Product Essentials</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Target Shop</label>
                      <select
                        value={formData.shop_id}
                        onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {shops.map((shop) => (
                          <option key={shop.shop_id} value={shop.shop_id}>{shop.shop_name}</option>
                        ))}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Listing Name</label>
                      <input
                        type="text"
                        value={formData.product_name}
                        onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                        required
                        placeholder="e.g. Premium Mzuzu Coffee"
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                   </div>
                   <div className="md:col-span-2 space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        placeholder="Detail your product's key features, materials, and benefits..."
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
                    <span className="text-red-500 font-semibold">*</span> Minimum 3 images required
                  </div>
                   
                  {/* Image Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-semibold text-sm">Click to upload images</span>
                      <span className="text-gray-500 text-xs">or drag and drop</span>
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
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:border-teal-400 transition-colors"
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
                  
                  {/* Upload Status */}
                  {images.length > 0 && images.length < 3 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        {images.length}/3 images uploaded. Please add {3 - images.length} more image{3 - images.length !== 1 ? 's' : ''}.
                      </p>
                    </div>
                  )}
                  
                  {images.length >= 3 && (
                    <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                      <p className="text-teal-800 text-sm">
                        ✓ Minimum image requirement met! You have {images.length} images uploaded.
                      </p>
                    </div>
                  )}
                </div>
             </section>

             {/* Specifications */}
             <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4 0.75m4-6.75c0 1.472-.265 2.882-.75 4m0 0c1.472 0 2.882-.265 4-.75m-4 6.75c0 1.472.265 2.882.75 4m-13.5 0a1.5 1.5 0 013 0 1.5 1.5 0 010-3z" />
                     </svg>
                   </div>
                   <h2 className="text-lg font-bold text-gray-900">Specs & Pricing</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Base Price (MWK)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        min="0"
                        placeholder="0.00"
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Weight (KG)</label>
                      <input
                        type="number"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                        required
                        min="0"
                        step="0.001"
                        placeholder="0.000"
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                   </div>
                </div>
             </section>

             {/* Inventory Tracking */}
             <section className="bg-teal-700 rounded-xl border border-teal-700 shadow-sm p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1m1-1l-1 1m7.5-7.5-7.5 7.5" />
                     </svg>
                   </div>
                   <h2 className="text-lg font-bold text-white">Inventory Guard</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-teal-100">Initial Quantity</label>
                      <input
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        required
                        min="0"
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 text-sm border border-white/20 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/60"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-teal-100">Alert Threshold</label>
                      <input
                        type="number"
                        value={formData.min_stock_level}
                        onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                        required
                        min="0"
                        placeholder="5"
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
                      <label className="ml-3 text-sm font-semibold text-white">Enable listing immediately</label>
                   </div>
                </div>
             </section>

             {/* Action Bar */}
             <div className="flex flex-col md:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/seller/products')}
                  className="flex-1 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-2.5 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Publish Listing'}
                </button>
             </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
