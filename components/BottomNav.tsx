'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, Heart, User, Package } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'

export default function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { getItemsCount } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const cartCount = mounted ? getItemsCount() : 0
  const wishlistCount = mounted ? wishlistItems.length : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      badge: 0,
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      badge: wishlistCount,
      badgeColor: 'bg-red-500',
    },
    {
      name: 'Cart',
      href: '/cart',
      icon: ShoppingCart,
      badge: cartCount,
      badgeColor: 'bg-green-600',
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: Package,
      badge: 0,
    },
    {
      name: 'Account',
      href: '/account',
      icon: User,
      badge: 0,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Hide on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  active
                    ? 'text-green-600 -translate-y-1'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <div className="relative">
                  {/* Icon with background on active */}
                  <div
                    className={`p-2 rounded-full transition-all duration-200 ${
                      active ? 'bg-green-50' : ''
                    }`}
                  >
                    <Icon
                      className={`transition-all duration-200 ${
                        active ? 'w-6 h-6' : 'w-5 h-5'
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </div>
                  
                  {/* Badge */}
                  {mounted && item.badge > 0 && (
                    <div
                      className={`absolute -top-1 -right-1 ${
                        item.badgeColor || 'bg-green-600'
                      } text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-in fade-in zoom-in duration-200`}
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    active ? 'scale-105' : ''
                  }`}
                >
                  {item.name}
                </span>
                
                {/* Active Indicator Dot */}
                {active && (
                  <div className="absolute -bottom-0 w-1 h-1 bg-green-600 rounded-full animate-in fade-in zoom-in duration-200" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
