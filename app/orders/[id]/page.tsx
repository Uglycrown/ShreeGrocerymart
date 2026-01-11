'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, MapPin, Phone, FileText, XCircle, Clock, Package, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryAddress: { address: string; city: string; pincode: string }
  items: Array<{ name: string; price: number; quantity: number; unit: string; image: string }>
  subtotal: number
  deliveryCharge: number
  total: number
  status: string
  createdAt: string
}

export default function OrderPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetch(`/api/orders/${params.id}`).then(r => r.json()).then(setOrder).catch(() => {})
  }, [params.id])

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />
      case 'confirmed': return <CheckCircle className="w-5 h-5" />
      case 'processing': return <Package className="w-5 h-5" />
      case 'out_for_delivery': return <Truck className="w-5 h-5" />
      case 'delivered': return <CheckCircle className="w-5 h-5" />
      case 'cancelled': return <XCircle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const handleCancelOrder = async () => {
    if (order && confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' }),
        })

        if (response.ok) {
          alert('Order cancelled successfully!')
          setOrder({ ...order, status: 'cancelled' })
        } else {
          alert('Failed to cancel order')
        }
      } catch (error) {
        console.error('Error cancelling order:', error)
        alert('Error cancelling order')
      }
    }
  }

  if (!order) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg mb-4">
            <span className="font-bold text-gray-900">{order.orderNumber}</span>
          </div>
          <div className="flex gap-3 justify-center mt-4">
            <a 
              href={`/api/orders/${params.id}/invoice`} 
              target="_blank"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition"
            >
              <FileText className="w-5 h-5" />
              View Invoice
            </a>
            {['pending', 'confirmed'].includes(order.status) && (
              <button
                onClick={handleCancelOrder}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition"
              >
                <XCircle className="w-5 h-5" />
                Cancel Order
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Order Status</h2>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${getStatusBadge(order.status)}`}>
            {getStatusIcon(order.status)}
            <span>{order.status.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Delivery Info</h2>
          <div className="space-y-3">
            <div className="flex gap-3"><MapPin className="w-5 h-5 text-gray-400" /><div><p className="font-semibold text-gray-900">{order.customerName}</p><p className="text-gray-600">{order.deliveryAddress.address}, {order.deliveryAddress.city}</p></div></div>
            <div className="flex gap-3"><Phone className="w-5 h-5 text-gray-400" /><span className="text-gray-900">{order.customerPhone}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Items</h2>
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 pb-4 border-b last:border-b-0 mb-4">
              {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded" />}
              <div className="flex-1"><h3 className="font-semibold text-gray-900">{item.name}</h3><p className="text-sm text-gray-600">{item.unit}</p></div>
              <div className="text-right"><p className="text-sm text-gray-600">Qty: {item.quantity}</p><p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between mb-2 text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between mb-2 text-gray-600"><span>Delivery</span><span>{formatPrice(order.deliveryCharge)}</span></div>
          <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
        <Link href="/" className="block w-full bg-green-600 text-white py-3 rounded-lg text-center font-semibold">Continue Shopping</Link>
      </div>
    </div>
  )
}
