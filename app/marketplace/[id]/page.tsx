'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useCartWithNotifications } from '@/hooks/useCartWithNotifications'
import Link from 'next/link'

// Product Detail Carousel Component
const ProductDetailCarousel = ({ 
  image_urls, 
  product_name, 
  selectedImage, 
  onImageChange 
}: { 
  image_urls: string[]
  product_name: string
  selectedImage: number
  onImageChange: (index: number) => void
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handlePrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    const newIndex = selectedImage === 0 ? image_urls.length - 1 : selectedImage - 1
    onImageChange(newIndex)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    const newIndex = selectedImage === image_urls.length - 1 ? 0 : selectedImage + 1
    onImageChange(newIndex)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e
    const startX = touch.clientX
    let isDragging = true

    const handleSwipeMove = (moveEvent: TouchEvent | MouseEvent) => {
      if (!isDragging) return
      const currentX = 'clientX' in moveEvent ? moveEvent.clientX : (moveEvent as TouchEvent).touches[0].clientX
      const diff = startX - currentX
      
      if (Math.abs(diff) > 50) {
        isDragging = false
        if (diff > 0) {
          handleNext()
        } else {
          handlePrevious()
        }
      }
    }

    const handleSwipeEnd = () => {
      isDragging = false
      document.removeEventListener('mousemove', handleSwipeMove as any)
      document.removeEventListener('mouseup', handleSwipeEnd)
      document.removeEventListener('touchmove', handleSwipeMove as any)
      document.removeEventListener('touchend', handleSwipeEnd)
    }

    document.addEventListener('mousemove', handleSwipeMove as any)
    document.addEventListener('mouseup', handleSwipeEnd)
    document.addEventListener('touchmove', handleSwipeMove as any)
    document.addEventListener('touchend', handleSwipeEnd)
  }

  const currentImage = image_urls[selectedImage]
  const imageSrc = currentImage.startsWith('http') ? currentImage : `https://api-doba.techgenesismw.com${currentImage}`

  return (
    <div className="relative w-full h-full group">
      {/* Main Image */}
      <div 
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleSwipeStart}
        onTouchStart={handleSwipeStart}
      >
        <img 
          src={imageSrc} 
          alt={`${product_name} - Image ${selectedImage + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isTransitioning ? 'opacity-80' : 'opacity-100'
          }`}
          draggable={false}
        />
      </div>

      {/* Navigation Arrows */}
      {image_urls.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 shadow-lg"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 shadow-lg"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image Counter */}
      {image_urls.length > 1 && (
        <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-white text-sm font-black uppercase tracking-wider">
            {selectedImage + 1} / {image_urls.length}
          </span>
        </div>
      )}

      {/* Dot Indicators */}
      {image_urls.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {image_urls.map((_, index) => (
            <button
              key={index}
              onClick={() => onImageChange(index)}
              className={`transition-all ${
                index === selectedImage 
                  ? 'w-8 h-2 bg-white rounded-full' 
                  : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

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
  address: string
  phone: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const { addItem } = useCartWithNotifications()
  const [product, setProduct] = useState<Product | null>(null)
  const [shop, setShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    const productId = params.id as string
    try {
      const response = await fetch(`https://api-doba.techgenesismw.com/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.data)
        if (data.data?.shop_id) {
          const shopRes = await fetch(`https://api-doba.techgenesismw.com/api/shops/${data.data.shop_id}`)
          if (shopRes.ok) {
            const shopData = await shopRes.json()
            setShop(shopData.data)
          }
        }
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Product not found</h3>
          <Link href="/dashboard/marketplace" className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl inline-block mt-6 hover:bg-emerald-600">
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Back Button */}
      <div className="lg:hidden p-4 bg-white border-b sticky top-0 z-20">
        <Link href="/dashboard/marketplace" className="inline-flex items-center text-gray-900 font-black text-xs uppercase tracking-widest">
          <span className="mr-2">←</span> Back
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Visuals Column */}
          <div className="space-y-6">
            {/* Main Image Carousel */}
            <div className="aspect-square bg-gray-50 rounded-[3rem] overflow-hidden relative border border-gray-100 shadow-inner group">
              {product.image_urls && product.image_urls.length > 0 ? (
                <ProductDetailCarousel 
                  image_urls={product.image_urls} 
                  product_name={product.product_name}
                  selectedImage={selectedImage}
                  onImageChange={setSelectedImage}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-gray-100 to-gray-200">
                  🛍️
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.image_urls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-2xl overflow-hidden border-3 transition-all hover:scale-105 ${
                      selectedImage === idx 
                        ? 'border-emerald-500 shadow-lg scale-105' 
                        : 'border-gray-200 opacity-70 hover:opacity-90 hover:border-emerald-300'
                    }`}
                  >
                    <img 
                      src={url.startsWith('http') ? url : `https://api-doba.techgenesismw.com${url}`} 
                      alt={`${product.product_name} - View ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="flex flex-col">
            <div className="mb-8">
              <Link href={`/shop/${product.shop_id}`} className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline mb-2 block">
                {product.shop_name}
              </Link>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">{product.product_name}</h1>
              <div className="flex items-center space-x-3 mb-6">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {product.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  product.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 mb-8">MWK {product.price.toLocaleString()}</p>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                {product.description}
              </p>
            </div>

            <div className="mt-auto space-y-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center bg-gray-100 rounded-2xl p-2">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center font-black text-gray-500 hover:text-gray-900"
                  >-</button>
                  <span className="w-12 text-center font-black text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center font-black text-gray-500 hover:text-gray-900"
                  >+</button>
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Total: MWK {(product.price * quantity).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => addItem(product, quantity)}
                disabled={product.stock_quantity === 0}
                className={`w-full py-5 rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl transition-all ${
                  product.stock_quantity === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-gray-900 text-white hover:bg-emerald-600 hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                {product.stock_quantity === 0 ? 'Sold Out' : 'Add to Shopping Bag'}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Seller Location</p>
                  <p className="text-sm font-bold text-gray-900">{shop?.address || 'Mzuzu'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Seller Phone</p>
                  <p className="text-sm font-bold text-gray-900">{shop?.phone || 'Private'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
