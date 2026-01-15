'use client'

import { useEffect, useState, useCallback } from 'react'
import { Bell, X } from 'lucide-react'

interface PushNotificationProps {
    userId?: string
}

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export default function PushNotificationManager({ userId }: PushNotificationProps) {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isSupported, setIsSupported] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Check if push notifications are supported
        const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
        setIsSupported(supported)

        if (supported) {
            setPermission(Notification.permission)
            checkSubscription()
        }

        // Show prompt after delay if not subscribed and not dismissed
        const hasPromptDismissed = localStorage.getItem('push-prompt-dismissed')
        if (!hasPromptDismissed && supported && Notification.permission !== 'denied') {
            const timer = setTimeout(() => setShowPrompt(true), 5000)
            return () => clearTimeout(timer)
        }
    }, [])

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
            if (subscription) {
                setShowPrompt(false)
            }
        } catch (error) {
            console.error('Error checking subscription:', error)
        }
    }

    const subscribe = useCallback(async () => {
        if (isLoading) return
        setIsLoading(true)

        try {
            // Request permission first
            const result = await Notification.requestPermission()
            setPermission(result)

            if (result !== 'granted') {
                console.log('Notification permission denied')
                setIsLoading(false)
                return false
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready

            // Get VAPID public key from environment
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            if (!vapidPublicKey) {
                console.error('VAPID public key not configured')
                setIsLoading(false)
                return false
            }

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
            })

            // Save subscription to server
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userId,
                }),
            })

            if (response.ok) {
                setIsSubscribed(true)
                setShowPrompt(false)
                localStorage.setItem('push-subscribed', 'true')

                // Show success notification
                new Notification('🔔 Notifications Enabled!', {
                    body: 'You will now receive updates about your orders.',
                    icon: '/icons/icon-192x192.png',
                })
            }

            setIsLoading(false)
            return true
        } catch (error) {
            console.error('Error subscribing to push:', error)
            setIsLoading(false)
            return false
        }
    }, [userId, isLoading])

    const dismissPrompt = () => {
        setShowPrompt(false)
        localStorage.setItem('push-prompt-dismissed', 'true')
    }

    // Don't render if not supported or already subscribed
    if (!isSupported || isSubscribed) return null

    // Notification permission prompt
    if (showPrompt && permission !== 'denied') {
        return (
            <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Bell className="w-6 h-6 text-green-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm">
                                Enable Order Notifications
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Get notified when your order is confirmed, out for delivery, or delivered!
                            </p>
                        </div>

                        <button
                            onClick={dismissPrompt}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={subscribe}
                        disabled={isLoading}
                        className="w-full mt-3 bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Bell className="w-4 h-4" />
                        )}
                        {isLoading ? 'Enabling...' : 'Enable Notifications'}
                    </button>
                </div>
            </div>
        )
    }

    return null
}
