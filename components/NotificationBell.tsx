'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, X, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Notification {
    id: string
    type: string
    title: string
    body: string
    url: string
    orderNumber: string
    status: string
    isRead: boolean
    createdAt: string
}

interface NotificationBellProps {
    userId?: string
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const fetchNotifications = useCallback(async () => {
        if (!userId) return

        try {
            const response = await fetch(`/api/notifications?userId=${userId}&limit=10`)
            const data = await response.json()
            setNotifications(data.notifications || [])
            setUnreadCount(data.unreadCount || 0)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }, [userId])

    useEffect(() => {
        if (userId) {
            fetchNotifications()
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000)
            return () => clearInterval(interval)
        }
    }, [userId, fetchNotifications])

    const markAllAsRead = async () => {
        if (!userId) return

        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, markAllRead: true }),
            })
            setUnreadCount(0)
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        } catch (error) {
            console.error('Error marking notifications as read:', error)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'processing':
            case 'packed':
                return <Package className="w-5 h-5 text-blue-500" />
            case 'out_for_delivery':
                return <Truck className="w-5 h-5 text-orange-500" />
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />
            default:
                return <Bell className="w-5 h-5 text-gray-500" />
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    if (!userId) return null

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-80">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <Link
                                        key={notification.id}
                                        href={notification.url || '#'}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getStatusIcon(notification.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                {notification.body}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                        )}
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t bg-gray-50">
                                <Link
                                    href="/orders"
                                    onClick={() => setIsOpen(false)}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    View all orders →
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
