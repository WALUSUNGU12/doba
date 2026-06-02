'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

type Section = 'profile' | 'password'

type ProfileErrors = { first_name?: string; last_name?: string; phone?: string }
type PasswordErrors = { current_password?: string; new_password?: string; confirm_password?: string }

export default function ProfilePage() {
  const { user, updateUser, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({})

  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    if (isAuthLoading) return
    if (!user) { router.push('/auth/login'); return }
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
    })
  }, [user, isAuthLoading, router])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const validateProfile = (): ProfileErrors => {
    const e: ProfileErrors = {}
    if (!formData.first_name.trim()) e.first_name = 'First name is required'
    if (!formData.last_name.trim()) e.last_name = 'Last name is required'
    if (formData.phone && !/^\+?[\d\s\-()]{7,}$/.test(formData.phone)) e.phone = 'Enter a valid phone number'
    return e
  }

  const validatePassword = (): PasswordErrors => {
    const e: PasswordErrors = {}
    if (!passwordData.current_password) e.current_password = 'Current password is required'
    if (!passwordData.new_password) e.new_password = 'New password is required'
    else if (passwordData.new_password.length < 6) e.new_password = 'Password must be at least 6 characters'
    if (!passwordData.confirm_password) e.confirm_password = 'Please confirm your new password'
    else if (passwordData.new_password !== passwordData.confirm_password) e.confirm_password = 'Passwords do not match'
    return e
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateProfile()
    if (Object.keys(errs).length) { setProfileErrors(errs); return }
    setProfileErrors({})
    setIsLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('https://api-doba.techgenesismw.com/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', 'Profile updated successfully')
        if (updateUser) updateUser({ ...user, ...formData })
      } else {
        showToast('error', data.error || 'Failed to update profile')
      }
    } catch {
      showToast('error', 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validatePassword()
    if (Object.keys(errs).length) { setPasswordErrors(errs); return }
    setPasswordErrors({})
    setIsLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`https://api-doba.techgenesismw.com/api/users/${user?.user_id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ current_password: passwordData.current_password, new_password: passwordData.new_password }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', 'Password updated successfully')
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      } else {
        showToast('error', data.error || 'Failed to update password')
      }
    } catch {
      showToast('error', 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
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

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`

  const EyeIcon = ({ show }: { show: boolean }) =>
    show ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

  if (isAuthLoading || !user) {
    return (
      <DashboardLayout role="customer" title="Profile">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-7 h-7 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const initials = (user.first_name?.charAt(0) ?? '') + (user.last_name?.charAt(0) ?? '')

  return (
    <DashboardLayout role={user.role || 'customer'} title="Profile">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Update your personal information and security settings</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mb-5 flex items-center gap-2.5 p-3.5 rounded-lg text-sm border ${
            toast.type === 'success'
              ? 'bg-teal-50 border-teal-200 text-teal-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            {toast.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Identity card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center sticky top-20">
              <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl uppercase">{initials}</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">{user.first_name} {user.last_name}</h2>
              <p className="text-xs text-gray-500 mt-0.5 mb-4">{user.email}</p>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-medium capitalize">{user.role}</span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">Verified</span>
              </div>
            </div>
          </div>

          {/* Forms */}
          <div className="lg:col-span-8">
            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {(['profile', 'password'] as Section[]).map(s => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === s ? 'bg-teal-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'
                  }`}
                >
                  {s === 'profile' ? 'Profile Info' : 'Change Password'}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {activeSection === 'profile' ? (
                <form onSubmit={handleProfileSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={e => { setFormData(p => ({ ...p, first_name: e.target.value })); if (profileErrors.first_name) setProfileErrors(p => ({ ...p, first_name: undefined })) }}
                        className={inputClass(!!profileErrors.first_name)}
                      />
                      <FieldError msg={profileErrors.first_name} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={e => { setFormData(p => ({ ...p, last_name: e.target.value })); if (profileErrors.last_name) setProfileErrors(p => ({ ...p, last_name: undefined })) }}
                        className={inputClass(!!profileErrors.last_name)}
                      />
                      <FieldError msg={profileErrors.last_name} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => { setFormData(p => ({ ...p, phone: e.target.value })); if (profileErrors.phone) setProfileErrors(p => ({ ...p, phone: undefined })) }}
                      placeholder="+265 xxx xxx xxx"
                      className={inputClass(!!profileErrors.phone)}
                    />
                    <FieldError msg={profileErrors.phone} />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5">
                  {[
                    { key: 'current_password' as const, label: 'Current password', show: showPasswords.current, toggle: () => setShowPasswords(p => ({ ...p, current: !p.current })) },
                    { key: 'new_password' as const, label: 'New password', show: showPasswords.new, toggle: () => setShowPasswords(p => ({ ...p, new: !p.new })) },
                    { key: 'confirm_password' as const, label: 'Confirm new password', show: showPasswords.confirm, toggle: () => setShowPasswords(p => ({ ...p, confirm: !p.confirm })) },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                      <div className="relative">
                        <input
                          type={field.show ? 'text' : 'password'}
                          value={passwordData[field.key]}
                          onChange={e => { setPasswordData(p => ({ ...p, [field.key]: e.target.value })); if (passwordErrors[field.key]) setPasswordErrors(p => ({ ...p, [field.key]: undefined })) }}
                          className={`${inputClass(!!passwordErrors[field.key])} pr-10`}
                        />
                        <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <EyeIcon show={field.show} />
                        </button>
                      </div>
                      <FieldError msg={passwordErrors[field.key]} />
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
