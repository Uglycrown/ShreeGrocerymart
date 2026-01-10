import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET all categories
export async function GET() {
  try {
    const db = await getDb()
    const categories = await db.collection('Category')
      .find({})
      .sort({ priority: 1 })
      .toArray()

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await db.collection('Product').countDocuments({ categoryId: cat._id })
        
        return {
          id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          priority: cat.priority || 0,
          isActive: cat.isActive ?? true,
          _count: { products: productCount },
        }
      })
    )

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
