'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface NotificationOptions {
    enabled: boolean
    soundEnabled: boolean
    browserNotificationsEnabled: boolean
}

interface OrderNotification {
    orderId: string
    orderNumber: string
    customerName: string
    total: number
    timestamp: Date
}

const STORAGE_KEY = 'admin_seen_orders'
const NOTIFICATION_SETTINGS_KEY = 'admin_notification_settings'

// Create notification sound using Web Audio API
function createNotificationSound(audioContext: AudioContext) {
    const now = audioContext.currentTime

    // Create oscillator for bell-like sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Bell-like frequency
    oscillator.frequency.setValueAtTime(830, now) // A5 note
    oscillator.type = 'sine'

    // Envelope for bell-like decay
    gainNode.gain.setValueAtTime(0.5, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    oscillator.start(now)
    oscillator.stop(now + 0.5)

    // Second tone for ringing effect
    setTimeout(() => {
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()

        osc2.connect(gain2)
        gain2.connect(audioContext.destination)

        osc2.frequency.setValueAtTime(1046, audioContext.currentTime) // C6 note
        osc2.type = 'sine'

        gain2.gain.setValueAtTime(0.4, audioContext.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)

        osc2.start(audioContext.currentTime)
        osc2.stop(audioContext.currentTime + 0.4)
    }, 150)

    // Third tone for completion
    setTimeout(() => {
        const osc3 = audioContext.createOscillator()
        const gain3 = audioContext.createGain()

        osc3.connect(gain3)
        gain3.connect(audioContext.destination)

        osc3.frequency.setValueAtTime(1318, audioContext.currentTime) // E6 note
        osc3.type = 'sine'

        gain3.gain.setValueAtTime(0.3, audioContext.currentTime)
        gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        osc3.start(audioContext.currentTime)
        osc3.stop(audioContext.currentTime + 0.3)
    }, 300)
}

export function useOrderNotifications() {
    const audioContextRef = useRef<AudioContext | null>(null)
    const [settings, setSettings] = useState<NotificationOptions>({
        enabled: true,
        soundEnabled: true,
        browserNotificationsEnabled: false,
    })
    const [seenOrders, setSeenOrders] = useState<Set<string>>(new Set())
    const [newOrdersCount, setNewOrdersCount] = useState(0)
    const [latestNotification, setLatestNotification] = useState<OrderNotification | null>(null)

    // Initialize audio context on user interaction
    const initAudioContext = useCallback(() => {
        if (typeof window !== 'undefined' && !audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        return audioContextRef.current
    }, [])

    // Initialize settings from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Load settings from localStorage
            const savedSettings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY)
            if (savedSettings) {
                try {
                    setSettings(JSON.parse(savedSettings))
                } catch (e) {
                    console.error('Failed to parse notification settings:', e)
                }
            }

            // Load seen orders from localStorage
            const savedSeenOrders = localStorage.getItem(STORAGE_KEY)
            if (savedSeenOrders) {
                try {
                    setSeenOrders(new Set(JSON.parse(savedSeenOrders)))
                } catch (e) {
                    console.error('Failed to parse seen orders:', e)
                }
            }

            // Initialize audio context on first user click
            const handleUserInteraction = () => {
                initAudioContext()
                document.removeEventListener('click', handleUserInteraction)
            }
            document.addEventListener('click', handleUserInteraction)

            return () => {
                document.removeEventListener('click', handleUserInteraction)
            }
        }
    }, [initAudioContext])

    // Save settings to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings))
        }
    }, [settings])

    // Request browser notification permission
    const requestNotificationPermission = useCallback(async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
                setSettings(prev => ({ ...prev, browserNotificationsEnabled: true }))
                return true
            }
        }
        return false
    }, [])

    // Play notification sound using Web Audio API
    const playSound = useCallback(() => {
        if (!settings.soundEnabled) return

        try {
            // Initialize audio context if not already done
            let ctx = audioContextRef.current
            if (!ctx) {
                ctx = initAudioContext()
            }

            if (ctx) {
                // Resume context if suspended (browser autoplay policy)
                if (ctx.state === 'suspended') {
                    ctx.resume()
                }
                createNotificationSound(ctx)
                console.log('🔔 Notification sound played!')
            }
        } catch (err) {
            console.log('Audio play failed:', err)
        }
    }, [settings.soundEnabled, initAudioContext])

    // Show browser notification
    const showBrowserNotification = useCallback((order: OrderNotification) => {
        if (settings.browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('🛒 New Order!', {
                body: `Order ${order.orderNumber} from ${order.customerName}\nTotal: ₹${order.total.toFixed(2)}`,
                icon: '/icons/icon-192x192.png',
                tag: order.orderId,
                requireInteraction: true,
            })
        }
    }, [settings.browserNotificationsEnabled])

    // Check for new orders
    const checkNewOrders = useCallback((orders: Array<{ id: string; orderNumber: string; customerName: string; total: number; status: string }>) => {
        if (!settings.enabled || orders.length === 0) return

        const pendingOrders = orders.filter(o => o.status === 'pending')
        const newPendingOrders = pendingOrders.filter(o => !seenOrders.has(o.id))

        if (newPendingOrders.length > 0) {
            // Play sound for new orders
            playSound()

            // Show notification for the latest new order
            const latestOrder = newPendingOrders[0]
            const notification: OrderNotification = {
                orderId: latestOrder.id,
                orderNumber: latestOrder.orderNumber,
                customerName: latestOrder.customerName,
                total: latestOrder.total,
                timestamp: new Date(),
            }

            setLatestNotification(notification)
            showBrowserNotification(notification)

            // Clear notification after 8 seconds
            setTimeout(() => {
                setLatestNotification(prev =>
                    prev?.orderId === notification.orderId ? null : prev
                )
            }, 8000)
        }

        // Update new orders count (pending orders not yet seen)
        setNewOrdersCount(newPendingOrders.length)
    }, [settings.enabled, seenOrders, playSound, showBrowserNotification])

    // Mark orders as seen
    const markOrdersAsSeen = useCallback((orderIds: string[]) => {
        setSeenOrders(prev => {
            const newSet = new Set(prev)
            orderIds.forEach(id => newSet.add(id))
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...newSet]))
            return newSet
        })
        setNewOrdersCount(0)
    }, [])

    // Clear a specific notification
    const clearNotification = useCallback(() => {
        setLatestNotification(null)
    }, [])

    // Toggle sound
    const toggleSound = useCallback(() => {
        setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))
    }, [])

    // Toggle notifications
    const toggleNotifications = useCallback(() => {
        setSettings(prev => ({ ...prev, enabled: !prev.enabled }))
    }, [])

    return {
        settings,
        newOrdersCount,
        latestNotification,
        checkNewOrders,
        markOrdersAsSeen,
        clearNotification,
        toggleSound,
        toggleNotifications,
        requestNotificationPermission,
        playSound,
    }
}
