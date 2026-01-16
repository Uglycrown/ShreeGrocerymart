'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Map, Loader2 } from 'lucide-react'

export default function SelectAddressPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    label: 'Home',
    name: '',
    phone: '',
    street: '',
    landmark: '',
    city: 'New Delhi',
    pincode: '',
    isDefault: false
  })

  useEffect(() => {
    setMounted(true)
    checkAuthAndFetchAddresses()
  }, [status, session])

  const checkAuthAndFetchAddresses = async () => {
    const storedUser = localStorage.getItem('user')

    if (status === 'unauthenticated' && !storedUser) {
      router.push('/login?callbackUrl=/checkout/address')
      return
    }

    let userId = ''
    let userData: any = null
    if (status === 'authenticated' && session?.user) {
      userId = (session.user as any).id
      userData = session.user
    } else if (storedUser) {
      userData = JSON.parse(storedUser)
      userId = userData.id
    }

    if (userData) {
      setUser(userData)
      // Pre-fill name and phone from user data
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        phone: userData.phoneNumber || userData.phone || '',
      }))
    }

    if (userId) {
      await fetchAddresses(userId)
    }
    setLoading(false)
  }

  const fetchAddresses = async (userId: string) => {
    try {
      console.log('Fetching addresses for userId:', userId)
      const res = await fetch(`/api/addresses?userId=${userId}`)

      if (res.ok) {
        const data = await res.json()
        setAddresses(data)
      } else {
        console.error('Failed to fetch addresses. Status:', res.status)
        // Try to parse error response, but handle if it's not JSON
        let errorData: any = {}
        try {
          errorData = await res.json()
        } catch {
          console.error('Response was not JSON')
        }
        console.error('Error data:', errorData)

        // If invalid user ID, clear localStorage and redirect to login
        if (errorData.message === 'Invalid user ID format') {
          localStorage.removeItem('user')
          localStorage.removeItem('userPhone')
          router.push('/login?callbackUrl=/checkout/address')
        }
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
    }
  }

  const handleSelectAddress = (addressId: string) => {
    // Navigate to checkout with the selected address ID
    router.push(`/checkout?addressId=${addressId}`)
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let userId = ''
      if (session?.user) {
        userId = (session.user as any).id
      } else {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          userId = JSON.parse(userStr).id
        }
      }

      if (!userId) return

      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
          isDefault: addresses.length === 0 || formData.isDefault // First address is always default
        })
      })

      if (res.ok) {
        const newAddress = await res.json()
        await fetchAddresses(userId)
        setShowAddForm(false)
        setFormData({
          label: 'Home',
          name: user?.name || '',
          phone: user?.phoneNumber || user?.phone || '',
          street: '',
          landmark: '',
          city: 'New Delhi',
          pincode: '',
          isDefault: false
        })
        // Optionally select the new address immediately
        handleSelectAddress(newAddress.id)
      } else {
        const errorData = await res.json()
        console.error('Error adding address:', errorData)
        if (errorData.message === 'Invalid user ID format') {
          alert('Session expired. Please log in again.')
          localStorage.removeItem('user')
          localStorage.removeItem('userPhone')
          router.push('/login?callbackUrl=/checkout/address')
        } else {
          alert(errorData.message || 'Failed to save address. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error adding address:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return <Home className="w-5 h-5" />
      case 'work': return <Briefcase className="w-5 h-5" />
      default: return <Map className="w-5 h-5" />
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Select Delivery Address</h1>
        </div>

        {/* Add New Address Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-white p-4 rounded-lg shadow-sm border border-green-600 text-green-600 font-semibold flex items-center justify-center gap-2 mb-6 hover:bg-green-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        )}

        {/* Add Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add New Address</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="flex gap-4 mb-2">
                {['Home', 'Work', 'Other'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, label: type })}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.label === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Name and Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Recipient's name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address *</label>
                <textarea
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="House No., Building Name, Street"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Nearby landmark"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="110001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">Make this my default address</label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 mt-4"
              >
                {submitting ? 'Saving...' : 'Save and Continue'}
              </button>
            </form>
          </div>
        )}

        {/* Saved Addresses List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Saved Addresses</h2>
          {addresses.length === 0 && !loading && !showAddForm ? (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No saved addresses found</p>
              <p className="text-sm text-gray-400">Add a new address to proceed</p>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-green-200 transition-all cursor-pointer group"
                onClick={() => handleSelectAddress(addr.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${addr.isDefault ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {getIcon(addr.label)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{addr.label}</h3>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Default</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {addr.street}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city}, {addr.pincode}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectAddress(addr.id)
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
