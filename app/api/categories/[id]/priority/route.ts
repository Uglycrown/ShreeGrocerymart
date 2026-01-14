import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { invalidateCategoriesCache } from '@/lib/categories-cache'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const db = await getDb()
    
    const updateData: any = {
      order: parseInt(body.order),
      updatedAt: new Date(),
    }

    const result = await db.collection('Category').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Invalidate cache
    invalidateCategoriesCache()

    const category = await db.collection('Category').findOne({ _id: new ObjectId(id) })
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found after update' }, { status: 404 })
    }

    return NextResponse.json({
      ...category,
      id: category._id.toString(),
    })
  } catch (error: any) {
    console.error('Error updating category priority:', error)
    return NextResponse.json({ error: 'Failed to update priority', message: error.message }, { status: 500 })
  }
}
