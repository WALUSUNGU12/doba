'use client'

import { useState, useEffect } from 'react'
import { useCartWithNotifications } from '@/hooks/useCartWithNotifications'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

// Image Carousel Component
const ProductImageCarousel = ({ image_urls, product_name }: { image_urls: string[]; product_name: string }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!image_urls || image_urls.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
    )
  }

  const handlePrev = () => setCurrentImageIndex(p => (p === 0 ? image_urls.length - 1 : p - 1))
  const handleNext = () => setCurrentImageIndex(p => (p === image_urls.length - 1 ? 0 : p + 1))

  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e
    const startX = touch.clientX
    let isDragging = true
    const handleMove = (moveEvent: TouchEvent | MouseEvent) => {
      if (!isDragging) return
      const currentX = 'clientX' in moveEvent ? moveEvent.clientX : (moveEvent as TouchEvent).touches[0].clientX
      const diff = startX - currentX
      if (Math.abs(diff) > 50) {
        isDragging = false
        diff > 0 ? handleNext() : handlePrev()
      }
    }
    const handleEnd = () => {
      isDragging = false
      document.removeEventListener('mousemove', handleMove as any)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove as any)
      document.removeEventListener('touchend', handleEnd)
    }
    document.addEventListener('mousemove', handleMove as any)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove as any)
    document.addEventListener('touchend', handleEnd)
  }

  const currentImage = image_urls[currentImageIndex]
  const imageSrc = currentImage.startsWith('http') ? currentImage : `https://api-doba.techgenesismw.com${currentImage}`

  return (
    <div className="relative w-full h-full group">
      <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing" onMouseDown={handleSwipeStart} onTouchStart={handleSwipeStart}>
        <img src={imageSrc} alt={`${product_name} - ${currentImageIndex + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable={false} />
      </div>
      {image_urls.length > 1 && (
        <>
          <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" aria-label="Previous image">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" aria-label="Next image">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {image_urls.map((_, i) => (
              <button key={i} onClick={() => setCurrentImageIndex(i)} className={`h-1 rounded-full transition-all ${i === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} aria-label={`Image ${i + 1}`} />
            ))}
          </div>
          <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
            {currentImageIndex + 1}/{image_urls.length}
          </div>
        </>
      )}
    </div>
  )
}

interface Product {
  product_id: number
  shop_id: number
  product_name: string
  description: string
  price: number
  weight_kg?: number
  category: string
  stock_quantity: number
  image_urls: string[]
  is_active: boolean
  created_at: string
  shop_name?: string
  seller_name?: string
}

interface Shop {
  shop_id: number
  shop_name: string
  category: string
  address: string
  is_active: boolean
  banner_url?: string | null
}

const categories = [
  { id: 'all', name: 'All' },
  { id: 'Electronics', name: 'Electronics' },
  { id: 'Fashion', name: 'Fashion' },
  { id: 'Home & Garden', name: 'Home & Garden' },
  { id: 'Books', name: 'Books' },
  { id: 'Health & Beauty', name: 'Health & Beauty' },
  { id: 'Sports', name: 'Sports' },
]

export default function MarketplacePage() {
  const { addItem } = useCartWithNotifications()
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch('https://api-doba.techgenesismw.com/api/products'),
          fetch('https://api-doba.techgenesismw.com/api/shops'),
        ])
        if (pRes.ok) { const d = await pRes.json(); setProducts(d.data || []); setFilteredProducts(d.data || []) }
        if (sRes.ok) { const d = await sRes.json(); setShops(d.data || []) }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    let filtered = products
    if (searchTerm) filtered = filtered.filter(p => p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    if (selectedCategory !== 'all') filtered = filtered.filter(p => p.category === selectedCategory)
    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading marketplace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="pt-16">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-2">Mzuzu Marketplace</p>
                <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
                <p className="text-gray-500 mt-1 text-sm">Discover unique offerings from local merchants</p>
              </div>
              <Link href="/cart" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                View Cart
              </Link>
            </div>

            {/* Search + filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-teal-700 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Shops row */}
          {shops.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">Verified Merchants</h2>
                <span className="text-xs text-gray-400">{shops.length} active shops</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {shops.slice(0, 4).map(shop => (
                  <Link
                    key={shop.shop_id}
                    href={`/shop/${shop.shop_id}`}
                    className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-teal-200 transition-colors"
                  >
                    <div className="h-24 relative overflow-hidden bg-gray-50">
                      {shop.banner_url ? (
                        <img src={`https://api-doba.techgenesismw.com${shop.banner_url}`} alt={shop.shop_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            {shop.shop_name.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-700 transition-colors">{shop.shop_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{shop.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Products grid */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'All Products' : selectedCategory}
              </h2>
              <span className="text-xs text-gray-400">{filteredProducts.length} products</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No products found</h3>
                <p className="text-sm text-gray-500 mb-5">Try adjusting your search or filters</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all') }}
                  className="px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map(product => (
                  <Link
                    key={product.product_id}
                    href={`/marketplace/${product.product_id}`}
                    className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-teal-200 hover:shadow-sm transition-all"
                  >
                    {/* Image */}
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      <ProductImageCarousel image_urls={product.image_urls || []} product_name={product.product_name} />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 bg-white/90 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
                          {product.category}
                        </span>
                      </div>
                      {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full">Out of stock</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      {product.shop_name && (
                        <p className="text-xs text-teal-700 font-medium mb-1">{product.shop_name}</p>
                      )}
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-teal-700 transition-colors">
                        {product.product_name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-gray-900">MWK {product.price.toLocaleString()}</p>
                          {product.weight_kg && (
                            <p className="text-xs text-gray-400 mt-0.5">{product.weight_kg} kg</p>
                          )}
                        </div>
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); addItem(product, 1) }}
                          disabled={product.stock_quantity === 0}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            product.stock_quantity === 0
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-teal-700 text-white hover:bg-teal-600'
                          }`}
                          aria-label="Add to cart"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
