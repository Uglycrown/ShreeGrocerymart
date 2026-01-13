'use client'

import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, getTotal, getItemsCount } = useCartStore()
  const { data: session, status } = useSession()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (status === 'authenticated' || localStorage.getItem('user')) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  }, [status, isOpen])
  
  const itemsTotal = getTotal()
  const deliveryCharge = 25
  const handlingCharge = 2
  const smallCartCharge = itemsTotal < 100 ? 20 : 0
  const grandTotal = itemsTotal + deliveryCharge + handlingCharge + smallCartCharge

  if (!isOpen || !mounted) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-gray-50 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Cart</h2>
            <p className="text-xs text-gray-500 font-medium">{getItemsCount()} items</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <ShoppingBag className="w-24 h-24 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-900">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Start adding products to see them here</p>
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95 shadow-md"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Delivery Info */}
            <div className="p-3 bg-green-50 flex items-center gap-3 border-b border-green-100">
              <div className="bg-green-600 p-1.5 rounded-full">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">Delivery in 24 minutes</p>
                <p className="text-[10px] text-green-600 uppercase font-bold tracking-wider">Shree Grocery Mart</p>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="relative w-20 h-20 flex-shrink-0 border border-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 mb-0.5 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{item.unit}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                      
                      <div className="flex items-center gap-2 bg-green-600 rounded-lg overflow-hidden p-0.5 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-green-700 text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold px-2 text-white min-w-[20px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-green-700 text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Bill Summary and Checkout */}
            <div className="mt-auto bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
              <div className="p-4 pb-2 space-y-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Bill Details</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> Items total</span>
                    <span className="font-medium text-gray-900">{formatPrice(itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery charge</span>
                    <span className="font-medium text-gray-900">{formatPrice(deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 border-b border-gray-50 pb-2">
                    <span>Handling charge</span>
                    <span className="font-medium text-gray-900">{formatPrice(handlingCharge)}</span>
                  </div>
                  {smallCartCharge > 0 && (
                    <div className="flex justify-between text-orange-600 pt-1 font-medium italic">
                      <span>Small cart charge</span>
                      <span>{formatPrice(smallCartCharge)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Checkout Button Area */}
              <div className="p-4 bg-white">
                <Link
                  href={isLoggedIn ? "/checkout/address" : "/login"}
                  onClick={onClose}
                  className="group flex items-center justify-between bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-green-100"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase opacity-80 tracking-tight">Total</span>
                    <span className="text-xl font-extrabold tracking-tight">{formatPrice(grandTotal)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-700/50 px-4 py-2.5 rounded-lg group-hover:bg-green-800 transition-colors">
                    <span className="font-bold text-sm uppercase tracking-wide">
                      {isLoggedIn ? 'Checkout' : 'Login to Proceed'}
                    </span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
