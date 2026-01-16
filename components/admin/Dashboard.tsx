'use client'

import { useState, useEffect } from 'react'
import {
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    AlertTriangle,
    TrendingUp,
    Clock,
    Eye,
    ArrowRight,
    RefreshCw,
    BarChart3
} from 'lucide-react'
import StatsCard from './StatsCard'
import { formatPrice } from '@/lib/utils'

interface DashboardProps {
    onNavigate: (tab: string) => void
}

interface StatsData {
    overview: {
        totalProducts: number
        totalCustomers: number
        totalOrders: number
        ordersToday: number
        ordersThisWeek: number
        ordersThisMonth: number
        lowStockCount: number
        outOfStockCount: number
    }
    revenue: {
        total: number
        today: number
        week: number
        month: number
        daily: Array<{ date: string; day: string; revenue: number }>
    }
    inventory: {
        lowStockProducts: Array<{
            id: string
            name: string
            stock: number
            images: string[]
            category: { name: string } | null
        }>
    }
    orders: {
        recent: Array<{
            id: string
            totalAmount: number
            status: string
            createdAt: string
            user: { name: string | null; email: string | null; phone: string | null }
        }>
        byStatus: Record<string, number>
    }
    products: {
        topSelling: Array<{
            id: string
            name: string
            images: string[]
            price: number
            totalSold: number
        }>
    }
}

export default function Dashboard({ onNavigate }: DashboardProps) {
    const [stats, setStats] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchStats = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true)
        try {
            const res = await fetch('/api/admin/stats')
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchStats()
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => fetchStats(), 30000)
        return () => clearInterval(interval)
    }, [])

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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="text-center py-12 text-gray-600">
                Failed to load dashboard data.
                <button onClick={() => fetchStats()} className="text-green-600 ml-2 hover:underline">
                    Retry
                </button>
            </div>
        )
    }

    const maxRevenue = Math.max(...stats.revenue.daily.map(d => d.revenue), 1)

    return (
        <div className="space-y-6">
            {/* Header with Refresh */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-600">Overview of your store performance</p>
                </div>
                <button
                    onClick={() => fetchStats(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Revenue"
                    value={formatPrice(stats.revenue.total)}
                    subtitle={`${formatPrice(stats.revenue.today)} today`}
                    icon={DollarSign}
                    iconColor="text-green-600"
                    iconBg="bg-green-100"
                />
                <StatsCard
                    title="Orders Today"
                    value={stats.overview.ordersToday}
                    subtitle={`${stats.overview.ordersThisMonth} this month`}
                    icon={ShoppingBag}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100"
                />
                <StatsCard
                    title="Total Customers"
                    value={stats.overview.totalCustomers}
                    subtitle="Registered users"
                    icon={Users}
                    iconColor="text-purple-600"
                    iconBg="bg-purple-100"
                />
                <StatsCard
                    title="Low Stock Items"
                    value={stats.overview.lowStockCount + stats.overview.outOfStockCount}
                    subtitle={`${stats.overview.outOfStockCount} out of stock`}
                    icon={AlertTriangle}
                    iconColor="text-orange-600"
                    iconBg="bg-orange-100"
                />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Revenue (Last 7 Days)</h3>
                            <p className="text-sm text-gray-500">Daily revenue trend</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.revenue.week)}</p>
                        <p className="text-sm text-gray-500">This week</p>
                    </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="flex items-end gap-2 h-40">
                    {stats.revenue.daily.map((day, index) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col items-center">
                                <span className="text-xs text-gray-600 mb-1">
                                    {day.revenue > 0 ? formatPrice(day.revenue) : '₹0'}
                                </span>
                                <div
                                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-300 hover:from-green-600 hover:to-green-500"
                                    style={{
                                        height: `${Math.max((day.revenue / maxRevenue) * 100, 4)}px`,
                                        minHeight: '4px'
                                    }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                        </div>
                        <button
                            onClick={() => onNavigate('orders')}
                            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {stats.orders.recent.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No orders yet</p>
                        ) : (
                            stats.orders.recent.map(order => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {order.user.name || order.user.email || order.user.phone || 'Customer'}
                                        </p>
                                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
                        </div>
                        <button
                            onClick={() => onNavigate('products')}
                            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {stats.inventory.lowStockProducts.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">All products well stocked! 🎉</p>
                        ) : (
                            stats.inventory.lowStockProducts.map(product => (
                                <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    {product.images?.[0] && (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${product.stock === 0
                                            ? 'bg-red-100 text-red-700'
                                            : product.stock < 5
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Top Selling Products</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.products.topSelling.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center py-4">No sales data yet</p>
                    ) : (
                        stats.products.topSelling.map((product, index) => (
                            <div key={product.id} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                                <div className="relative">
                                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        #{index + 1}
                                    </div>
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 font-medium text-gray-900 text-center text-sm line-clamp-2">
                                    {product.name}
                                </p>
                                <p className="text-green-600 font-bold">{formatPrice(product.price)}</p>
                                <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Order Status Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(stats.orders.byStatus).map(([status, count]) => (
                        <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${getStatusColor(status)}`}>
                                {status.replace('_', ' ')}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
