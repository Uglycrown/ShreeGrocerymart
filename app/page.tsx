'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'
import CartSidebar from '@/components/cart/CartSidebar'
import { ChevronRight, ShoppingBag } from 'lucide-react'

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
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
    }
  }

  const heroBanner = banners.find((b) => b.type === 'HERO')
  const categoryBanners = banners.filter((b) => b.type === 'CATEGORY')
  const featuredProducts = products.filter((p) => p.isFeatured)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
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
                    src={banner.image || '/placeholder.png'}
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
              {category.image && (
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-1.5 sm:mb-2 md:mb-3">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              )}
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

      {/* Empty State */}
      {products.length === 0 && (
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

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-colors z-30"
      >
        <ShoppingBag className="w-6 h-6" />
      </button>
    </div>
  )
}
