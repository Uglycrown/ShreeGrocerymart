'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, MapPin, Clock, ShoppingBag } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, getItemsCount, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  
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
    city: '',
    pincode: '',
    instructions: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        alert('Please login to place an order')
        router.push('/login')
        return
      }

      const user = JSON.parse(userStr)

      // Prepare order data
      const orderData = {
        userId: user.id,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        deliveryAddress: {
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        },
        instructions: formData.instructions,
        items: items.map(item => ({
          productId: item.id,
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
      console.log('Order API response:', result)

      if (response.ok) {
        alert('Order placed successfully! Order ID: ' + result.orderNumber)
        clearCart()
        router.push('/orders/' + result.orderId)
      } else {
        const errorMsg = result.error || result.message || 'Unknown error'
        const errorDetails = result.details ? '\n\nDetails: ' + result.details : ''
        console.error('Order failed:', result)
        alert('Failed to place order: ' + errorMsg + errorDetails)
      }
    } catch (error: any) {
      console.error('Error placing order:', error)
      alert('Error placing order: ' + error.message + '\nPlease try again.')
    } finally {
      setIsProcessing(false)
    }
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complete Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="House No., Building Name, Street, Locality"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="New Delhi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="110037"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Any special instructions for delivery"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-green-600 rounded-lg cursor-pointer bg-green-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      defaultChecked
                      className="w-5 h-5 text-green-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when you receive</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-not-allowed opacity-50">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      disabled
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Online Payment</div>
                      <div className="text-sm text-gray-600">Coming soon</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Place Order`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h2>
              
              <div className="bg-green-50 rounded-lg p-3 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-700">Delivery in 24 minutes</div>
                  <div className="text-xs text-gray-600">{getItemsCount()} items</div>
                </div>
              </div>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded">
                      <Image
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
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

              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-green-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 text-center mt-4">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
