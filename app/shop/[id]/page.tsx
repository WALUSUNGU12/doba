'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/contexts/NotificationContext'
import Link from 'next/link'

interface Product {
  product_id: number
  product_name: string
  description: string
  price: number
  category: string
  image_urls: string[]
  shop_name: string
  shop_id: number
  stock_quantity: number
  is_active: boolean
  created_at: string
}

interface Shop {
  shop_id: number
  shop_name: string
  description: string
  category: string
  address: string
  phone: string
  email: string
  is_active: boolean
  created_at: string
}

export default function ShopDetailPage() {
  const params = useParams()
  const { addItem } = useCart()
  const { addNotification } = useNotification()
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Electronics', name: 'Electronics' },
    { id: 'Fashion', name: 'Fashion' },
    { id: 'Home & Garden', name: 'Home' },
    { id: 'Books', name: 'Books' },
    { id: 'Health & Beauty', name: 'Beauty' },
    { id: 'Sports', name: 'Sports' }
  ]

  useEffect(() => {
    loadShopData()
  }, [params.id])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, allProducts])

  const loadShopData = async () => {
    const shopId = params.id as string
    try {
      const shopRes = await fetch(`https://api-doba.techgenesismw.com/api/shops/${shopId}`)
      if (shopRes.ok) {
        const shopData = await shopRes.json()
        setShop(shopData.data)
      }
      const productsRes = await fetch(`https://api-doba.techgenesismw.com/api/products?shop_id=${shopId}`)
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setAllProducts(productsData.data || [])
        setProducts(productsData.data || [])
      }
    } catch (error) {
      console.error('Error loading shop data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...allProducts]
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    setProducts(filtered)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🏪</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Shop not found</h3>
          <p className="text-gray-500 font-medium mb-8">The shop you're looking for might have moved or closed.</p>
          <Link href="/marketplace" className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl inline-block transition-all hover:bg-emerald-600">
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cinematic Shop Header */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-blue-600/90 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <Link href="/marketplace" className="inline-flex items-center text-white/80 hover:text-white font-bold text-sm mb-8 uppercase tracking-widest transition-colors">
            <span className="mr-2">←</span> Marketplace
          </Link>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                {shop.shop_name.charAt(0)}
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-2">{shop.shop_name}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                    {shop.category}
                  </span>
                  <span className="flex items-center text-white/80 text-sm font-medium">
                    <span className="mr-2">📍</span> {shop.address}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a href={`tel:${shop.phone}`} className="px-6 py-3 bg-white text-gray-900 rounded-2xl font-black shadow-lg hover:scale-105 transition-all text-sm uppercase tracking-widest">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.72l1.13 2.257a1 1 0 001.21.502l4.493 1.498a1 1 0 00.684-.949L19 8.28a2 2 0 012-2V5z" />
                  </svg>
                  Call Shop
                </span>
              </a>
              <a href={`mailto:${shop.email}`} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all text-sm uppercase tracking-widest">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0l7.89-4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Shop
                </span>
              </a>
            </div>
          </div>
          
          <p className="mt-8 text-white/80 max-w-3xl text-lg leading-relaxed font-medium">
            {shop.description}
          </p>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 p-8 lg:p-12 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-600 font-medium text-lg">Get in touch with this shop directly</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0l4.244 4.243a1.998 1.998 0 002.829 0l4.244-4.243A8 8 0 0118 10a8 8 0 01-2.343 5.657l-4.244 4.243a1.998 1.998 0 01-2.829 0l-4.244-4.243A8 8 0 016 18z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Address</h3>
            <p className="text-gray-900 font-bold">{shop.address}</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.72l1.13 2.257a1 1 0 001.21.502l4.493 1.498a1 1 0 00.684-.949L19 8.28a2 2 0 012-2V5z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Phone</h3>
            <a href={`tel:${shop.phone}`} className="text-gray-900 font-bold hover:text-emerald-600 transition-colors">
              {shop.phone}
            </a>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0l7.89-4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Email</h3>
            <a href={`mailto:${shop.email}`} className="text-gray-900 font-bold hover:text-emerald-600 transition-colors break-all">
              {shop.email}
            </a>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3v4m0 0v-4l-3-3m3 3H9m3 0a2 2 0 002-2V4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2h3z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Business Hours</h3>
            <p className="text-gray-900 font-bold">Mon - Sat: 8:00 AM - 6:00 PM</p>
            <p className="text-gray-600 text-sm">Sunday: Closed</p>
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
          <div className="w-full lg:max-w-md relative group">
            <input
              type="text"
              placeholder="Search in this shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-2 border-transparent shadow-sm focus:border-emerald-500 focus:ring-0 transition-all font-bold"
            />
            <svg className="absolute left-4 top-4 w-6 h-6 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 w-full lg:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat.id 
                    ? 'bg-gray-900 text-white shadow-lg' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-emerald-200 shadow-sm'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => (
            <Link key={product.product_id} href={`/marketplace/${product.product_id}`} className="block">
              <div className="bg-white rounded-[2rem] shadow-md border border-gray-50 overflow-hidden hover:shadow-2xl transition-all group flex flex-col cursor-pointer">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={product.image_urls[0].startsWith('http') ? product.image_urls[0] : `https://api-doba.techgenesismw.com${product.image_urls[0]}`} 
                        alt={product.product_name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      {product.image_urls.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                          <span className="text-white text-[10px] font-black">+{product.image_urls.length - 1}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
                  )}
                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">{product.product_name}</h3>
                  <p className="text-sm font-medium text-gray-500 line-clamp-2 mb-4 h-10">{product.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
                      <p className="text-xl font-black text-gray-900">MWK {product.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addItem(product, 1)
                        addNotification(`${product.product_name} added to cart!`, 'success')
                      }}
                      disabled={product.stock_quantity === 0}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md ${
                        product.stock_quantity === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-900 text-white hover:bg-emerald-600 hover:scale-105'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="bg-white rounded-[2rem] p-16 text-center shadow-md">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No items found in this category</h3>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="text-emerald-600 font-black uppercase tracking-widest text-sm hover:underline mt-4"
            >
              Show all items
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
