'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const slides = [
  {
    title: 'Marketplace &',
    highlight: 'Courier Service',
    description:
      'Shop from local stores and get instant delivery with our integrated courier system. One platform, complete shopping solution.',
  },
  {
    title: 'Buy Online,',
    highlight: 'Deliver Instantly',
    description:
      'Purchase items and track delivery in real-time. Our couriers ensure your orders reach you within hours, not days.',
  },
  {
    title: 'Local Shopping,',
    highlight: 'Same-Day Delivery',
    description:
      "Connect with Mzuzu's best sellers and get your items delivered immediately. Fast, reliable, GPS-tracked service.",
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length)
        setFading(false)
      }, 300)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goTo = (index: number) => {
    if (index === current) return
    setFading(true)
    setTimeout(() => {
      setCurrent(index)
      setFading(false)
    }, 300)
  }

  return (
    <section className="relative bg-gray-950 text-white overflow-hidden pt-16">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Teal glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-700/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-700/20 border border-teal-600/30 rounded-full text-teal-300 text-xs font-medium mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Marketplace &amp; Courier Service in One
        </div>

        {/* Headline */}
        <div
          className="transition-opacity duration-300"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-4">
            <span className="text-white">{slides[current].title}</span>
            <br />
            <span className="text-teal-400">{slides[current].highlight}</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
            {slides[current].description}
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
          >
            Shop &amp; Get Delivered
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/courier"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/15 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Track Order and Parcel
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 max-w-lg border-t border-white/10 pt-10">
          {[
            { value: '500+', label: 'Local Sellers' },
            { value: '50+', label: 'Active Couriers' },
            { value: '2-Hour', label: 'Avg. Delivery' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Slide indicators */}
        <div className="flex gap-2 mt-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-teal-400' : 'w-3 bg-white/25 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
