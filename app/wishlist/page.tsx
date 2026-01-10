'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function WishlistPage() {
  const router = useRouter()
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const { addItem: addToCart, items: cartItems } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = (item: any) => {
    addToCart({
      id: Date.now().toString(),
      productId: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      unit: item.unit,
      quantity: 1,
      deliveryTime: 24,
    })
  }

  const handleRemove = (id: string) => {
    removeItem(id)
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist()
    }
  }

  const isInCart = (productId: string) => {
    return cartItems.some((item) => item.productId === productId)
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">Loading wishlist...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-green-600">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-600">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            {items.length > 0 && (
              <button onClick={handleClearAll} className="text-red-600 hover:text-red-700 font-semibold text-sm">Clear All</button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gray-100 rounded-full p-8 mb-6"><Heart className="w-24 h-24 text-gray-400" /></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save items you love to buy them later!</p>
            <button onClick={() => router.push('/')} className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition">Start Shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const inCart = isInCart(item.id)
              const slug = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div onClick={() => router.push(`/product/${slug}`)} className="relative aspect-square cursor-pointer group">
                    <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized={item.image.startsWith('data:')} />
                    <button onClick={(e) => { e.stopPropagation(); handleRemove(item.id) }} className="absolute top-2 right-2 bg-white hover:bg-red-50 p-2 rounded-full shadow-md transition">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 onClick={() => router.push(`/product/${slug}`)} className="font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-green-600">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.unit}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-gray-900">{formatPrice(item.price)}</span>
                    </div>
                    {inCart ? (
                      <button onClick={() => router.push('/cart')} className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-200 transition">View in Cart</button>
                    ) : (
                      <button onClick={() => handleAddToCart(item)} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
