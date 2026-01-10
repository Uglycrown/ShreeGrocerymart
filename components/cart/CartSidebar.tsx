'use client'

import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, getTotal, getItemsCount } = useCartStore()
  
  const itemsTotal = getTotal()
  const deliveryCharge = 25
  const handlingCharge = 2
  const smallCartCharge = itemsTotal < 100 ? 20 : 0
  const grandTotal = itemsTotal + deliveryCharge + handlingCharge + smallCartCharge

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">My Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Add products to get started</p>
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Delivery Info */}
            <div className="p-4 bg-green-50 border-b">
              <p className="text-sm font-semibold text-green-700">
                Delivery in 24 minutes
              </p>
              <p className="text-xs text-gray-600">Shipment of {getItemsCount()} items</p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1 text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{item.unit}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-green-600 rounded">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4 text-green-600" />
                        </button>
                        <span className="text-sm font-semibold px-2 text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                        {item.originalPrice && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(item.originalPrice * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="border-t p-4 space-y-3">
              <h3 className="font-semibold mb-2 text-gray-900">Bill Details</h3>
              
              <div className="space-y-2 text-sm">
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

              <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
                <span>Grand total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>

              <p className="text-xs text-gray-600">
                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
              </p>

              <Link
                href="/checkout"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-3 rounded-lg transition-colors"
              >
                {formatPrice(grandTotal)} | Login to Proceed →
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
