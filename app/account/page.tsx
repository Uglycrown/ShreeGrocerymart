'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, MapPin, Phone, Mail, Settings, LogOut, ChevronRight, Heart, Package, ShoppingBag, Bell } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const phoneNumber = localStorage.getItem('userPhone')
    if (phoneNumber) {
      setUser({ phoneNumber })
    }
  }, [])

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userPhone')
      router.push('/login')
    }
  }

  const menuItems = [
    { icon: Package, label: 'My Orders', description: 'Track, return, or buy again', href: '/orders', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Heart, label: 'My Wishlist', description: 'Your saved items', href: '/wishlist', color: 'text-red-600', bg: 'bg-red-50' },
    { icon: MapPin, label: 'Addresses', description: 'Manage delivery addresses', href: '/addresses', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Bell, label: 'Notifications', description: 'Alerts & messages', href: '/notifications', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Settings, label: 'Settings', description: 'Account preferences', href: '/settings', color: 'text-gray-600', bg: 'bg-gray-50' },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4"><User className="w-12 h-12" /></div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{user ? `Hi, ${user.phoneNumber}` : 'My Account'}</h1>
              <p className="text-green-50">Welcome to Shree Grocery Mart</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!user ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="bg-green-50 rounded-full p-6 w-fit mx-auto mb-4"><User className="w-12 h-12 text-green-600" /></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Login to your account</h2>
            <p className="text-gray-600 mb-6">Access your orders, wishlist, and more</p>
            <button onClick={() => router.push('/login')} className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition w-full">Login / Sign Up</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">0</div><div className="text-xs text-gray-600">Orders</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">0</div><div className="text-xs text-gray-600">Wishlist</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <ShoppingBag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">₹0</div><div className="text-xs text-gray-600">Spent</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {menuItems.map((item, index) => (
                <button key={item.label} onClick={() => router.push(item.href)} className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className={`${item.bg} rounded-lg p-3`}><item.icon className={`w-6 h-6 ${item.color}`} /></div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{item.label}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>

            <button onClick={handleLogout} className="w-full bg-white border-2 border-red-500 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5" />Logout
            </button>
          </>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">Shree Grocery Mart</p>
          <p className="text-xs text-gray-500">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
