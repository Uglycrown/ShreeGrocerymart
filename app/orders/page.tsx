'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Clock, CheckCircle, XCircle, ChevronRight, ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Order {
  _id: string
  orderNumber: string
  status: string
  totalAmount: number
  items: any[]
  deliveryAddress: any
  createdAt: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const phoneNumber = localStorage.getItem('userPhone')
      if (!phoneNumber) {
        setLoading(false)
        return
      }

      const res = await fetch(`/api/orders?phoneNumber=${phoneNumber}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-green-600 md:hidden"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-600">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gray-100 rounded-full p-8 mb-6">
              <Package className="w-24 h-24 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6 text-center">
              When you place an order, it will appear here
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => router.push(`/orders/${order._id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
              >
                <div className="p-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Package className="w-4 h-4" />
                      <span>{order.items.length} items</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 bg-gray-50 rounded px-3 py-2 text-sm"
                        >
                          <span className="text-gray-900 font-medium">
                            {item.quantity}x
                          </span>{' '}
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex-shrink-0 bg-gray-50 rounded px-3 py-2 text-sm text-gray-600">
                          +{order.items.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
