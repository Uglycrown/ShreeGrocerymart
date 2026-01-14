import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { categoriesCache, CACHE_DURATION, invalidateCategoriesCache } from '@/lib/categories-cache'

// GET all categories
export async function GET() {
  try {
    // Check cache first
    const now = Date.now()
    if (categoriesCache.data && (now - categoriesCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json(categoriesCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      })
    }

    const db = await getDb()
    
    // Optimized query - removed expensive $lookup aggregation
    const categories = await db
      .collection('Category')
      .find(
        { isActive: true },
        {
          projection: {
            _id: 1,
            name: 1,
            slug: 1,
            description: 1,
            image: 1,
            priority: 1,
            isActive: 1,
            order: 1,
          },
        }
      )
      .sort({ order: 1, priority: 1 })
      .toArray()

    // Transform to match expected format
    const formattedCategories = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      priority: cat.priority || 0,
      isActive: cat.isActive ?? true,
    }))

    // Update cache
    categoriesCache.data = formattedCategories
    categoriesCache.timestamp = now

    return NextResponse.json(formattedCategories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
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

    // Invalidate cache
    invalidateCategoriesCache()

    return NextResponse.json({
      id: category._id.toString(),
      ...category
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
