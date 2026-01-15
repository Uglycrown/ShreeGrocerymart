import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/server-cache'

// GET all categories - Ultra-optimized with in-memory caching
export async function GET(request: NextRequest) {
  try {
    // Check in-memory cache first (instant response)
    const cached = serverCache.get<any[]>(CACHE_KEYS.CATEGORIES)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
        },
      })
    }

    const db = await getDb()

    // Optimized query with lean projection
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
            order: 1,
          },
          maxTimeMS: 3000,
        }
      )
      .sort({ order: 1, priority: 1 })
      .limit(50)
      .toArray()

    // Transform data
    const formattedCategories = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      priority: cat.priority || 0,
      isActive: true,
    }))

    // Store in cache
    serverCache.set(CACHE_KEYS.CATEGORIES, formattedCategories, CACHE_TTL.CATEGORIES)

    return NextResponse.json(formattedCategories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json([], {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=30' },
    })
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const db = await getDb()

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

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
    serverCache.invalidate(CACHE_KEYS.CATEGORIES)

    return NextResponse.json({
      id: category._id.toString(),
      ...category
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
