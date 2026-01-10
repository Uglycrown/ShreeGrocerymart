'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Star, Clock, Truck, Shield, Check } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string
  images: string[]
  price: number
  originalPrice?: number
  discount?: number
  unit: string
  stock: number
  tags: string[]
  deliveryTime: number
  category: {
    id: string
    name: string
    slug: string
  }
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [shareSuccess, setShareSuccess] = useState(false)
  const { addItem, items } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()

  const itemInCart = items.find((item) => item.id === product?.id)
  const inWishlist = product ? isInWishlist(product.id) : false

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchProduct = async (slug: string) => {
    try {
      // First try to fetch by searching product name
      const searchTerm = slug.replace(/-/g, ' ')
      const res = await fetch(`/api/products`)
      const data = await res.json()
      
      // Find product by matching slug or name
      const foundProduct = data.find((p: any) => {
        const productSlug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const searchSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
        return productSlug === searchSlug || p.name.toLowerCase().includes(searchTerm.toLowerCase())
      })
      
      if (foundProduct) {
        setProduct(foundProduct)
        if (foundProduct.category?.id) {
          fetchRelatedProducts(foundProduct.category.id, foundProduct.id)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async (categoryId: string, currentProductId: string) => {
    try {
      const res = await fetch(`/api/products?categoryId=${categoryId}`)
      const data = await res.json()
      setRelatedProducts(data.filter((p: any) => p.id !== currentProductId).slice(0, 6))
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      unit: product.unit,
      quantity: 1,
      deliveryTime: product.deliveryTime || 10,
    })
  }

  const handleWishlistToggle = () => {
    if (!product) return
    
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        unit: product.unit,
      })
    }
  }

  const handleShare = async () => {
    if (!product) return
    
    const url = window.location.href
    const text = `Check out ${product.name} on Shree Grocery Mart!`
    
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: text,
          url: url,
        })
      } catch (error) {
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      } catch (error) {
        console.error('Failed to copy link')
      }
    }
  }

  const nextImage = () => {
    if (product) {
      setSelectedImage((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <button
          onClick={() => router.push('/')}
          className="text-green-600 hover:text-green-700"
        >
          Return to home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => router.push('/')} className="hover:text-green-600">
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => router.push(`/category/${product.category.slug}`)}
              className="hover:text-green-600"
            >
              {product.category.name}
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="relative aspect-square">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  unoptimized={product.images[selectedImage].startsWith('data:')}
                />
                
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {product.discount && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.discount}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square border-2 rounded-lg overflow-hidden ${
                      selectedImage === idx ? 'border-green-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={img.startsWith('data:')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-gray-600">{product.unit}</span>
              <span className="text-gray-300">|</span>
              <span className={`${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-green-600 font-semibold">
                      Save {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">About this product</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Clock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-xs text-gray-600">Delivery in</div>
                <div className="font-semibold">{product.deliveryTime} mins</div>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-xs text-gray-600">Free Delivery</div>
                <div className="font-semibold">Above ₹99</div>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-xs text-gray-600">Quality</div>
                <div className="font-semibold">Assured</div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3">
              {itemInCart ? (
                <button
                  onClick={() => router.push('/cart')}
                  className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  View Cart ({itemInCart.quantity})
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              )}
              
              <button 
                onClick={handleWishlistToggle}
                className={`relative border-2 p-4 rounded-lg transition ${
                  inWishlist 
                    ? 'bg-red-50 border-red-500 text-red-500' 
                    : 'bg-white border-gray-300 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
              
              <button 
                onClick={handleShare}
                className="relative bg-white border-2 border-gray-300 p-4 rounded-lg hover:border-green-600 hover:text-green-600 transition"
              >
                {shareSuccess ? (
                  <Check className="w-6 h-6 text-green-600" />
                ) : (
                  <Share2 className="w-6 h-6" />
                )}
                {shareSuccess && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Link copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {relatedProducts.map((relatedProduct) => {
                const relatedSlug = relatedProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                return (
                  <div
                    key={relatedProduct.id}
                    onClick={() => router.push(`/product/${relatedSlug}`)}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                        unoptimized={relatedProduct.images[0].startsWith('data:')}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{relatedProduct.unit}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">
                          {formatPrice(relatedProduct.price)}
                        </span>
                        {relatedProduct.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(relatedProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
