import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const phoneNumber = searchParams.get('phoneNumber')
    const status = searchParams.get('status')
    
    const db = await getDb()
    const filter: any = {}
    
    // Support multiple ways to find orders
    const orFilters = []
    
    if (userId && ObjectId.isValid(userId)) {
      orFilters.push({ userId: new ObjectId(userId) })
    }
    
    if (email) {
      orFilters.push({ customerEmail: email })
    }
    
    if (phoneNumber) {
      orFilters.push({ customerPhone: phoneNumber })
    }
    
    if (orFilters.length > 0) {
      filter.$or = orFilters
    }
    
    if (status) filter.status = status
    
    console.log('Fetching orders with filter:', JSON.stringify(filter))
    
    const orders = await db.collection('Order').find(filter).sort({ createdAt: -1 }).toArray()
    
    const ordersWithDetails = orders.map(order => ({
      _id: order._id.toString(), // Use _id to match frontend expectation
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId?.toString(),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      deliveryAddress: order.deliveryAddress,
      instructions: order.instructions,
      items: order.items,
      subtotal: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      handlingCharge: order.handlingCharge,
      smallCartCharge: order.smallCartCharge,
      total: order.total,
      totalAmount: order.total, // Map total to totalAmount for frontend compatibility
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))
    
    return NextResponse.json(ordersWithDetails)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received order data:', JSON.stringify(data, null, 2))
    
    const db = await getDb()
    console.log('Database connected successfully')
    
    const ordersCount = await db.collection('Order').countDocuments()
    const orderNumber = `ORD${String(ordersCount + 1).padStart(6, '0')}`
    console.log('Generated order number:', orderNumber)
    
    const order = {
      _id: new ObjectId(),
      orderNumber,
      userId: data.userId ? new ObjectId(data.userId) : null,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || '',
      deliveryAddress: data.deliveryAddress,
      instructions: data.instructions || '',
      items: data.items.map((item: any) => ({
        productId: item.productId && ObjectId.isValid(item.productId) ? new ObjectId(item.productId) : null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image,
      })),
      subtotal: data.subtotal,
      deliveryCharge: data.deliveryCharge,
      handlingCharge: data.handlingCharge,
      smallCartCharge: data.smallCartCharge || 0,
      total: data.total,
      paymentMethod: data.paymentMethod || 'COD',
      paymentStatus: data.paymentStatus || 'pending',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    console.log('Attempting to insert order:', JSON.stringify(order, null, 2))
    const result = await db.collection('Order').insertOne(order)
    console.log('Order inserted successfully:', result.insertedId)
    
    return NextResponse.json({ orderId: order._id.toString(), orderNumber: order.orderNumber, message: 'Order placed successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating order:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    return NextResponse.json({ 
      message: 'Failed to create order', 
      error: error.message,
      details: error.toString()
    }, { status: 500 })
  }
}
