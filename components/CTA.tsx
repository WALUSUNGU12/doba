'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [emailError, setEmailError] = useState('')

  const validate = (value: string) => {
    if (!value) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate(email)
    if (err) {
      setEmailError(err)
      return
    }
    setEmailError('')
    // Simulate submission
    setStatus('success')
    setEmail('')
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">Join Our Community</p>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Ready to Join{' '}
              <span className="text-teal-400">Mzuzu's Marketplace?</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              Whether you're buying, selling, or delivering, DOBADoba connects our community with
              trusted local commerce solutions. Start your journey today.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Sign Up Now
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/15 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Track Your Order
              </Link>
            </div>

            {/* Trust items */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { label: 'Secure Platform', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                )},
                { label: 'Fast Setup', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                )},
                { label: 'Community First', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )},
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-teal-400 mx-auto mb-2">
                    {item.icon}
                  </div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — email signup */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-6">
              Get notified about new sellers, deals, and platform updates.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="cta-email" className="block text-xs font-medium text-gray-400 mb-1.5">
                  Email address
                </label>
                <input
                  id="cta-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError(validate(e.target.value))
                  }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 bg-white/10 border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                    emailError ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors"
              >
                Get Started
              </button>
            </form>

            {status === 'success' && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-teal-700/20 border border-teal-600/30 rounded-lg text-teal-300 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Thank you for your interest! We'll be in touch soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
