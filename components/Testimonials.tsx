'use client'

import { useState, useEffect } from 'react'

const testimonials = [
  {
    id: 1,
    name: 'Grace Banda',
    role: 'Regular Customer',
    content: 'DOBADoba has completely changed how I shop in Mzuzu. I can find everything I need from local sellers and get it delivered right to my doorstep! The GPS tracking gives me peace of mind.',
    rating: 5,
    avatar: 'GB',
    gradient: 'from-emerald-500 to-blue-600'
  },
  {
    id: 2,
    name: 'James Phiri',
    role: 'Local Seller',
    content: 'As a small business owner, DOBADoba has helped me reach more customers in Mzuzu. The GPS tracking feature gives buyers confidence in my delivery service. My sales have increased by 300%!',
    rating: 5,
    avatar: 'JP',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 3,
    name: 'Amina Kamanga',
    role: 'Customer',
    content: 'I love supporting local businesses through DOBADoba. The platform is easy to use and the delivery service is reliable. The payment options are convenient too. Highly recommend!',
    rating: 5,
    avatar: 'AK',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 4,
    name: 'Peter Mwale',
    role: 'Courier Partner',
    content: 'Joining DOBADoba as a courier has been life-changing. The app makes it easy to find deliveries and the GPS tracking ensures transparency. Great platform!',
    rating: 5,
    avatar: 'PM',
    gradient: 'from-cyan-500 to-teal-600'
  }
]

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, testimonials.length])

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const goToTestimonial = (index: number) => {
    setActiveIndex(index)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-40 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Customer Stories
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">What Our Users Say</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Hear from real people who are already using DOBADoba to connect, trade, and grow their businesses in Mzuzu
          </p>
        </div>

        {/* Testimonials carousel */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Main testimonial card */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonials[activeIndex].gradient} opacity-5`}></div>
              
              {/* Quote icon */}
              <div className="relative mb-8">
                <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <div className="relative z-10">
                {/* Content */}
                <blockquote className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
                  "{testimonials[activeIndex].content}"
                </blockquote>

                {/* Rating */}
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Author info */}
                <div className="flex items-center justify-center space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${testimonials[activeIndex].gradient} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {testimonials[activeIndex].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-lg">
                      {testimonials[activeIndex].name}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[activeIndex].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 hover:scale-110"
              aria-label="Previous testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 hover:scale-110"
              aria-label="Next testimonial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeIndex 
                    ? 'w-8 h-3 bg-gradient-to-r from-emerald-500 to-blue-600' 
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAutoPlaying ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                )}
              </svg>
              <span>{isAutoPlaying ? 'Pause' : 'Play'} slideshow</span>
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6 text-lg">
            Ready to join our community of happy users?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="btn-primary text-lg px-8 py-4"
            >
              Get Started Now
            </a>
            <a
              href="/marketplace"
              className="btn-secondary text-lg px-8 py-4"
            >
              Browse Stories
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
