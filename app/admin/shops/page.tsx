'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

interface Shop {
  shop_id: number
  seller_id: number
  shop_name: string
  description: string
  category: string
  address: string
  phone: string
  email: string
  logo_url?: string
  banner_url?: string
  is_active: boolean
  created_at: string
  seller_name?: string
  seller_email?: string
  terminal_id?: number
  terminal_name?: string
}

interface Product {
  product_id: number
  shop_id: number
  product_name: string
  description: string
  price: number
  stock_quantity: number
  is_active: boolean
  category: string
  image_urls?: string[]
}

interface Seller {
  user_id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
}

interface Terminal {
  terminal_id: number
  name: string
  city: string
}

export default function AdminShopsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [shopProducts, setShopProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [selectedShopForProducts, setSelectedShopForProducts] = useState<Shop | null>(null)
  const [formData, setFormData] = useState({
    seller_id: '',
    shop_name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    logo_url: '',
    banner_url: '',
    is_active: true,
    terminal_id: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
    try {
      console.log('Loading admin shops...')
      const shopsResponse = await fetch('https://api-doba.techgenesismw.com/api/shops/admin', { headers })
      console.log('Shops response status:', shopsResponse.status)
      if (shopsResponse.ok) {
        const shopsData = await shopsResponse.json()
        console.log('Shops data:', shopsData)
        setShops(shopsData.data || [])
      } else {
        console.log('Shops response not ok:', shopsResponse.status)
      }
      
      const sellersResponse = await fetch('https://api-doba.techgenesismw.com/api/users?role=seller', { headers })
      if (sellersResponse.ok) {
        const sellersData = await sellersResponse.json()
        setSellers(sellersData.data || [])
      }

      const terminalsResponse = await fetch('https://api-doba.techgenesismw.com/api/terminals/public')
      if (terminalsResponse.ok) {
        const terminalsData = await terminalsResponse.json()
        setTerminals(terminalsData.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const token = localStorage.getItem('token')
    try {
      const method = editingShop ? 'PUT' : 'POST'
      const response = await fetch('https://api-doba.techgenesismw.com/api/shops' + (editingShop ? `/${editingShop.shop_id}` : ''), {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        setSuccess(editingShop ? 'Shop updated successfully!' : 'Shop created successfully!')
        setShowModal(false)
        resetForm()
        loadData()
      } else {
        setError(data.error || 'Failed to save shop')
      }
    } catch (error) {
      setError('Network error. Failed to save shop.')
    }
  }

  const loadShopProducts = async (shop: Shop) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/shops/${shop.shop_id}/products`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      })
      if (response.ok) {
        const data = await response.json()
        setShopProducts(data.data || [])
      }
    } catch (error) {
      console.error('Error loading shop products:', error)
    }
  }

  const toggleProductStatus = async (productId: number, isActive: boolean) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ is_active: isActive })
      })
      if (response.ok) {
        setShopProducts(shopProducts.map(p => 
          p.product_id === productId ? { ...p, is_active: isActive } : p
        ))
      }
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  const handleManageProducts = (shop: Shop) => {
    setSelectedShopForProducts(shop)
    setShowProductsModal(true)
    loadShopProducts(shop)
  }

  const toggleAllProducts = (isActive: boolean) => {
    const token = localStorage.getItem('token')
    shopProducts.forEach(product => {
      fetch(`https://api-doba.techgenesismw.com/api/products/${product.product_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ is_active: isActive })
      })
    })
    setShopProducts(shopProducts.map(p => ({ ...p, is_active: isActive })))
  }

  const toggleShopStatus = async (shop: Shop) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/shops/${shop.shop_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ is_active: !shop.is_active })
      })
      if (response.ok) {
        setShops(shops.map(s => 
          s.shop_id === shop.shop_id ? { ...s, is_active: !s.is_active } : s
        ))
      }
    } catch (error) {
      console.error('Error toggling shop status:', error)
    }
  }

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop)
    setFormData({
      seller_id: shop.seller_id.toString(),
      shop_name: shop.shop_name,
      description: shop.description,
      category: shop.category,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      logo_url: shop.logo_url || '',
      banner_url: shop.banner_url || '',
      is_active: shop.is_active,
      terminal_id: shop.terminal_id ? shop.terminal_id.toString() : ''
    })
    setShowModal(true)
  }

  const handleDelete = async (shopId: number) => {
    if (!confirm('Permanent Action: Are you sure you want to delete this shop?')) return
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/shops/${shopId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      })
      if (response.ok) {
        setSuccess('Shop deleted successfully!')
        loadData()
      }
    } catch (error) {
      setError('Failed to delete shop.')
    }
  }

  const resetForm = () => {
    setFormData({
      seller_id: '', shop_name: '', description: '', category: '',
      address: '', phone: '', email: '', logo_url: '', banner_url: '', is_active: true,
      terminal_id: ''
    })
    setEditingShop(null)
  }

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Shop Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading shops...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin" title="Shop Registry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Shop Registry</h1>
              <p className="text-sm text-gray-500">Oversee all registered outlets and merchant status</p>
           </div>
           <button 
             onClick={() => { resetForm(); setShowModal(true); }}
             className="px-6 py-2.5 bg-teal-700 text-white rounded-lg font-semibold text-sm hover:bg-teal-800 transition-colors"
           >
              Add New Shop
           </button>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-teal-700">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {shops.map((shop) => (
             <div key={shop.shop_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:border-teal-300 transition-all">
                {/* Banner Area */}
                <div className="h-32 bg-gray-100 relative overflow-hidden">
                   {shop.banner_url ? (
                     <img 
                       src={shop.banner_url.startsWith('http') ? shop.banner_url : `https://api-doba.techgenesismw.com${shop.banner_url}`} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                       alt={`${shop.shop_name} banner`} 
                     />
                   ) : (
                     <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
                       <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                       </svg>
                     </div>
                   )}
                   <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm ${shop.is_active ? 'bg-teal-700 text-white' : 'bg-red-600 text-white'}`}>
                         {shop.is_active ? 'Active' : 'Locked'}
                      </span>
                   </div>
                </div>

                <div className="p-6 relative">
                   {/* Logo / Icon */}
                   <div className="absolute -top-8 left-6 w-16 h-16 bg-white rounded-xl shadow-sm border-4 border-white flex items-center justify-center overflow-hidden">
                      {shop.logo_url ? (
                        <img 
                          src={shop.logo_url.startsWith('http') ? shop.logo_url : `https://api-doba.techgenesismw.com${shop.logo_url}`} 
                          className="w-full h-full object-cover" 
                          alt={`${shop.shop_name} logo`} 
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-900">{shop.shop_name.charAt(0)}</span>
                      )}
                   </div>

                   <div className="pt-8 space-y-3">
                      <div>
                         <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-700 transition-colors leading-tight">{shop.shop_name}</h3>
                         <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{shop.category || 'Uncategorized'}</p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 uppercase">Merchant</span>
                            <span className="text-xs font-semibold text-gray-900">{shop.seller_name}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 uppercase">Nearby Hub</span>
                            <span className="text-xs font-bold text-teal-700">{shop.terminal_name || 'Not Associated'}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 uppercase">Registered</span>
                            <span className="text-xs font-semibold text-gray-900">{new Date(shop.created_at).toLocaleDateString()}</span>
                         </div>
                      </div>

                      <div className="pt-3 flex gap-2">
                         <button onClick={() => handleEdit(shop)} className="flex-1 py-2 bg-gray-50 text-gray-600 hover:text-gray-900 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors">Edit Shop</button>
                         <button onClick={() => handleManageProducts(shop)} className="flex-1 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors">Manage Products</button>
                         <button 
                           onClick={() => toggleShopStatus(shop)} 
                           className={`px-3 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors ${
                             shop.is_active 
                               ? 'bg-red-600 text-white hover:bg-red-700' 
                               : 'bg-teal-700 text-white hover:bg-teal-800'
                           }`}
                         >
                           {shop.is_active ? 'Deactivate' : 'Activate'}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Modal Overlay */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-lg font-bold text-gray-900 mb-1">{editingShop ? 'Modify Shop' : 'Onboard Outlet'}</h2>
                <p className="text-sm text-gray-500 mb-6">Configure merchant details and operational status.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Select Merchant</label>
                         <select
                           value={formData.seller_id}
                           onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                           className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700 transition-all font-semibold text-gray-900 text-sm"
                           required
                         >
                           <option value="">Choose Seller</option>
                           {sellers.map((s) => <option key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Shop Label</label>
                         <input
                           type="text"
                           value={formData.shop_name}
                           onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                           className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700 transition-all font-semibold text-gray-900 text-sm"
                           required
                         />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Operational Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700 transition-all font-semibold text-gray-900 text-sm resize-none"
                        rows={2}
                        required
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Business Email</label>
                         <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700 transition-all font-semibold text-gray-900 text-sm" required />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Business Phone</label>
                         <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700 transition-all font-semibold text-gray-900 text-sm" required />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Nearby Terminal Hub</label>
                         <select
                           value={formData.terminal_id}
                           onChange={(e) => setFormData({ ...formData, terminal_id: e.target.value })}
                           className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700 transition-all font-semibold text-gray-900 text-sm bg-white"
                           required
                         >
                           <option value="">Choose Nearby Terminal</option>
                           {terminals.map((t) => (
                             <option key={t.terminal_id} value={t.terminal_id}>
                               {t.name} ({t.city})
                             </option>
                           ))}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs text-gray-400 uppercase tracking-wider ml-1">Shop Category</label>
                         <input 
                           type="text" 
                           placeholder="e.g. Electronics, Fashion"
                           value={formData.category} 
                           onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                           className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-teal-700 focus:ring-2 focus:ring-teal-700 transition-all font-semibold text-gray-900 text-sm" 
                           required 
                         />
                      </div>
                   </div>

                   <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <input 
                        type="checkbox" 
                        checked={formData.is_active} 
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 rounded text-teal-700 border-gray-300 focus:ring-teal-700"
                      />
                      <label className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Active & Live on Marketplace</label>
                   </div>

                   <button type="submit" className="w-full py-2.5 bg-teal-700 text-white rounded-lg font-semibold text-sm hover:bg-teal-800 transition-colors">
                      {editingShop ? 'Save Modification' : 'Complete Onboarding'}
                   </button>
                </form>
             </div>
          </div>
        )}

        {/* Products Management Modal */}
        {showProductsModal && selectedShopForProducts && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative">
              <button onClick={() => setShowProductsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Manage Products</h2>
                <p className="text-sm text-gray-500">Shop: {selectedShopForProducts.shop_name}</p>
              </div>

              <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">Total Products: {shopProducts.length}</span>
                  <span className="text-sm font-semibold text-teal-700">Active: {shopProducts.filter(p => p.is_active).length}</span>
                  <span className="text-sm font-semibold text-red-600">Inactive: {shopProducts.filter(p => !p.is_active).length}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllProducts(true)}
                    className="px-3 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 transition-colors"
                  >
                    Activate All
                  </button>
                  <button
                    onClick={() => toggleAllProducts(false)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                  >
                    Deactivate All
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {shopProducts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">No products found for this shop</p>
                  </div>
                ) : (
                  shopProducts.map((product) => (
                    <div key={product.product_id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-3">
                        {product.image_urls && product.image_urls.length > 0 && (
                          <img 
                            src={product.image_urls[0].startsWith('http') ? product.image_urls[0] : `https://api-doba.techgenesismw.com${product.image_urls[0]}`} 
                            className="w-12 h-12 object-cover rounded-lg" 
                            alt={product.product_name} 
                          />
                        )}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{product.product_name}</h4>
                          <p className="text-xs text-gray-500">{product.category}</p>
                          <p className="text-xs font-semibold text-teal-700">MWK {product.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.is_active 
                            ? 'bg-teal-50 text-teal-700' 
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => toggleProductStatus(product.product_id, !product.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            product.is_active
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-teal-700 text-white hover:bg-teal-800'
                          }`}
                        >
                          {product.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
