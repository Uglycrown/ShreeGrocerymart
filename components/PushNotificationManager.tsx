'use client'

import { useEffect, useState, useCallback } from 'react'
import { Bell, X } from 'lucide-react'

interface PushNotificationProps {
    userId?: string
}

export default function PushNotificationManager({ userId }: PushNotificationProps) {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [showPrompt, setShowPrompt] = useState(false)
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        // Check if notifications are supported
        const supported = 'Notification' in window
        setIsSupported(supported)

        if (supported) {
            setPermission(Notification.permission)
        }

        // Show prompt after delay if not granted and not dismissed
        const hasPromptDismissed = localStorage.getItem('push-prompt-dismissed')
        if (!hasPromptDismissed && supported && Notification.permission === 'default') {
            const timer = setTimeout(() => setShowPrompt(true), 5000)
            return () => clearTimeout(timer)
        }
    }, [])

    const requestPermission = useCallback(async () => {
        try {
            const result = await Notification.requestPermission()
            setPermission(result)

            if (result === 'granted') {
                setShowPrompt(false)

                // Show success notification
                new Notification('🔔 Notifications Enabled!', {
                    body: 'You will now receive updates about your orders.',
                    icon: '/icons/icon-192x192.png',
                })

                // Save preference
                localStorage.setItem('notifications-enabled', 'true')
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error)
        }
    }, [])

    const dismissPrompt = () => {
        setShowPrompt(false)
        localStorage.setItem('push-prompt-dismissed', 'true')
    }

    // Don't render if not supported
    if (!isSupported) return null

    // Notification permission prompt
    if (showPrompt && permission === 'default') {
        return (
            <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Bell className="w-6 h-6 text-blue-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm">
                                Enable Order Notifications
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">
                                Get real-time updates about your orders - confirmation, delivery status & more!
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
                        onClick={requestPermission}
                        className="w-full mt-3 bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Bell className="w-4 h-4" />
                        Enable Notifications
                    </button>
                </div>
            </div>
        )
    }

    return null
}

