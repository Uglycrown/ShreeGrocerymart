'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, MapPin, Phone, FileText } from 'lucide-react'
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
