'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'
import CartSidebar from '@/components/cart/CartSidebar'
import Footer from '@/components/Footer'
import { ChevronRight, ShoppingBag, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/store'

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Start fetching data immediately (in background while loader shows)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [productsRes, categoriesRes, bannersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/banners'),
      ])

      const [productsData, categoriesData, bannersData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        bannersRes.json(),
      ])

      setProducts(productsData)
      setCategories(categoriesData)
      setBanners(bannersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const heroBanner = banners.find((b) => b.type === 'HERO')
  const categoryBanners = banners.filter((b) => b.type === 'CATEGORY')
  const featuredProducts = products.filter((p) => p.isFeatured)
  const { getItemsCount } = useCartStore()
  const cartCount = getItemsCount()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... Hero, Category, Products ... */}

      {heroBanner && (
        <section className="bg-gradient-to-r from-green-400 to-green-600 py-16 px-4">
          <div className="container mx-auto text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{heroBanner.title}</h1>
            {heroBanner.subtitle && (
              <p className="text-xl mb-6">{heroBanner.subtitle}</p>
            )}
            {heroBanner.link && (
              <Link
                href={heroBanner.link}
                className="inline-block bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {heroBanner.ctaText || 'Shop Now'}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Category Banners */}
      {categoryBanners.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryBanners.slice(0, 3).map((banner) => (
              <Link
                key={banner.id}
                href={banner.link || '#'}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={banner.image || '/placeholder-product.svg'}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-600 mb-3">{banner.subtitle}</p>
                  )}
                  <span className="text-green-600 font-semibold">
                    {banner.ctaText || 'Order Now'} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {categories.slice(0, 20).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="bg-white rounded-lg p-2 sm:p-3 md:p-4 text-center hover:shadow-lg transition-shadow"
            >
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-1.5 sm:mb-2 md:mb-3">
                <Image
                  src={category.image || '/placeholder-product.svg'}
                  alt={category.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <h3 className="font-semibold text-[10px] sm:text-xs md:text-sm text-gray-900 line-clamp-2">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-green-600 font-semibold flex items-center gap-1">
              See all <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {featuredProducts.slice(0, 12).map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.images[0]}
                price={product.price}
                originalPrice={product.originalPrice}
                unit={product.unit}
                deliveryTime={product.deliveryTime}
                stock={product.stock}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Products by Category */}
      {categories.map((category) => {
        const categoryProducts = products.filter((p) => p.categoryId === category.id).slice(0, 6)
        if (categoryProducts.length === 0) return null

        return (
          <section key={category.id} className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              <Link
                href={`/category/${category.slug}`}
                className="text-green-600 font-semibold flex items-center gap-1"
              >
                See all <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.images[0]}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  unit={product.unit}
                  deliveryTime={product.deliveryTime}
                  stock={product.stock}
                />
              ))}
            </div>
          </section>
        )
      })}

      {/* Loading State */}
      {isLoading && (
        <div className="container mx-auto px-4 py-8">
          {/* Category Skeleton */}
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Shop by Category</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-2 sm:p-3 md:p-4 animate-pulse">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-1.5 sm:mb-2 md:mb-3 bg-gray-200 rounded-full" />
                <div className="h-3 bg-gray-200 rounded mx-auto w-3/4" />
              </div>
            ))}
          </div>

          {/* Products Skeleton */}
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Featured Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-200 rounded mb-2 w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - only show after loading completes with no products */}
      {!isLoading && products.length === 0 && (
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900">No products available</h2>
          <p className="text-gray-600 mb-6">Start adding products from the admin dashboard</p>
          <Link
            href="/admin"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Footer */}
      <Footer />

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className={`fixed bottom-24 md:bottom-8 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all z-30 shadow-[0_4px_20px_rgba(0,0,0,0.15)] ${mounted && cartCount > 0 ? 'animate-bounce' : ''}`}
      >
        <ShoppingBag className="w-6 h-6" />
        {mounted && cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  )
}
