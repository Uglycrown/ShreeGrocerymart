'use client'

import { ShoppingCart, MapPin, Search, User, Milk, Soup, Wheat, Droplet, Flame, Apple, Cookie, Coffee, Heart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { formatPrice } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'

interface Product {
  id: string
  name: string
  images: string[]
  price: number
  unit: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function Header() {
  const router = useRouter()
  const { items, getItemsCount, getTotal } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<any>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const itemCount = getItemsCount()
  const total = getTotal()
  const { items: wishlistItems } = useWishlistStore()

  // Category icon mapping
  const getCategoryIcon = (slug: string) => {
    const iconMap: { [key: string]: any } = {
      'dairy-eggs': Milk,
      'dals-pulses': Soup,
      'atta-rice-dal': Wheat,
      'oils-ghee': Droplet,
      'masala-spices': Flame,
      'fruits-vegetables': Apple,
      'snacks-namkeen': Cookie,
      'beverages': Coffee,
    }
    return iconMap[slug] || Apple
  }

  useEffect(() => {
    setMounted(true)
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data.slice(0, 10)) // Limit to 10 categories for navbar
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    fetchCategories()
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSuggestionClick = (productName: string) => {
    setSearchQuery(productName)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(productName)}`)
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
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between py-4">
          {/* Logo and Location */}
          <div className="flex items-center gap-6">
            <div>
              <Link href="/" className="text-2xl font-bold text-green-600">
                Shree Grocery Mart
              </Link>
              <div className="flex items-center gap-2 text-xs mt-1">
                <div className="font-semibold text-gray-900">Delivery in 24 minutes</div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>New Delhi, 110037</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder='Search "milk"'
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                autoComplete="off"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSuggestionClick(product.name)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b last:border-b-0"
                    >
                      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{highlightMatch(product.name, searchQuery)}</div>
                        <div className="text-xs text-gray-500">{product.unit}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span>{user.phoneNumber}</span>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-gray-700 hover:text-green-600">
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
            
            <Link href="/wishlist" className="relative text-gray-700 hover:text-green-600 transition">
              <Heart className="w-6 h-6" />
              {mounted && wishlistItems.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </div>
              )}
            </Link>
            
            <Link href="/cart" className="relative flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {mounted && itemCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </div>
              )}
              <div>
                <div className="text-xs text-gray-600">My Cart</div>
                <div className="text-sm font-semibold text-gray-900">{mounted ? formatPrice(total) : formatPrice(0)}</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden py-3">
          {/* Top Row: Logo */}
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="text-xl font-bold text-green-600">
              Shree Grocery Mart
            </Link>
          </div>

          {/* Bottom Row: Search Bar */}
          <div ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder='Search "milk"'
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                autoComplete="off"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSuggestionClick(product.name)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b last:border-b-0"
                    >
                      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{highlightMatch(product.name, searchQuery)}</div>
                        <div className="text-xs text-gray-500">{product.unit}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-8 py-4 overflow-x-auto scrollbar-hide">
              <Link
                href="/"
                className="flex flex-col items-center gap-2 min-w-fit group"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <ShoppingCart className="w-6 h-6 text-green-600 group-hover:text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-green-600 transition-colors text-center">
                  All Products
                </span>
              </Link>
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.slug)
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="flex flex-col items-center gap-2 min-w-fit group"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                      <Icon className="w-6 h-6 text-green-600 group-hover:text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-green-600 transition-colors text-center max-w-[80px]">
                      {category.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
