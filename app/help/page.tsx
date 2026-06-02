'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const categories = [
    { id: 'all', name: 'All Topics', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'buying', name: 'Buying', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'selling', name: 'Selling', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'delivery', name: 'Delivery', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { id: 'account', name: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'payments', name: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  ]

  const faqs = [
    {
      id: 1,
      category: 'buying',
      question: 'How do I place an order on DOBADoba?',
      answer: 'To place an order, browse the marketplace, select the items you want to purchase, add them to your cart, and proceed to checkout. You\'ll need to provide your delivery address and payment information. Once your order is confirmed, you\'ll receive tracking information for your delivery.'
    },
    {
      id: 2,
      category: 'buying',
      question: 'Can I track my delivery?',
      answer: 'Yes! All deliveries on DOBADoba come with GPS tracking. You can track your package in real-time through your account dashboard or by using the tracking number provided in your order confirmation email.'
    },
    {
      id: 3,
      category: 'buying',
      question: 'What payment methods are accepted?',
      answer: 'We accept various payment methods including mobile money (Airtel Money, TNM Mpamba), bank transfers, and credit/debit cards. All payments are processed securely through our trusted payment partners.'
    },
    {
      id: 4,
      category: 'buying',
      question: 'How do I request a refund?',
      answer: 'If you need a refund, contact us through the support center or email info@dobadoba.com. Refunds are processed according to our refund policy and typically take 5-10 business days to reflect in your account.'
    },
    {
      id: 5,
      category: 'selling',
      question: 'How do I become a seller on DOBADoba?',
      answer: 'To become a seller, click "Become a Seller" on our homepage or visit /auth/register. You\'ll need to create an account, provide your business information, and verify your identity. Once approved, you can start listing your products immediately.'
    },
    {
      id: 6,
      category: 'selling',
      question: 'What are the seller fees?',
      answer: 'DOBADoba charges a commission fee on each sale, which varies by product category. There are no listing fees, and you only pay when you make a sale. Delivery fees are paid by the buyer unless you choose to offer free shipping.'
    },
    {
      id: 7,
      category: 'selling',
      question: 'How do I manage my inventory?',
      answer: 'You can manage your inventory through the seller dashboard. Add products, set prices, upload images, and track stock levels. The dashboard provides real-time analytics to help you optimize your sales.'
    },
    {
      id: 8,
      category: 'selling',
      question: 'How do I handle orders as a seller?',
      answer: 'When you receive an order, you\'ll be notified through the seller dashboard. Prepare the item, package it securely, and our courier will pick it up for delivery. You can track the delivery status and communicate with the buyer through the platform.'
    },
    {
      id: 9,
      category: 'delivery',
      question: 'How does delivery work?',
      answer: 'DOBADoba provides GPS-tracked courier services. Once you place an order, the seller prepares your item, and our courier picks it up for delivery. You can track your package in real-time and receive updates on its location and estimated arrival time.'
    },
    {
      id: 10,
      category: 'delivery',
      question: 'What are the delivery zones and fees?',
      answer: 'Delivery fees are calculated based on distance within Mzuzu. We have different zones with varying delivery times and fees. The exact fee is shown at checkout before you complete your order.'
    },
    {
      id: 11,
      category: 'delivery',
      question: 'How long does delivery take?',
      answer: 'Standard delivery within Mzuzu typically takes 1-3 business days depending on your location. Express delivery options are available for urgent orders with same-day or next-day delivery.'
    },
    {
      id: 12,
      category: 'delivery',
      question: 'What if I\'m not available when the courier arrives?',
      answer: 'If you\'re not available, the courier will attempt to contact you. You can reschedule delivery or arrange for someone else to receive the package. After multiple failed attempts, the package may be returned to the seller.'
    },
    {
      id: 13,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" on the homepage and provide your name, email, phone number, and create a password. You\'ll receive a verification code to confirm your account. Once verified, you can start using all features of DOBADoba.'
    },
    {
      id: 14,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      id: 15,
      category: 'account',
      question: 'Can I have multiple accounts?',
      answer: 'Each person should have only one account. However, you can use the same account for both buying and selling. If you need separate business accounts, please contact our support team for assistance.'
    },
    {
      id: 16,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to your account dashboard, click on "Profile Settings," and update your information. You can change your name, email, phone number, and delivery addresses. Some changes may require verification.'
    },
    {
      id: 17,
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption and secure payment gateways to protect your payment information. We never store your full card details on our servers, and all transactions are PCI-compliant.'
    },
    {
      id: 18,
      category: 'payments',
      question: 'How do I add a payment method?',
      answer: 'In your account dashboard, go to "Payment Methods" and add your preferred payment option. You can add multiple payment methods and choose which one to use for each purchase.'
    },
    {
      id: 19,
      category: 'payments',
      question: 'When will I be charged for my order?',
      answer: 'You\'ll be charged when you place your order and the payment is successfully processed. The amount will be held until the order is delivered, after which it\'s released to the seller (minus our commission fee).'
    },
    {
      id: 20,
      category: 'payments',
      question: 'What if my payment fails?',
      answer: 'If your payment fails, you\'ll receive an error message with details. Check that your payment method is valid and has sufficient funds. You can try again or use a different payment method. Contact support if the issue persists.'
    },
  ]

  const filteredFAQs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-teal-400 hover:text-teal-300 transition-colors mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-gray-400 text-lg">Find answers to common questions about DOBADoba</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full px-6 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
            />
            <svg className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/30'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={category.icon} />
                </svg>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <button
                onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-lg font-medium text-white pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-teal-400 flex-shrink-0 transition-transform ${
                    openFAQ === faq.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFAQ === faq.id && (
                <div className="px-6 pb-5 pt-0">
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Link href="/contact" className="bg-gradient-to-br from-teal-900/30 to-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-700/50 transition-colors group">
            <div className="w-12 h-12 bg-teal-700/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-700/30 transition-colors">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Contact Support</h3>
            <p className="text-gray-400 text-sm">Can't find what you're looking for? Reach out to our support team directly.</p>
          </Link>

          <Link href="/track" className="bg-gradient-to-br from-teal-900/30 to-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-700/50 transition-colors group">
            <div className="w-12 h-12 bg-teal-700/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-700/30 transition-colors">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Track Delivery</h3>
            <p className="text-gray-400 text-sm">Track your package in real-time with GPS tracking.</p>
          </Link>

          <Link href="/auth/register" className="bg-gradient-to-br from-teal-900/30 to-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-700/50 transition-colors group">
            <div className="w-12 h-12 bg-teal-700/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-700/30 transition-colors">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Become a Seller</h3>
            <p className="text-gray-400 text-sm">Start selling on DOBADoba and reach more customers.</p>
          </Link>
        </div>

        {/* Contact Information */}
        <section className="mt-16 bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Still Need Help?</h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Our support team is available to assist you with any questions or issues you may have.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-700/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <a href="mailto:info@dobadoba.com" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
                info@dobadoba.com
              </a>
              <p className="text-gray-500 text-sm mt-1">Email Support</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-teal-700/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <a href="tel:+265123456789" className="text-teal-400 hover:text-teal-300 transition-colors font-medium">
                +265 123 456 789
              </a>
              <p className="text-gray-500 text-sm mt-1">Phone Support</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-teal-700/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-teal-400 font-medium">24/7 Available</p>
              <p className="text-gray-500 text-sm mt-1">Response Time</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
