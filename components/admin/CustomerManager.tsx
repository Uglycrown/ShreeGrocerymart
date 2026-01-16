'use client'

import { useState, useEffect } from 'react'
import {
    Search,
    User,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    X,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Calendar
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Customer {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
    createdAt: string
    totalOrders: number
    totalSpent: number
    lastOrderDate: string | null
    addresses: Array<{
        id: string
        label: string
        street: string
        city: string
        pincode: string
        isDefault: boolean
    }>
    recentOrders: Array<{
        id: string
        totalAmount: number
        status: string
        createdAt: string
    }>
}

interface Pagination {
    total: number
    page: number
    limit: number
    totalPages: number
}

export default function CustomerManager() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
    })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    const fetchCustomers = async (page = 1, searchQuery = '') => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(searchQuery && { search: searchQuery })
            })

            const res = await fetch(`/api/admin/customers?${params}`)
            if (res.ok) {
                const data = await res.json()
                setCustomers(data.customers)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchCustomers(1, search)
        }, 300)
        return () => clearTimeout(debounce)
    }, [search])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            PACKED: 'bg-purple-100 text-purple-800',
            OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const exportCustomers = () => {
        const csv = [
            ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Joined Date'].join(','),
            ...customers.map(c => [
                c.name || '',
                c.email || '',
                c.phone || '',
                c.totalOrders,
                c.totalSpent,
                formatDate(c.createdAt)
            ].join(','))
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                    <p className="text-gray-600">{pagination.total} registered customers</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={exportCustomers}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {search ? 'No customers found matching your search' : 'No customers yet'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Orders</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total Spent</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    {customer.image ? (
                                                        <img src={customer.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <span className="text-green-600 font-semibold">
                                                            {(customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{customer.name || 'No name'}</p>
                                                    <p className="text-sm text-gray-500">{customer.addresses.length} addresses</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {customer.email && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Mail className="w-4 h-4" /> {customer.email}
                                                    </p>
                                                )}
                                                {customer.phone && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Phone className="w-4 h-4" /> {customer.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">{customer.totalOrders}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900">{formatPrice(customer.totalSpent)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{formatDate(customer.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedCustomer(customer)}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium"
                                            >
                                                <Eye className="w-4 h-4" /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchCustomers(pagination.page - 1, search)}
                            disabled={pagination.page === 1}
                            className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-4 py-2 font-medium">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => fetchCustomers(pagination.page + 1, search)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
                            {/* Customer Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    {selectedCustomer.image ? (
                                        <img src={selectedCustomer.image} alt="" className="w-16 h-16 rounded-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-green-600" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">{selectedCustomer.name || 'No name'}</h4>
                                    <p className="text-gray-600">Customer since {formatDate(selectedCustomer.createdAt)}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-blue-700">{selectedCustomer.totalOrders}</p>
                                    <p className="text-sm text-blue-600">Orders</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-green-700">{formatPrice(selectedCustomer.totalSpent)}</p>
                                    <p className="text-sm text-green-600">Total Spent</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-purple-700">{selectedCustomer.addresses.length}</p>
                                    <p className="text-sm text-purple-600">Addresses</p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Contact Information</h5>
                                <div className="space-y-2">
                                    {selectedCustomer.email && (
                                        <p className="flex items-center gap-2 text-gray-600">
                                            <Mail className="w-4 h-4" /> {selectedCustomer.email}
                                        </p>
                                    )}
                                    {selectedCustomer.phone && (
                                        <p className="flex items-center gap-2 text-gray-600">
                                            <Phone className="w-4 h-4" /> {selectedCustomer.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Addresses */}
                            {selectedCustomer.addresses.length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">Saved Addresses</h5>
                                    <div className="space-y-2">
                                        {selectedCustomer.addresses.map(addr => (
                                            <div key={addr.id} className="p-3 bg-gray-50 rounded-lg flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {addr.label}
                                                        {addr.isDefault && (
                                                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{addr.street}, {addr.city} - {addr.pincode}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Orders */}
                            {selectedCustomer.recentOrders.length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">Recent Orders</h5>
                                    <div className="space-y-2">
                                        {selectedCustomer.recentOrders.map(order => (
                                            <div key={order.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
