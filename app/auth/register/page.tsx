'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type FieldErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
  code?: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [verificationStep, setVerificationStep] = useState(false)
  const [userCode, setUserCode] = useState('')
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)
  const router = useRouter()

  const validateStep1 = (): FieldErrors => {
    const e: FieldErrors = {}
    if (!formData.name.trim()) e.name = 'Full name is required'
    if (!formData.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email address'
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 8) e.password = 'Password must be at least 8 characters'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      e.password = 'Must include uppercase, lowercase, and a number'
    if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!termsAccepted) e.terms = 'You must accept the terms to continue'
    return e
  }

  const validateCode = (): FieldErrors => {
    const e: FieldErrors = {}
    if (!userCode.trim()) e.code = 'Verification code is required'
    else if (userCode.trim().length !== 6) e.code = 'Code must be 6 digits'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    if (!verificationStep) {
      const errs = validateStep1()
      if (Object.keys(errs).length) { setErrors(errs); return }
      setErrors({})
      setIsLoading(true)
      try {
        const nameParts = formData.name.trim().split(' ')
        const firstName = nameParts[0] || 'User'
        const lastName = nameParts.slice(1).join(' ') || 'Customer'
        const response = await fetch('https://api-doba.techgenesismw.com/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.email,
            email: formData.email,
            password: formData.password,
            role: 'customer',
            first_name: firstName,
            last_name: lastName,
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Registration failed')
        if (data.data?.requiresVerification) {
          setRegisteredUserId(data.data.user.user_id)
          setVerificationStep(true)
        } else {
          router.push('/auth/login')
        }
      } catch (err: any) {
        setServerError(err.message || 'Registration failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    } else {
      const errs = validateCode()
      if (Object.keys(errs).length) { setErrors(errs); return }
      setErrors({})
      setIsLoading(true)
      try {
        const response = await fetch('https://api-doba.techgenesismw.com/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: registeredUserId, code: userCode }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Verification failed')
        router.push('/auth/login')
      } catch (err: any) {
        setServerError(err.message || 'Verification failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleResendCode = async () => {
    if (!registeredUserId) return
    setIsLoading(true)
    setResendSuccess(false)
    try {
      const response = await fetch('https://api-doba.techgenesismw.com/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: registeredUserId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to resend code')
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 4000)
    } catch (err: any) {
      setServerError(err.message || 'Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FieldErrors]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        {msg}
      </p>
    ) : null

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DOBADoba</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {verificationStep ? 'Verify your email' : 'Create your account'}
          </h1>
          <p className="text-sm text-gray-500">
            {verificationStep
              ? `We sent a 6-digit code to ${formData.email}`
              : 'Join Mzuzu\'s local marketplace today'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {serverError}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verification code resent. Check your email.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {!verificationStep ? (
              <>
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                  <input id="name" name="name" type="text" autoComplete="name" value={formData.name} onChange={handleChange} placeholder="John Banda" className={inputClass('name')} />
                  <FieldError msg={errors.name} />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputClass('email')} />
                  <FieldError msg={errors.email} />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" className={`${inputClass('password')} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle password">
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                  <FieldError msg={errors.password} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                  <div className="relative">
                    <input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" className={`${inputClass('confirmPassword')} pr-10`} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle confirm password">
                      {showConfirm ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                  <FieldError msg={errors.confirmPassword} />
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => { setTermsAccepted(e.target.checked); if (errors.terms) setErrors(prev => ({ ...prev, terms: undefined })) }}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="#" className="text-teal-700 hover:text-teal-800 font-medium">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-teal-700 hover:text-teal-800 font-medium">Privacy Policy</a>
                    </span>
                  </label>
                  <FieldError msg={errors.terms} />
                </div>
              </>
            ) : (
              /* Verification step */
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">Verification code</label>
                <input
                  id="code"
                  type="text"
                  value={userCode}
                  onChange={e => { setUserCode(e.target.value); if (errors.code) setErrors(prev => ({ ...prev, code: undefined })) }}
                  placeholder="000000"
                  maxLength={6}
                  className={`${inputClass('code')} text-center text-xl font-mono tracking-widest`}
                />
                <FieldError msg={errors.code} />
                <p className="mt-3 text-sm text-center text-gray-500">
                  Didn't receive it?{' '}
                  <button type="button" onClick={handleResendCode} disabled={isLoading} className="font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-50 transition-colors">
                    Resend code
                  </button>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isLoading
                ? verificationStep ? 'Verifying...' : 'Creating account...'
                : verificationStep ? 'Verify Email' : 'Create Account'}
            </button>
          </form>

          {!verificationStep && (
            <p className="mt-5 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-teal-700 hover:text-teal-800 transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </div>

        {/* Benefits */}
        {!verificationStep && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Why join DOBADoba?</p>
            <div className="space-y-3">
              {[
                { title: 'Connect with Local Sellers', desc: 'Find trusted merchants in Mzuzu' },
                { title: 'GPS-Tracked Delivery', desc: 'Track your orders in real-time' },
                { title: 'Secure Payments', desc: 'Safe and convenient transactions' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-teal-700 transition-colors inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
