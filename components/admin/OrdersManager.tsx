'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package, Clock, CheckCircle, XCircle, Truck, Eye, FileText, Bell, BellOff, Volume2, VolumeX } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useOrderNotifications } from '@/lib/hooks/useOrderNotifications'

interface DeliveryAddress {
  addressType?: string;
  address?: string;
  street?: string;
  flat?: string;
  floor?: string;
  area?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  deliveryAddress: DeliveryAddress | string;
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
  onNewOrdersCountChange?: (count: number) => void
}

export default function OrdersManager({ onUpdate, onNewOrdersCountChange }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrderAddress, setSelectedOrderAddress] = useState<DeliveryAddress | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const {
    settings,
    newOrdersCount,
    latestNotification,
    checkNewOrders,
    markOrdersAsSeen,
    clearNotification,
    toggleSound,
    requestNotificationPermission,
  } = useOrderNotifications()

  // Notify parent of new orders count changes
  useEffect(() => {
    onNewOrdersCountChange?.(newOrdersCount)
  }, [newOrdersCount, onNewOrdersCountChange])

  const fetchOrders = useCallback(async () => {
    try {
      const url = statusFilter === 'all' ? '/api/orders' : `/api/orders?status=${statusFilter}`
      const response = await fetch(url)
      const data = await response.json()

      // Check for new orders (only when not filtering)
      if (statusFilter === 'all' && !loading) {
        checkNewOrders(data)
      }

      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      if (loading) setLoading(false)
    }
  }, [statusFilter, loading, checkNewOrders])


  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => {
      fetchOrders()
    }, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [fetchOrders])

  useEffect(() => {
    if (selectedOrder) {
      if (typeof selectedOrder.deliveryAddress === 'string') {
        try {
          const parsedAddress = JSON.parse(selectedOrder.deliveryAddress);
          setSelectedOrderAddress(parsedAddress);
        } catch (e) {
          setSelectedOrderAddress({ address: selectedOrder.deliveryAddress });
        }
      } else {
        setSelectedOrderAddress(selectedOrder.deliveryAddress);
      }
    } else {
      setSelectedOrderAddress(null);
    }
  }, [selectedOrder]);

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
      {/* Enhanced Notification Toast */}
      {latestNotification && (
        <div className="fixed top-4 right-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-white/20 rounded-full p-2">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">🛒 New Order!</p>
                <p className="text-green-100 text-sm mt-1">
                  Order {latestNotification.orderNumber}
                </p>
                <p className="text-white font-medium mt-1">
                  {latestNotification.customerName} • ₹{latestNotification.total.toFixed(2)}
                </p>
              </div>
              <button
                onClick={clearNotification}
                className="text-white/80 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>
            <button
              onClick={() => {
                markOrdersAsSeen(orders.filter(o => o.status === 'pending').map(o => o.id))
                clearNotification()
              }}
              className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-md text-sm font-medium transition-colors"
            >
              Mark All as Seen
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          {newOrdersCount > 0 && (
            <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-6 min-w-[24px] px-2 animate-pulse">
              {newOrdersCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settings.soundEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            title={settings.soundEnabled ? 'Sound notifications on' : 'Sound notifications off'}
          >
            {settings.soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Sound Off</span>
              </>
            )}
          </button>

          {/* Browser Notifications Permission */}
          {'Notification' in window && Notification.permission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              title="Enable browser notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Enable Alerts</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {['all', 'pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status)
              if (status === 'pending') {
                markOrdersAsSeen(orders.filter(o => o.status === 'pending').map(o => o.id))
              }
            }}
            className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap ${statusFilter === status
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
          >
            {status.replace('_', ' ').toUpperCase()}
            {status === 'pending' && newOrdersCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{newOrdersCount}</span>
            )}
          </button>
        ))}
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
                  <td className="px-6 py-4 text-sm text-gray-800">{order.items?.length || 0} items</td>
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
                  <p className="text-gray-900">
                    <span className="font-medium">Address:</span> {' '}
                    {selectedOrderAddress ? (
                      <>
                        {selectedOrderAddress.address || selectedOrderAddress.street || ''}
                        {selectedOrderAddress.landmark && `, ${selectedOrderAddress.landmark}`}
                        {selectedOrderAddress.city && `, ${selectedOrderAddress.city}`}
                        {selectedOrderAddress.pincode && `, ${selectedOrderAddress.pincode}`}
                      </>
                    ) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
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
