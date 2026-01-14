import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    const category = await db.collection('Category').findOne({ _id: new ObjectId(id) })
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...category,
      id: category._id.toString(),
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const db = await getDb()
    
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.name) {
      updateData.name = body.name
      updateData.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }
    if (body.description !== undefined) updateData.description = body.description
    if (body.image) updateData.image = body.image
    if (body.order !== undefined) updateData.order = parseInt(body.order)

    const result = await db.collection('Category').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const category = await db.collection('Category').findOne({ _id: new ObjectId(id) })
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found after update' }, { status: 404 })
    }

    return NextResponse.json({
      ...category,
      id: category._id.toString(),
    })
  } catch (error: any) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category', message: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const db = await getDb()
    
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.name) {
      updateData.name = body.name
      updateData.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }
    if (body.description !== undefined) updateData.description = body.description
    if (body.image) updateData.image = body.image
    if (body.order !== undefined) updateData.order = parseInt(body.order)

    const result = await db.collection('Category').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const category = await db.collection('Category').findOne({ _id: new ObjectId(id) })
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found after update' }, { status: 404 })
    }

    return NextResponse.json({
      ...category,
      id: category._id.toString(),
    })
  } catch (error: any) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category', message: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    
    const result = await db.collection('Category').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
