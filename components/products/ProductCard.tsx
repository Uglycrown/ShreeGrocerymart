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
    const slug = name.toLowerCase().replace(/\s+/g, '-')
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
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-square mb-3">
        <Image
          src={image || '/placeholder.png'}
          alt={name}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {deliveryTime} MINS
        </div>
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 h-10 text-gray-900">{name}</h3>
        <p className="text-xs text-gray-600">{unit}</p>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {quantity === 0 ? (
          <button
            onClick={handleAddClick}
            disabled={stock === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {stock === 0 ? 'OUT OF STOCK' : 'ADD'}
          </button>
        ) : (
          <div className="flex items-center justify-between bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
            <button
              onClick={(e) => handleUpdateQuantity(quantity - 1, e)}
              className="hover:bg-green-700 p-1 rounded"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span>{quantity}</span>
            <button
              onClick={(e) => handleUpdateQuantity(quantity + 1, e)}
              disabled={quantity >= stock}
              className="hover:bg-green-700 p-1 rounded disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
