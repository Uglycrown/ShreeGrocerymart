'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, getItemsCount, clearCart } = useCartStore()
  
  const itemsTotal = getTotal()
  const deliveryCharge = 25
  const handlingCharge = 2
  const smallCartCharge = itemsTotal < 100 ? 20 : 0
  const grandTotal = itemsTotal + deliveryCharge + handlingCharge + smallCartCharge

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-32 h-32 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products to get started</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Cart ({getItemsCount()} items)</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg">
                      <Image
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.unit}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 border border-green-600 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 rounded-l-lg"
                          >
                            <Minus className="w-5 h-5 text-green-600" />
                          </button>
                          <span className="text-lg font-semibold px-4 text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 rounded-r-lg"
                          >
                            <Plus className="w-5 h-5 text-green-600" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                          {item.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Delivery in {item.deliveryTime} mins
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-900">
                  <span>Items total</span>
                  <span className="font-semibold">{formatPrice(itemsTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-900">
                  <span>Delivery charge</span>
                  <span className="font-semibold">{formatPrice(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between text-gray-900">
                  <span>Handling charge</span>
                  <span className="font-semibold">{formatPrice(handlingCharge)}</span>
                </div>
                {smallCartCharge > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Small cart charge</span>
                    <span className="font-semibold">{formatPrice(smallCartCharge)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900">Grand Total</span>
                  <span className="text-green-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-4 rounded-lg transition-colors mb-3"
              >
                Proceed to Checkout
              </Link>

              <p className="text-xs text-gray-600 text-center">
                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
              </p>

              {smallCartCharge > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-orange-700">
                    💡 Add items worth {formatPrice(100 - itemsTotal)} more to avoid small cart charge of {formatPrice(smallCartCharge)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
