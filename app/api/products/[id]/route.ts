import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { serverCache } from '@/lib/server-cache'

async function updateProduct(request: NextRequest, id: string) {
  const body = await request.json()
  const db = await getDb()
  const updateData: any = { updatedAt: new Date() }

  if (body.name) {
    updateData.name = body.name
    updateData.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  }
  if (body.description !== undefined) updateData.description = body.description
  if (body.categoryId) updateData.categoryId = new ObjectId(body.categoryId)
  if (body.images) updateData.images = body.images
  if (body.price) updateData.price = parseFloat(body.price)
  if (body.originalPrice !== undefined) {
    updateData.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null
    if (updateData.originalPrice && body.price) {
      updateData.discount = Math.round(((updateData.originalPrice - parseFloat(body.price)) / updateData.originalPrice) * 100)
    }
  }
  if (body.unit) updateData.unit = body.unit
  if (body.stock !== undefined) updateData.stock = parseInt(body.stock)
  if (body.isActive !== undefined) updateData.isActive = body.isActive
  if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured
  if (body.deliveryTime) updateData.deliveryTime = body.deliveryTime
  if (body.tags) updateData.tags = body.tags

  const result = await db.collection('Product').updateOne({ _id: new ObjectId(id) }, { $set: updateData })
  if (result.matchedCount === 0) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  const product = await db.collection('Product').findOne({ _id: new ObjectId(id) })

  if (!product) {
    return NextResponse.json({ error: 'Product not found after update' }, { status: 404 })
  }

  // Invalidate all product caches to ensure fresh data
  serverCache.invalidatePattern('products:')

  return NextResponse.json({ ...product, id: product._id.toString() })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    return await updateProduct(request, id)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update', message: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    return await updateProduct(request, id)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update', message: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDb()
    const result = await db.collection('Product').deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Invalidate all product caches
    serverCache.invalidatePattern('products:')

    return NextResponse.json({ message: 'Product deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
