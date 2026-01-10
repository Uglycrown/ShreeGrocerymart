'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'
import { ArrowLeft, Search as SearchIcon } from 'lucide-react'

interface Product {
  id: string
  name: string
  images: string[]
  price: number
  originalPrice?: number
  unit: string
  deliveryTime: number
  stock: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`)
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching search results:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [query])

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <SearchIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Start Searching</h1>
            <p className="text-gray-600 mb-8">Enter a product name in the search bar above</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for "{query}"...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
            <p className="text-gray-600">
              Found {products.length} {products.length === 1 ? 'product' : 'products'} for "{query}"
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <SearchIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">No products found</h2>
            <p className="text-gray-600 mb-8">
              We couldn't find any products matching "{query}". Try a different search term.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product) => (
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
        )}
      </div>
    </div>
  )
}
