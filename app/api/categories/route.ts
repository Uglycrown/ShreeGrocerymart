import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET all categories - Optimized for Vercel
export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    
    // Use a timeout to prevent long-running queries
    const queryTimeout = 5000 // 5 seconds max
    
    // Optimized query with timeout
    const categoriesPromise = db
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
          maxTimeMS: queryTimeout,
        }
      )
      .sort({ order: 1, priority: 1 })
      .limit(100) // Limit results to prevent large responses
      .toArray()

    const categories = await Promise.race([
      categoriesPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), queryTimeout)
      )
    ]) as any[]

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

    return NextResponse.json(formattedCategories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600, max-age=60',
        'CDN-Cache-Control': 'public, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    
    // Return empty array instead of error for better UX
    if (error.message === 'Query timeout') {
      return NextResponse.json([], {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60',
        },
      })
    }
    
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
