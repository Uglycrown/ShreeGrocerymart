'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MapPin, Home, Briefcase, Building, ArrowLeft } from 'lucide-react'

export default function AddAddressPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: 'home',
        address: '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.address || !formData.city || !formData.pincode) {
            alert('Please fill all fields')
            return
        }

        setLoading(true)
        try {
            const userId = user?.id || (session?.user as any)?.id
            const response = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    label: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
                    street: formData.address,
                    city: formData.city,
                    pincode: formData.pincode,
                    isDefault: formData.isDefault,
                }),
            })

            if (response.ok) {
                router.push('/addresses')
            } else {
                alert('Failed to save address')
            }
        } catch (error) {
            console.error('Error saving address:', error)
            alert('Error saving address')
        } finally {
            setLoading(false)
        }
    }

    const addressTypes = [
        { value: 'home', label: 'Home', icon: Home },
        { value: 'work', label: 'Work', icon: Briefcase },
        { value: 'other', label: 'Other', icon: Building },
    ]

    if (status === 'loading') {
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
                    <h1 className="text-2xl font-bold text-gray-900">Add New Address</h1>
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

                    {/* Address */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Address *
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="House/Flat No., Building, Street, Area"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            required
                        />
                    </div>

                    {/* City */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                        </label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Enter city"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Pincode */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode *
                        </label>
                        <input
                            type="text"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                            placeholder="6-digit pincode"
                            maxLength={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
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
                                Saving...
                            </>
                        ) : (
                            <>
                                <MapPin className="w-5 h-5" />
                                Save Address
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
