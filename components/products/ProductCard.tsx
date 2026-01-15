'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { Clock, Minus, Plus } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  unit: string
  deliveryTime: number
  stock: number
}

export default function ProductCard({
  id,
  name,
  image,
  price,
  originalPrice,
  unit,
  deliveryTime,
  stock,
}: ProductCardProps) {
  const router = useRouter()
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find((item) => item.productId === id)
  const quantity = cartItem?.quantity || 0

  const handleCardClick = () => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    router.push(`/product/${slug}`)
  }

  const handleAdd = () => {
    console.log('Adding to cart:', { id, name, price })
    addItem({
      id: Date.now().toString(),
      productId: id,
      name,
      image,
      price,
      originalPrice,
      unit,
      quantity: 1,
      deliveryTime,
    })
  }

  const handleUpdateQuantity = (newQuantity: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    console.log('Updating quantity:', { id, currentQuantity: quantity, newQuantity })
    updateQuantity(id, newQuantity)
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleAdd()
  }

  const discount = originalPrice ? calculateDiscount(originalPrice, price) : 0

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 md:p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-square mb-1.5 sm:mb-2 md:mb-3">
        <Image
          src={image || '/placeholder-product.svg'}
          alt={name}
          fill
          className="object-cover rounded"
        />
        <div className="absolute top-1 left-1 bg-gray-900/80 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded flex items-center gap-0.5 sm:gap-1">
          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {deliveryTime} MIN
        </div>
        {discount > 0 && (
          <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-semibold">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
        <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 text-gray-900 leading-tight">{name}</h3>
        <p className="text-[10px] sm:text-xs text-gray-600">{unit}</p>

        {/* Price and Add Button */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">{formatPrice(price)}</span>
            {originalPrice && (
              <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {quantity === 0 ? (
            <button
              onClick={handleAddClick}
              disabled={stock === 0}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 sm:py-2 sm:px-4 md:px-6 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-[10px] sm:text-xs md:text-sm"
            >
              {stock === 0 ? 'OUT' : 'ADD'}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 bg-green-600 text-white font-semibold py-1 px-1.5 sm:py-1.5 sm:px-2 md:py-2 md:px-3 rounded-lg">
              <button
                onClick={(e) => handleUpdateQuantity(quantity - 1, e)}
                className="hover:bg-green-700 p-0.5 sm:p-1 rounded"
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              </button>
              <span className="min-w-[16px] sm:min-w-[20px] text-center text-xs sm:text-sm">{quantity}</span>
              <button
                onClick={(e) => handleUpdateQuantity(quantity + 1, e)}
                disabled={quantity >= stock}
                className="hover:bg-green-700 p-0.5 sm:p-1 rounded disabled:opacity-50"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
