'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function ServiceWorkerRegistration() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallBanner, setShowInstallBanner] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Check if running as PWA
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true
        setIsStandalone(standalone)

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        setIsIOS(iOS)

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope)

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available, show update notification
                                    console.log('New content available, please refresh')
                                }
                            })
                        }
                    })
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error)
                })
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // Show install banner after a delay if user hasn't installed
            const hasSeenBanner = localStorage.getItem('pwa-banner-dismissed')
            if (!hasSeenBanner && !standalone) {
                setTimeout(() => setShowInstallBanner(true), 3000)
            }
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Track successful installs
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully')
            setShowInstallBanner(false)
            setDeferredPrompt(null)
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt')
        }

        setDeferredPrompt(null)
        setShowInstallBanner(false)
    }

    const dismissBanner = () => {
        setShowInstallBanner(false)
        localStorage.setItem('pwa-banner-dismissed', 'true')
    }

    // Don't show if already installed or no prompt available
    if (isStandalone || !showInstallBanner) return null

    return (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Download className="w-6 h-6 text-green-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">
                            Install Shree Grocery Mart
                        </h3>
                        <p className="text-xs text-gray-600 mt-0.5">
                            {isIOS
                                ? 'Tap the share button and "Add to Home Screen"'
                                : 'Install our app for a better experience'}
                        </p>
                    </div>

                    <button
                        onClick={dismissBanner}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!isIOS && deferredPrompt && (
                    <button
                        onClick={handleInstall}
                        className="w-full mt-3 bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Install App
                    </button>
                )}

                {isIOS && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Share className="w-4 h-4" />
                        <span>Tap Share → Add to Home Screen</span>
                    </div>
                )}
            </div>
        </div>
    )
}
