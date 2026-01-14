import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET all categories
export async function GET() {
  try {
    const db = await getDb()
    const pipeline = [
      {
        $lookup: {
          from: 'Product',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products',
        },
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
        },
      },
      {
        $sort: { order: 1 },
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          slug: 1,
          description: 1,
          image: 1,
          priority: { $ifNull: ['$priority', 0] },
          isActive: { $ifNull: ['$isActive', true] },
          _count: { products: '$productCount' },
          _id: 0,
        },
      },
    ]

    const categoriesWithCounts = await db.collection('Category').aggregate(pipeline).toArray()
    return NextResponse.json(categoriesWithCounts)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = await getDb()

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Get max priority
    const maxPriorityCategory = await db.collection('Category')
      .find({})
      .sort({ priority: -1 })
      .limit(1)
      .toArray()

    const newPriority = (maxPriorityCategory[0]?.priority || 0) + 1

    const category = {
      _id: new ObjectId(),
      name: data.name,
      slug,
      description: data.description || '',
      image: data.image || '',
      priority: newPriority,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('Category').insertOne(category)

    return NextResponse.json({
      id: category._id.toString(),
      ...category
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
