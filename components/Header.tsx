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
    <header className="sticky top-0 z-50 bg-gradient-to-b from-green-400 to-green-200 shadow-md relative overflow-hidden">
      {/* Background Pattern - Random Scattered Icons */}
      <div className="absolute inset-0 opacity-20 pointer-events-none grayscale">
        {/* Mobile - 30 icons randomly scattered */}
        <div className="absolute top-[5%] left-[3%] text-white text-xl md:text-3xl">🥕</div>
        <div className="absolute top-[8%] left-[25%] text-white text-lg md:text-2xl">🍎</div>
        <div className="absolute top-[12%] left-[48%] text-white text-xl md:text-3xl">🥬</div>
        <div className="absolute top-[6%] left-[72%] text-white text-lg md:text-2xl">🍅</div>
        <div className="absolute top-[10%] left-[89%] text-white text-xl md:text-3xl">🍆</div>
        
        <div className="absolute top-[25%] left-[8%] text-white text-lg md:text-2xl">🥔</div>
        <div className="absolute top-[28%] left-[35%] text-white text-xl md:text-3xl">🌽</div>
        <div className="absolute top-[22%] left-[60%] text-white text-lg md:text-2xl">🥦</div>
        <div className="absolute top-[27%] left-[82%] text-white text-xl md:text-3xl">🍊</div>
        
        <div className="absolute top-[45%] left-[5%] text-white text-xl md:text-3xl">🥒</div>
        <div className="absolute top-[48%] left-[28%] text-white text-lg md:text-2xl">🍋</div>
        <div className="absolute top-[42%] left-[52%] text-white text-xl md:text-3xl">🍌</div>
        <div className="absolute top-[47%] left-[75%] text-white text-lg md:text-2xl">🫐</div>
        <div className="absolute top-[43%] left-[93%] text-white text-xl md:text-3xl">🍓</div>
        
        <div className="absolute top-[65%] left-[12%] text-white text-lg md:text-2xl">🍇</div>
        <div className="absolute top-[68%] left-[38%] text-white text-xl md:text-3xl">🥑</div>
        <div className="absolute top-[62%] left-[65%] text-white text-lg md:text-2xl">🍉</div>
        <div className="absolute top-[67%] left-[85%] text-white text-xl md:text-3xl">🥭</div>
        
        <div className="absolute top-[85%] left-[6%] text-white text-xl md:text-3xl">🥜</div>
        <div className="absolute top-[88%] left-[22%] text-white text-lg md:text-2xl">🌶️</div>
        <div className="absolute top-[82%] left-[45%] text-white text-xl md:text-3xl">🫑</div>
        <div className="absolute top-[87%] left-[68%] text-white text-lg md:text-2xl">🥥</div>
        <div className="absolute top-[83%] left-[90%] text-white text-xl md:text-3xl">🍑</div>
        
        <div className="absolute top-[15%] left-[15%] text-white text-lg md:text-2xl">🍒</div>
        <div className="absolute top-[18%] left-[92%] text-white text-xl md:text-3xl">🥨</div>
        <div className="absolute top-[35%] left-[18%] text-white text-lg md:text-2xl">🧅</div>
        <div className="absolute top-[38%] left-[88%] text-white text-xl md:text-3xl">🧄</div>
        <div className="absolute top-[55%] left-[20%] text-white text-lg md:text-2xl">🫚</div>
        <div className="absolute top-[58%] left-[95%] text-white text-xl md:text-3xl">🥬</div>
        <div className="absolute top-[75%] left-[32%] text-white text-lg md:text-2xl">🍠</div>
        
        {/* Desktop - Additional 20 icons */}
        <div className="hidden md:block absolute top-[7%] left-[40%] text-white text-2xl">🍍</div>
        <div className="hidden md:block absolute top-[13%] left-[55%] text-white text-3xl">🥝</div>
        <div className="hidden md:block absolute top-[9%] left-[78%] text-white text-2xl">🍈</div>
        <div className="hidden md:block absolute top-[20%] left-[12%] text-white text-3xl">🥭</div>
        <div className="hidden md:block absolute top-[23%] left-[45%] text-white text-2xl">🍐</div>
        <div className="hidden md:block absolute top-[29%] left-[70%] text-white text-3xl">🍏</div>
        <div className="hidden md:block absolute top-[32%] left-[25%] text-white text-2xl">🥔</div>
        <div className="hidden md:block absolute top-[37%] left-[42%] text-white text-3xl">🫛</div>
        <div className="hidden md:block absolute top-[40%] left-[68%] text-white text-2xl">🌶️</div>
        <div className="hidden md:block absolute top-[44%] left-[15%] text-white text-3xl">🍆</div>
        <div className="hidden md:block absolute top-[50%] left-[32%] text-white text-2xl">🥕</div>
        <div className="hidden md:block absolute top-[53%] left-[78%] text-white text-3xl">🥒</div>
        <div className="hidden md:block absolute top-[56%] left-[48%] text-white text-2xl">🫑</div>
        <div className="hidden md:block absolute top-[63%] left-[8%] text-white text-3xl">🥬</div>
        <div className="hidden md:block absolute top-[69%] left-[28%] text-white text-2xl">🥦</div>
        <div className="hidden md:block absolute top-[72%] left-[55%] text-white text-3xl">🌽</div>
        <div className="hidden md:block absolute top-[77%] left-[15%] text-white text-2xl">🍅</div>
        <div className="hidden md:block absolute top-[80%] left-[58%] text-white text-3xl">🍓</div>
        <div className="hidden md:block absolute top-[86%] left-[78%] text-white text-2xl">🫐</div>
        <div className="hidden md:block absolute top-[92%] left-[12%] text-white text-3xl">🍇</div>
      </div>
      
      <div className="container mx-auto px-1 relative z-10">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between py-4">
          {/* Logo and Location */}
          <div className="flex items-center gap-6">
            <div>
              <Link href="/" className="text-2xl font-bold text-gray-900">
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
                placeholder='Search "milk"'
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
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
              <div className="flex items-center gap-2 text-gray-800">
                <User className="w-5 h-5" />
                <span>{user.phoneNumber}</span>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-gray-800 hover:text-gray-900">
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
            
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
            <Link href="/" className="text-xl font-bold text-gray-900">
              Shree Grocery Mart
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
                placeholder='Search "milk"'
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
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
        <div className="bg-white">
          <div className="container mx-auto px-1">
            <div className="flex items-center gap-6 py-3 overflow-x-auto scrollbar-hide">
              <Link
                href="/"
                className="flex flex-col items-center gap-1.5 min-w-fit group"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <ShoppingCart className="w-5 h-5 text-green-600 group-hover:text-white" />
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
                    className="flex flex-col items-center gap-1.5 min-w-fit group"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                      <Icon className="w-5 h-5 text-green-600 group-hover:text-white" />
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
