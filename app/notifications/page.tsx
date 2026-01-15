'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, BellOff, Package, Truck, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
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

export default function NotificationsPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        // Check both localStorage and NextAuth session
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        } else if (status === 'authenticated' && session?.user) {
            setUser(session.user)
        } else if (status === 'unauthenticated' && !storedUser) {
            router.push('/login')
            return
        }
    }, [router, session, status])

    const fetchNotifications = useCallback(async () => {
        if (!user) return

        try {
            const response = await fetch(`/api/notifications?userId=${user.id}&limit=50`)
            if (response.ok) {
                const data = await response.json()
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) {
            fetchNotifications()
        }
    }, [user, fetchNotifications])

    const markAllAsRead = async () => {
        if (!user) return

        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, markAllRead: true }),
            })
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        } catch (error) {
            console.error('Error marking notifications as read:', error)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return <CheckCircle className="w-6 h-6 text-green-500" />
            case 'processing':
            case 'packed': return <Package className="w-6 h-6 text-blue-500" />
            case 'out_for_delivery': return <Truck className="w-6 h-6 text-orange-500" />
            case 'delivered': return <CheckCircle className="w-6 h-6 text-green-600" />
            case 'cancelled': return <XCircle className="w-6 h-6 text-red-500" />
            default: return <Bell className="w-6 h-6 text-gray-500" />
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
        if (diffMins < 60) return `${diffMins} minutes ago`
        if (diffHours < 24) return `${diffHours} hours ago`
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString()
    }

    if (loading) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-green-600 font-semibold hover:text-green-700"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h2>
                        <p className="text-gray-500">You'll see order updates and offers here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <Link
                                key={notification.id}
                                href={notification.url || '#'}
                                className={`block bg-white rounded-xl shadow-sm p-4 transition hover:shadow-md ${!notification.isRead ? 'border-l-4 border-green-500' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {getStatusIcon(notification.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-gray-900 ${!notification.isRead ? '' : 'font-medium'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-0.5">{notification.body}</p>
                                        <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
