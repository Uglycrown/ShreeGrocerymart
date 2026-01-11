'use client'

import { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle, Truck, Eye, FileText } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  deliveryAddress: {
    address: string
    city: string
    pincode: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  createdAt: string
}

interface OrdersManagerProps {
  onUpdate: () => void
}

export default function OrdersManager({ onUpdate }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const url = statusFilter === 'all' ? '/api/orders' : `/api/orders?status=${statusFilter}`
      const response = await fetch(url)
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        alert('Order status updated successfully!')
        fetchOrders()
        onUpdate()
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order status')
    }
  }

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      })

      if (response.ok) {
        alert('Payment status updated successfully!')
        fetchOrders()
        onUpdate()
      } else {
        alert('Failed to update payment status')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('Error updating payment status')
    }
  }

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
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Package className="w-4 h-4" />
      case 'out_for_delivery': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                statusFilter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-900">{order.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{order.items.length} items</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`text-sm rounded-full px-3 py-1 font-semibold ${getStatusBadge(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <a
                        href={`/api/orders/${order.id}/invoice`}
                        target="_blank"
                        className="text-green-600 hover:text-green-800"
                        title="View Invoice"
                      >
                        <FileText className="w-5 h-5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-900">
            No orders found
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Order Details - {selectedOrder.orderNumber}</h3>
                <div className="flex gap-3 items-center">
                  <a
                    href={`/api/orders/${selectedOrder.id}/invoice`}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    Invoice
                  </a>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-900 hover:text-gray-900 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  <p className="text-gray-900"><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                  <p className="text-gray-900"><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                  <p className="text-gray-900"><span className="font-medium">Address:</span> {selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.pincode}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between bg-gray-50 rounded p-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-800">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  <p className="text-gray-900"><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
                  <p className="text-gray-900"><span className="font-medium">Status:</span> {selectedOrder.paymentStatus}</p>
                  <p className="text-lg font-bold text-gray-900"><span className="font-medium">Total:</span> {formatPrice(selectedOrder.total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
