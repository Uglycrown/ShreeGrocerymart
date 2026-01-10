import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb()
    const order = await db.collection('Order').findOne({ _id: new ObjectId(params.id) })
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const db = await getDb()
    const updateData: any = { updatedAt: new Date() }
    if (data.status) updateData.status = data.status
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus
    const result = await db.collection('Order').updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })
    if (result.matchedCount === 0) return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    return NextResponse.json({ message: 'Order updated successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 })
  }
}
