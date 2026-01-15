import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { sendPushNotification, getOrderStatusMessage } from '@/lib/web-push'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDb()
    const order = await db.collection('Order').findOne({ _id: new ObjectId(id) })
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    return NextResponse.json({
      id: order._id.toString(), orderNumber: order.orderNumber, userId: order.userId?.toString(),
      customerName: order.customerName, customerPhone: order.customerPhone, customerEmail: order.customerEmail,
      deliveryAddress: order.deliveryAddress, instructions: order.instructions, items: order.items,
      subtotal: order.subtotal, deliveryCharge: order.deliveryCharge, handlingCharge: order.handlingCharge,
      smallCartCharge: order.smallCartCharge, total: order.total, paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus, status: order.status, createdAt: order.createdAt, updatedAt: order.updatedAt,
    })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('Updating order:', id)

    const data = await request.json()
    console.log('Update data:', data)

    const db = await getDb()

    // Get current order to check status change
    const currentOrder = await db.collection('Order').findOne({ _id: new ObjectId(id) })
    if (!currentOrder) return NextResponse.json({ message: 'Order not found' }, { status: 404 })

    const updateData: any = { updatedAt: new Date() }
    if (data.status) updateData.status = data.status
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus

    console.log('Update payload:', updateData)

    const result = await db.collection('Order').updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    console.log('Update result:', result)

    // If status changed, send push notification and create in-app notification
    if (data.status && data.status !== currentOrder.status) {
      const message = getOrderStatusMessage(data.status, currentOrder.orderNumber)

      // Store in-app notification
      await db.collection('Notification').insertOne({
        _id: new ObjectId(),
        userId: currentOrder.userId,
        orderId: new ObjectId(id),
        orderNumber: currentOrder.orderNumber,
        type: 'order_status',
        title: message.title,
        body: message.body,
        url: `/orders/${id}`,
        status: data.status,
        isRead: false,
        createdAt: new Date(),
      })

      // Send push notification to user's subscribed devices
      if (currentOrder.userId) {
        const subscriptions = await db.collection('PushSubscription')
          .find({ userId: currentOrder.userId })
          .toArray()

        console.log(`📱 Sending push to ${subscriptions.length} devices`)

        for (const sub of subscriptions) {
          try {
            await sendPushNotification(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              { ...message, url: `/orders/${id}`, tag: `order-${id}` }
            )
          } catch (error) {
            console.error('Push failed:', error)
            // Remove expired subscriptions
            if ((error as any)?.statusCode === 410) {
              await db.collection('PushSubscription').deleteOne({ _id: sub._id })
            }
          }
        }
      }

      console.log('📱 Order notification created:', message.title)
    }

    return NextResponse.json({ message: 'Order updated successfully' })
  } catch (error: any) {
    console.error('Error updating order:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ message: 'Failed to update order', error: error.message }, { status: 500 })
  }
}

