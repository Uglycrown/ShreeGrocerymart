'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MapPin, Home, Briefcase, Building, ArrowLeft, User, Phone } from 'lucide-react'
import { useDialog } from '@/components/providers/DialogProvider'

export default function EditAddressPage() {
    const router = useRouter()
    const params = useParams()
    const addressId = params.id as string
    const { data: session, status } = useSession()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const { showError } = useDialog()
    const [formData, setFormData] = useState({
        type: 'home',
        name: '',
        phone: '',
        address: '',
        landmark: '',
        city: '',
        pincode: '',
        isDefault: false,
    })

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        } else if (status === 'authenticated' && session?.user) {
            setUser(session.user)
        } else if (status === 'unauthenticated' && !storedUser) {
            router.push('/login')
        }
    }, [router, session, status])

    // Fetch existing address data
    useEffect(() => {
        const fetchAddress = async () => {
            if (!addressId) return

            try {
                const response = await fetch(`/api/addresses/${addressId}`)
                if (response.ok) {
                    const data = await response.json()
                    setFormData({
                        type: data.label?.toLowerCase() || 'home',
                        name: data.name || '',
                        phone: data.phone || '',
                        address: data.street || '',
                        landmark: data.landmark || '',
                        city: data.city || '',
                        pincode: data.pincode || '',
                        isDefault: data.isDefault || false,
                    })
                } else {
                    showError('Address not found')
                    router.push('/addresses')
                }
            } catch (error) {
                console.error('Error fetching address:', error)
                showError('Error loading address')
                router.push('/addresses')
            } finally {
                setFetching(false)
            }
        }

        fetchAddress()
    }, [addressId, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
            showError('Please fill all required fields', 'Missing Information')
            return
        }

        if (formData.phone.length !== 10) {
            showError('Please enter a valid 10-digit phone number', 'Invalid Phone')
            return
        }

        if (formData.pincode.length !== 6) {
            showError('Please enter a valid 6-digit pincode', 'Invalid Pincode')
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/addresses/${addressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
                    name: formData.name,
                    phone: formData.phone,
                    street: formData.address,
                    landmark: formData.landmark,
                    city: formData.city,
                    pincode: formData.pincode,
                    isDefault: formData.isDefault,
                }),
            })

            if (response.ok) {
                router.push('/addresses')
            } else {
                const error = await response.json()
                showError(error.message || 'Failed to update address')
            }
        } catch (error) {
            console.error('Error updating address:', error)
            showError('Error updating address')
        } finally {
            setLoading(false)
        }
    }

    const addressTypes = [
        { value: 'home', label: 'Home', icon: Home },
        { value: 'work', label: 'Work', icon: Briefcase },
        { value: 'other', label: 'Other', icon: Building },
    ]

    if (status === 'loading' || fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-24">
            <div className="container mx-auto px-4 max-w-lg">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Address</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
                    {/* Address Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Address Type
                        </label>
                        <div className="flex gap-3">
                            {addressTypes.map((type) => {
                                const Icon = type.icon
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: type.value })}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition ${formData.type === type.value
                                            ? 'border-green-600 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{type.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contact Details</h3>

                        {/* Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Recipient's full name"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Details */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Address Details</h3>

                        {/* Full Address */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Address *
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="House/Flat No., Building Name, Street, Area"
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                required
                            />
                        </div>

                        {/* Landmark */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Landmark (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.landmark}
                                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                placeholder="Near metro station, temple, etc."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* City and Pincode */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="City"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pincode *
                                </label>
                                <input
                                    type="text"
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    placeholder="6 digits"
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Default Checkbox */}
                    <div className="mb-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-gray-700">Set as default address</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <MapPin className="w-5 h-5" />
                                Update Address
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
