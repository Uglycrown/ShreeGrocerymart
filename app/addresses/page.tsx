'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MapPin, Plus, Trash2, Pencil, Home, Briefcase, Building, Phone, User } from 'lucide-react'

interface Address {
    id: string
    label: string
    name: string
    phone: string
    street: string
    landmark?: string
    city: string
    pincode: string
    isDefault: boolean
}

export default function AddressesPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [addresses, setAddresses] = useState<Address[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

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

    useEffect(() => {
        if (user) {
            fetchAddresses()
        }
    }, [user])

    const fetchAddresses = async () => {
        try {
            const userId = user?.id || (session?.user as any)?.id
            if (!userId) {
                setLoading(false)
                return
            }
            const response = await fetch(`/api/addresses?userId=${userId}`)
            if (response.ok) {
                const data = await response.json()
                setAddresses(data)
            }
        } catch (error) {
            console.error('Error fetching addresses:', error)
        } finally {
            setLoading(false)
        }
    }

    const getTypeIcon = (label: string) => {
        switch (label?.toLowerCase()) {
            case 'home': return <Home className="w-5 h-5" />
            case 'work': return <Briefcase className="w-5 h-5" />
            default: return <Building className="w-5 h-5" />
        }
    }

    const deleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return

        try {
            const response = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
            if (response.ok) {
                setAddresses(addresses.filter(a => a.id !== id))
            }
        } catch (error) {
            console.error('Error deleting address:', error)
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-24">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
                    <button
                        onClick={() => router.push('/addresses/add')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add New
                    </button>
                </div>

                {addresses.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No addresses yet</h2>
                        <p className="text-gray-500 mb-4">Add your first delivery address</p>
                        <button
                            onClick={() => router.push('/addresses/add')}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                            Add Address
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((address) => (
                            <div key={address.id} className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                        {getTypeIcon(address.label)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {/* Label and Default Badge */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-gray-900 text-lg">{address.label || 'Other'}</span>
                                            {address.isDefault && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                                            )}
                                        </div>

                                        {/* Name */}
                                        <div className="flex items-center gap-2 text-gray-800 mb-1">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{address.name}</span>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>{address.phone}</span>
                                        </div>

                                        {/* Address */}
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {address.street}
                                            {address.landmark && `, ${address.landmark}`}
                                        </p>
                                        <p className="text-gray-500 text-sm">{address.city} - {address.pincode}</p>
                                    </div>

                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => router.push(`/addresses/edit/${address.id}`)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                            title="Edit address"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteAddress(address.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Delete address"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
