'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

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

interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true)
        
        // Fetch categories to find current category
        const categoriesRes = await fetch('/api/categories')
        const categories = await categoriesRes.json()
        const currentCategory = categories.find((c: Category) => c.slug === slug)
        
        if (currentCategory) {
          setCategory(currentCategory)
          
          // Fetch products for this category using categoryId
          const productsRes = await fetch(`/api/products?categoryId=${currentCategory.id}`)
          const productsData = await productsRes.json()
          setProducts(productsData)
        }
      } catch (error) {
        console.error('Error fetching category data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryAndProducts()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you're looking for doesn't exist</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 mt-1">{category.description}</p>
            )}
            <p className="text-gray-600 mt-2">
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">No products in this category</h2>
            <p className="text-gray-600 mb-8">Check back later for new products</p>
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
