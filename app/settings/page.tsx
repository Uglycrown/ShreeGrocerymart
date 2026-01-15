'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Bell, BellOff, Moon, Sun, Globe, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [user, setUser] = useState<any>(null)
    const [notificationsEnabled, setNotificationsEnabled] = useState(false)
    const [darkMode, setDarkMode] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check both localStorage and NextAuth session
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
            setIsLoading(false)
        } else if (status === 'authenticated' && session?.user) {
            setUser(session.user)
            setIsLoading(false)
        } else if (status === 'unauthenticated' && !storedUser) {
            router.push('/login')
            return
        } else if (status === 'loading') {
            return
        }
        setIsLoading(false)

        // Check notification permission
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted')
        }

        // Check dark mode preference
        setDarkMode(localStorage.getItem('darkMode') === 'true')
    }, [router, session, status])

    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            const permission = await Notification.requestPermission()
            setNotificationsEnabled(permission === 'granted')
        } else {
            alert('To disable notifications, go to your browser settings.')
        }
    }

    const toggleDarkMode = () => {
        const newValue = !darkMode
        setDarkMode(newValue)
        localStorage.setItem('darkMode', String(newValue))
        // Note: Dark mode implementation would need to be added to the app
    }

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('user')
            localStorage.removeItem('userPhone')
            await signOut({ redirect: false })
            router.push('/login')
        }
    }

    const settingsSections = [
        {
            title: 'Preferences',
            items: [
                {
                    icon: notificationsEnabled ? Bell : BellOff,
                    label: 'Push Notifications',
                    description: notificationsEnabled ? 'Enabled' : 'Disabled',
                    action: toggleNotifications,
                    toggle: true,
                    value: notificationsEnabled,
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    icon: HelpCircle,
                    label: 'Help & Support',
                    description: 'Get help with your orders',
                    href: '/contact',
                },
                {
                    icon: Shield,
                    label: 'Privacy Policy',
                    description: 'Learn how we protect your data',
                    href: '/privacy',
                },
                {
                    icon: Globe,
                    label: 'Terms of Service',
                    description: 'Terms and conditions',
                    href: '/terms',
                },
            ],
        },
    ]

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 pb-24">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

                {/* User Info */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-green-600">
                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">{user?.name || 'User'}</h2>
                            <p className="text-sm text-gray-500">{user?.email || user?.phoneNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Settings Sections */}
                {settingsSections.map((section) => (
                    <div key={section.title} className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                            {section.title}
                        </h3>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {section.items.map((item, index) => {
                                const Icon = item.icon
                                const content = (
                                    <div className={`flex items-center gap-4 p-4 ${index !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.description}</p>
                                        </div>
                                        {'toggle' in item && item.toggle ? (
                                            <button
                                                onClick={'action' in item ? item.action : undefined}
                                                className={`w-12 h-6 rounded-full transition-colors ${'value' in item && item.value ? 'bg-green-600' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${'value' in item && item.value ? 'translate-x-6' : 'translate-x-0.5'
                                                        }`}
                                                />
                                            </button>
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                )

                                return ('href' in item && item.href ? (
                                    <a key={item.label} href={item.href} className="block hover:bg-gray-50 transition">
                                        {content}
                                    </a>
                                ) : (
                                    <button key={item.label} onClick={'action' in item ? item.action : undefined} className="w-full text-left hover:bg-gray-50 transition">
                                        {content}
                                    </button>
                                ))
                            })}
                        </div>
                    </div>
                ))}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 text-red-600 hover:bg-red-50 transition"
                >
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Logout</span>
                </button>

                {/* Version Info */}
                <p className="text-center text-gray-400 text-sm mt-8">
                    Shree Grocery Mart v1.0.0
                </p>
            </div>
        </div>
    )
}
