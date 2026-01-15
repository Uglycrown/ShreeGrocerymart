'use client'

import { ShoppingCart, MapPin, Search, User, Heart, Package, Bell, Settings, LogOut, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { formatPrice } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import NotificationBell from './NotificationBell'

interface Product {
  id: string;
  name: string;
  slug?: string;
  unit: string;
  price: number;
  images: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { items, getItemsCount, getTotal } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<any>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const itemCount = getItemsCount()
  const total = getTotal()
  const { items: wishlistItems } = useWishlistStore()
  const { data: session, status } = useSession()

  const searchPlaceholders = [
    'Search "milk"',
    'Search "almonds"',
    'Search "rice"',
    'Search "atta"',
    'Search "sugar"',
    'Search "tea"',
    'Search "coffee"',
    'Search "bread"',
    'Search "eggs"',
    'Search "cheese"',
    'Search "yogurt"',
    'Search "butter"',
    'Search "fruits"',
    'Search "vegetables"',
    'Search "spices"',
    'Search "oil"',
    'Search "flour"',
    'Search "dals"',
  ]
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholder, setPlaceholder] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if user is logged in (Local Storage or Session)
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else if (status === 'authenticated' && session?.user) {
      setUser(session.user)
    } else if (status === 'unauthenticated') {
      setUser(null)
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        if (Array.isArray(data)) {
          setCategories(data)
        } else {
          console.error('Invalid categories data:', data)
          setCategories([])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [session, status])

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userPhone')
      localStorage.removeItem('user')
      await signOut({ redirect: false })
      setUser(null)
      setShowAccountMenu(false)
      router.push('/login')
    }
  }

  const menuItems = [
    { icon: Package, label: 'My Orders', href: '/orders', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Heart, label: 'My Wishlist', href: '/wishlist', color: 'text-red-600', bg: 'bg-red-50' },
    { icon: MapPin, label: 'Addresses', href: '/addresses', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Bell, label: 'Notifications', href: '/notifications', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Settings, label: 'Settings', href: '/settings', color: 'text-gray-600', bg: 'bg-gray-50' },
  ]

  // ... (keep search logic and placeholders)

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 1) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      try {
        const response = await fetch(`/api/products/suggestions?q=${encodeURIComponent(searchQuery.trim())}`)
        const data = await response.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Typing effect for search placeholder
  useEffect(() => {
    const currentPlaceholder = searchPlaceholders[placeholderIndex]
    const typingSpeed = 150
    const deletingSpeed = 50
    const delay = 2000

    const handleTyping = () => {
      if (isDeleting) {
        if (placeholder.length > 0) {
          setPlaceholder((prev) => prev.substring(0, prev.length - 1))
        } else {
          setIsDeleting(false)
          setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length)
        }
      } else {
        if (placeholder.length < currentPlaceholder.length) {
          setPlaceholder((prev) => currentPlaceholder.substring(0, prev.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), delay)
        }
      }
    }

    const timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed)
    return () => clearTimeout(timeout)
  }, [placeholder, isDeleting, placeholderIndex, searchPlaceholders])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery('')
    setShowSuggestions(false)
    // Use slug if available, otherwise generate from name
    const productSlug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    router.push(`/product/${productSlug}`)
  }

  const highlightMatch = (text: string, query: string) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text

    return (
      <>
        {text.substring(0, index)}
        <strong className="text-green-600">{text.substring(index, index + query.length)}</strong>
        {text.substring(index + query.length)}
      </>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-orange-50 to-white shadow-md relative">
      {/* Background Pattern - Random Scattered Icons */}
      <div className="absolute inset-0 opacity-30 pointer-events-none grayscale overflow-hidden">
        {/* Mobile - 35 icons randomly scattered with grocery items */}
        <div className="absolute top-[5%] left-[3%] text-white text-xl md:text-3xl">🥛</div>
        <div className="absolute top-[8%] left-[25%] text-white text-lg md:text-2xl">🍺</div>
        <div className="absolute top-[12%] left-[48%] text-white text-xl md:text-3xl">🍿</div>
        <div className="absolute top-[6%] left-[72%] text-white text-lg md:text-2xl">🥚</div>
        <div className="absolute top-[10%] left-[89%] text-white text-xl md:text-3xl">🛢️</div>

        <div className="absolute top-[25%] left-[8%] text-white text-lg md:text-2xl">🍚</div>
        <div className="absolute top-[28%] left-[35%] text-white text-xl md:text-3xl">🧈</div>
        <div className="absolute top-[22%] left-[60%] text-white text-lg md:text-2xl">🌾</div>
        <div className="absolute top-[27%] left-[82%] text-white text-xl md:text-3xl">💄</div>

        <div className="absolute top-[45%] left-[5%] text-white text-xl md:text-3xl">🥤</div>
        <div className="absolute top-[48%] left-[28%] text-white text-lg md:text-2xl">🍶</div>
        <div className="absolute top-[42%] left-[52%] text-white text-xl md:text-3xl">🥜</div>
        <div className="absolute top-[47%] left-[75%] text-white text-lg md:text-2xl">🧴</div>
        <div className="absolute top-[43%] left-[93%] text-white text-xl md:text-3xl">🍞</div>

        <div className="absolute top-[65%] left-[12%] text-white text-lg md:text-2xl">☕</div>
        <div className="absolute top-[68%] left-[38%] text-white text-xl md:text-3xl">🫘</div>
        <div className="absolute top-[62%] left-[65%] text-white text-lg md:text-2xl">🥛</div>
        <div className="absolute top-[67%] left-[85%] text-white text-xl md:text-3xl">🧊</div>

        <div className="absolute top-[85%] left-[6%] text-white text-xl md:text-3xl">🍵</div>
        <div className="absolute top-[88%] left-[22%] text-white text-lg md:text-2xl">🥫</div>
        <div className="absolute top-[82%] left-[45%] text-white text-xl md:text-3xl">🧂</div>
        <div className="absolute top-[87%] left-[68%] text-white text-lg md:text-2xl">🍯</div>
        <div className="absolute top-[83%] left-[90%] text-white text-xl md:text-3xl">🧼</div>

        <div className="absolute top-[15%] left-[15%] text-white text-lg md:text-2xl">🧃</div>
        <div className="absolute top-[18%] left-[92%] text-white text-xl md:text-3xl">🥟</div>
        <div className="absolute top-[35%] left-[18%] text-white text-lg md:text-2xl">🧋</div>
        <div className="absolute top-[38%] left-[88%] text-white text-xl md:text-3xl">🍭</div>
        <div className="absolute top-[55%] left-[20%] text-white text-lg md:text-2xl">🧉</div>
        <div className="absolute top-[58%] left-[95%] text-white text-xl md:text-3xl">🥖</div>
        <div className="absolute top-[75%] left-[32%] text-white text-lg md:text-2xl">🍮</div>
        <div className="absolute top-[14%] left-[62%] text-white text-lg md:text-2xl">🥣</div>
        <div className="absolute top-[34%] left-[44%] text-white text-xl md:text-3xl">🧇</div>
        <div className="absolute top-[54%] left-[8%] text-white text-lg md:text-2xl">🥧</div>
        <div className="absolute top-[74%] left-[78%] text-white text-xl md:text-3xl">🍪</div>

        {/* Desktop - Additional 25 icons */}
        <div className="hidden md:block absolute top-[7%] left-[40%] text-white text-2xl">🧊</div>
        <div className="hidden md:block absolute top-[13%] left-[55%] text-white text-3xl">🥛</div>
        <div className="hidden md:block absolute top-[9%] left-[78%] text-white text-2xl">🍺</div>
        <div className="hidden md:block absolute top-[20%] left-[12%] text-white text-3xl">🍿</div>
        <div className="hidden md:block absolute top-[23%] left-[45%] text-white text-2xl">🥚</div>
        <div className="hidden md:block absolute top-[29%] left-[70%] text-white text-3xl">🛢️</div>
        <div className="hidden md:block absolute top-[32%] left-[25%] text-white text-2xl">🍚</div>
        <div className="hidden md:block absolute top-[37%] left-[42%] text-white text-3xl">🧈</div>
        <div className="hidden md:block absolute top-[40%] left-[68%] text-white text-2xl">🌾</div>
        <div className="hidden md:block absolute top-[44%] left-[15%] text-white text-3xl">💄</div>
        <div className="hidden md:block absolute top-[50%] left-[32%] text-white text-2xl">🥤</div>
        <div className="hidden md:block absolute top-[53%] left-[78%] text-white text-3xl">🍶</div>
        <div className="hidden md:block absolute top-[56%] left-[48%] text-white text-2xl">🥜</div>
        <div className="hidden md:block absolute top-[63%] left-[8%] text-white text-3xl">🧴</div>
        <div className="hidden md:block absolute top-[69%] left-[28%] text-white text-2xl">☕</div>
        <div className="hidden md:block absolute top-[72%] left-[55%] text-white text-3xl">🫘</div>
        <div className="hidden md:block absolute top-[77%] left-[15%] text-white text-2xl">🧃</div>
        <div className="hidden md:block absolute top-[80%] left-[58%] text-white text-3xl">🧋</div>
        <div className="hidden md:block absolute top-[86%] left-[78%] text-white text-2xl">🍵</div>
        <div className="hidden md:block absolute top-[92%] left-[12%] text-white text-3xl">🥫</div>
        <div className="hidden md:block absolute top-[17%] left-[33%] text-white text-2xl">🧂</div>
        <div className="hidden md:block absolute top-[26%] left-[87%] text-white text-3xl">🍯</div>
        <div className="hidden md:block absolute top-[46%] left-[58%] text-white text-2xl">🧼</div>
        <div className="hidden md:block absolute top-[66%] left-[42%] text-white text-3xl">🍞</div>
        <div className="hidden md:block absolute top-[88%] left-[35%] text-white text-2xl">🥣</div>
      </div>

      <div className="container mx-auto px-1 relative z-10">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between h-20">
          {/* Logo and Location */}
          <div className="flex items-center gap-6 w-64 flex-shrink-0">
            <div>
              <Link href="/" className="text-2xl font-extrabold uppercase bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent whitespace-nowrap">
                Shree Grocery Mart
              </Link>
              <div className="flex items-center gap-2 text-xs mt-1">
                <div className="font-semibold text-gray-800">Delivery in 24 minutes</div>
                <div className="flex items-center gap-1 text-gray-700">
                  <MapPin className="w-3 h-3" />
                  <span>New Delhi, 110037</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm text-gray-900"
                autoComplete="off"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSuggestionClick(product)
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-green-50 text-left border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Search className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{highlightMatch(product.name, searchQuery)}</div>
                        <div className="text-xs text-gray-500">{product.unit}</div>
                      </div>
                      <div className="text-sm font-bold text-green-600">{formatPrice(product.price)}</div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative" ref={accountRef}>
              {user ? (
                <div
                  className="flex items-center gap-2 text-gray-800 cursor-pointer hover:text-green-600 transition-colors py-2"
                  onMouseEnter={() => setShowAccountMenu(true)}
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                >
                  <User className="w-5 h-5" />
                  <span className="max-w-[120px] truncate">{user.name || user.email || user.phoneNumber}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-90' : ''}`} />
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-2 text-gray-800 hover:text-green-600 transition-colors">
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              )}

              {/* Account Dropdown Menu */}
              {user && showAccountMenu && (
                <div
                  className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setShowAccountMenu(false)}
                >
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email || user.phoneNumber}</p>
                  </div>

                  {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setShowAccountMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`${item.bg} p-1.5 rounded-md group-hover:bg-white transition-colors`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.label}</span>
                    </Link>
                  ))}

                  <div className="mt-1 pt-1 border-t border-gray-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors group"
                    >
                      <div className="bg-red-50 p-1.5 rounded-md group-hover:bg-white transition-colors">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm font-semibold">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell - Only show for logged in users */}
            {user && <NotificationBell userId={user.id || session?.user?.id} />}

            <Link href="/wishlist" className="relative text-gray-800 hover:text-gray-900 transition">
              <Heart className="w-6 h-6" />
              {mounted && wishlistItems.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </div>
              )}
            </Link>

            <Link href="/cart" className="relative flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-gray-800" />
              {mounted && itemCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </div>
              )}
              <div>
                <div className="text-xs text-gray-700">My Cart</div>
                <div className="text-sm font-semibold text-gray-900">{mounted ? formatPrice(total) : formatPrice(0)}</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden py-3">
          {/* Top Row: Logo */}
          <div className="flex items-center justify-center mb-3">
            <Link href="/" className="text-xl font-extrabold uppercase bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent whitespace-nowrap">
              SHREE GROCERY MART
            </Link>
          </div>

          {/* Bottom Row: Search Bar */}
          <div ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm text-gray-900"
                autoComplete="off"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSuggestionClick(product)
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-green-50 text-left border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Search className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{highlightMatch(product.name, searchQuery)}</div>
                        <div className="text-xs text-gray-500">{product.unit}</div>
                      </div>
                      <div className="text-sm font-bold text-green-600">{formatPrice(product.price)}</div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Category Navigation Bar - Hidden on cart, checkout, account, orders, and wishlist pages */}
        {pathname !== '/cart' && pathname !== '/checkout' && pathname !== '/account' && pathname !== '/orders' && pathname !== '/wishlist' && (
          <div className="bg-white">
            <div className="container mx-auto px-1">
              <div className="flex items-start gap-4 md:gap-6 overflow-x-auto scrollbar-hide mt-[2px] pb-2">
                <Link
                  href="/"
                  className="flex flex-col items-center gap-1 min-w-[70px] group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors flex-shrink-0 ${pathname === '/' ? 'bg-green-600' : 'bg-green-100'
                    }`}>
                    <ShoppingCart className={`w-5 h-5 group-hover:text-white transition-colors ${pathname === '/' ? 'text-white' : 'text-green-600'
                      }`} />
                  </div>
                  <span className={`text-[10px] md:text-xs font-medium group-hover:text-green-600 transition-colors text-center leading-tight w-full ${pathname === '/' ? 'text-green-600 font-semibold' : 'text-gray-700'
                    }`}>
                    All Products
                  </span>
                </Link>
                {categories.map((category) => {
                  const isActive = pathname === `/category/${category.slug}`
                  return (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="flex flex-col items-center gap-1 min-w-[70px] group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors flex-shrink-0 ${isActive ? 'bg-green-600' : 'bg-green-100'
                        }`}>
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <img src="/placeholder-product.svg" alt={category.name} className="w-10 h-10 rounded-full object-cover" />
                        )}
                      </div>
                      <span className={`text-[10px] md:text-xs font-medium group-hover:text-green-600 transition-colors text-center leading-tight w-full break-words ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700'
                        }`}>
                        {category.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}