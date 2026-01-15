'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, MapPin, Clock, ShoppingBag, Loader2, User } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function CheckoutClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const addressIdParam = searchParams.get('addressId')

  const { data: session, status } = useSession()
  const { items, getTotal, getItemsCount, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const itemsTotal = getTotal()
  const deliveryCharge = 25
  const handlingCharge = 2
  const smallCartCharge = itemsTotal < 100 ? 20 : 0
  const grandTotal = itemsTotal + deliveryCharge + handlingCharge + smallCartCharge

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    city: 'New Delhi',
    pincode: '',
    instructions: '',
  })

  useEffect(() => {
    setMounted(true)

    const storedUser = localStorage.getItem('user')
    const userPhone = localStorage.getItem('userPhone')

    if (status === 'unauthenticated' && !storedUser) {
      router.push('/login?callbackUrl=/checkout')
      return
    }

    let userId = ''
    if (status === 'authenticated' && session?.user) {
      userId = (session.user as any).id
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }))
    } else if (storedUser) {
      const user = JSON.parse(storedUser)
      userId = user.id
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: userPhone || user.phone || prev.phone,
      }))
    }

    if (userId) {
      fetchSavedAddresses(userId)
    }
  }, [status, session, router, addressIdParam])

  const fetchSavedAddresses = async (userId: string) => {
    try {
      const res = await fetch(`/api/addresses?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setSavedAddresses(data)

        let selectedAddr = null

        if (addressIdParam) {
          selectedAddr = data.find((a: any) => a.id === addressIdParam)
        }

        if (!selectedAddr && data.length > 0) {
          selectedAddr = data.find((a: any) => a.isDefault) || data[0]
        }

        if (selectedAddr) {
          setSelectedAddressId(selectedAddr.id)
          setFormData(prev => ({
            ...prev,
            name: selectedAddr.name || prev.name,
            phone: selectedAddr.phone || prev.phone,
            address: selectedAddr.street,
            landmark: selectedAddr.landmark || '',
            city: selectedAddr.city,
            pincode: selectedAddr.pincode
          }))
        }
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsProcessing(true)

    try {
      let userId = ''
      if (session?.user) {
        userId = (session.user as any).id
      } else {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          userId = JSON.parse(userStr).id
        }
      }

      if (!userId) {
        alert('Please login to place an order')
        router.push('/login')
        return
      }

      // Prepare order data
      const orderData = {
        userId: userId,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        deliveryAddress: {
          address: formData.address,
          landmark: formData.landmark,
          city: formData.city,
          pincode: formData.pincode,
        },
        instructions: formData.instructions,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          image: item.image || '',
        })),
        subtotal: itemsTotal,
        deliveryCharge,
        handlingCharge,
        smallCartCharge,
        total: grandTotal,
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        status: 'pending',
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Order placed successfully! Order ID: ' + result.orderNumber)
        clearCart()
        router.push('/orders/' + result.orderId)
      } else {
        const errorMsg = result.error || result.message || 'Unknown error'
        alert('Failed to place order: ' + errorMsg)
      }
    } catch (error: any) {
      console.error('Error placing order:', error)
      alert('Error placing order: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-32 h-32 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products before checkout</p>
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
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/cart" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 pb-24 lg:pb-8">
            <div className="lg:col-span-2">
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Contact Details</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10}" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="9876543210" />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
                    </div>
                  </div>

                  {formData.address ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          {/* Selected Address Label */}
                          {savedAddresses.find(a => a.id === selectedAddressId)?.label && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mb-2">
                              {savedAddresses.find(a => a.id === selectedAddressId)?.label}
                            </span>
                          )}
                          {/* Name and Phone */}
                          <p className="font-bold text-gray-900">{formData.name}</p>
                          <p className="text-sm text-gray-600">{formData.phone}</p>
                          {/* Short Address */}
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {formData.address.length > 40 ? formData.address.substring(0, 40) + '...' : formData.address}
                          </p>
                          <p className="text-xs text-gray-400">{formData.city} - {formData.pincode}</p>
                        </div>
                        <Link
                          href="/checkout/address"
                          className="bg-white text-green-600 border border-green-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-green-50 transition flex-shrink-0 ml-4"
                        >
                          CHANGE
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-4">No address selected</p>
                      <Link
                        href="/checkout/address"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                      >
                        <MapPin className="w-4 h-4" />
                        Select Address
                      </Link>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Instructions (Optional)</label>
                  <textarea name="instructions" value={formData.instructions} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Don't ring the bell" />
                </div>

                {/* Payment */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Payment Method</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 border-green-600 rounded-lg cursor-pointer bg-green-50">
                      <input type="radio" name="payment" value="cod" defaultChecked className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive</div>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h2>

                <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-700" />
                  <div>
                    <div className="font-semibold text-green-700">Delivery in 24 minutes</div>
                    <div className="text-xs text-gray-600">{getItemsCount()} items</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded">
                        <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover rounded" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-600">{item.unit}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-900">
                    <span>Items total</span>
                    <span className="font-semibold">{formatPrice(itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-900">
                    <span>Delivery charge</span>
                    <span className="font-semibold">{formatPrice(deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-900">
                    <span>Handling charge</span>
                    <span className="font-semibold">{formatPrice(handlingCharge)}</span>
                  </div>
                  {smallCartCharge > 0 && (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Small cart charge</span>
                      <span className="font-semibold">{formatPrice(smallCartCharge)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-green-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Desktop Place Order Button */}
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing || !formData.address}
                  className="hidden lg:block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-lg"
                >
                  {isProcessing ? 'Processing...' : `Place Order`}
                </button>

                <p className="text-xs text-gray-600 text-center mt-4">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Place Order Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Amount</span>
            <span className="text-xl font-bold text-gray-900">{formatPrice(grandTotal)}</span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing || !formData.address}
            className="flex-1 max-w-[200px] bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Place Order
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}