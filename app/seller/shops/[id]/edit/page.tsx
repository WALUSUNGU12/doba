'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
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

export default function EditShopPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const shopId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [shop, setShop] = useState<Shop | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    banner_url: '',
  })

  useEffect(() => {
    if (user && user.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    loadShop()
  }, [user, router, shopId])

  const loadShop = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      const res = await fetch(`https://api-doba.techgenesismw.com/api/shops/${shopId}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const shopData: Shop = data.data
        setShop(shopData)
        setFormData({
          description: shopData.description || '',
          banner_url: shopData.banner_url || '',
        })
      } else {
        setMessage('Failed to load shop data.')
      }
    } catch (error) {
      setMessage('Network error while fetching shop.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setMessage('')
    const token = localStorage.getItem('token')
    
    const formData = new FormData()
    formData.append('banner_image', file)

    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/upload/shop-banner', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, banner_url: data.data.banner_url }))
        setMessage('Banner uploaded successfully!')
      } else {
        setMessage(data.message || 'Failed to upload banner')
      }
    } catch (error) {
      setMessage('Failed to upload banner')
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
      const response = await fetch(`https://api-doba.techgenesismw.com/api/shops/${shopId}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          description: formData.description,
          banner_url: formData.banner_url,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Success! Shop updated.')
        setTimeout(() => router.push('/seller/shops'), 1500)
      } else {
        setMessage(data.message || 'Update failed.')
      }
    } catch (error) {
      setMessage('Failed to update shop.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="seller" title="Edit Shop">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading shop...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!shop) {
    return (
      <DashboardLayout role="seller" title="Edit Shop">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 text-sm font-semibold">Shop not found</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="seller" title="Edit Shop">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => router.push('/seller/shops')} 
              className="mb-2 flex items-center text-gray-600 text-sm font-semibold hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Shops
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Shop Details</h1>
            <p className="text-sm text-gray-500">Update description and banner for {shop.shop_name}</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 flex items-center gap-2.5 p-3.5 rounded-lg text-sm animate-in fade-in zoom-in-95 ${
            message.includes('Success') ? 'bg-teal-50 border border-teal-200 text-teal-700' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
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
          {/* Banner Image Section */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Shop Banner</h2>
            </div>

            <div className="space-y-4">
              {/* Current Banner Preview */}
              {formData.banner_url && (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-400 uppercase tracking-wider">Current Banner</label>
                  <div className="relative h-40 rounded-lg overflow-hidden">
                    <img 
                      src={`https://api-doba.techgenesismw.com${formData.banner_url}`} 
                      alt="Shop banner" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload New Banner */}
              <div className="space-y-2">
                <label className="block text-xs text-gray-400 uppercase tracking-wider">Upload New Banner</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className={`block w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-teal-500 transition-all text-sm text-gray-700 text-center ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? 'Uploading...' : 'Click to upload banner image'}
                  </label>
                </div>
                <p className="text-xs text-gray-500 text-center">Recommended size: 1920x400px. Max file size: 5MB</p>
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Shop Description</h2>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-gray-400 uppercase tracking-wider">About Your Shop</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                placeholder="Tell customers about your shop, what you sell, and what makes you special..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <p className="text-xs text-gray-500 text-right">{formData.description.length} characters</p>
            </div>
          </section>

          {/* Submit Actions */}
          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push('/seller/shops')}
              className="flex-1 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
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
