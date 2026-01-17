import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/server-cache'

// Pre-cache categories for faster lookups
let categoriesMap: Map<string, any> | null = null
let categoriesMapTimestamp = 0
const CATEGORIES_MAP_TTL = 5 * 60 * 1000 // 5 minutes

async function getCategoriesMap(db: any): Promise<Map<string, any>> {
  const now = Date.now()
  if (categoriesMap && now - categoriesMapTimestamp < CATEGORIES_MAP_TTL) {
    return categoriesMap
  }

  const categories = await db
    .collection('Category')
    .find({}, { projection: { _id: 1, name: 1, slug: 1 } })
    .toArray()

  categoriesMap = new Map()
  for (const cat of categories) {
    categoriesMap.set(cat._id.toString(), {
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
    })
  }
  categoriesMapTimestamp = now
  return categoriesMap
}

// GET all products with filters - Ultra-optimized
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const timeSlot = searchParams.get('timeSlot')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    const admin = searchParams.get('admin') === 'true'

    // Generate cache key based on params
    const cacheKey = `products:${categoryId || ''}:${category || ''}:${search || ''}:${featured || ''}:${timeSlot || ''}:${limit}`

    // Check cache for non-search queries (skip cache for admin requests)
    if (!search && !admin) {
      const cached = serverCache.get<any[]>(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
            'X-Cache': 'HIT',
          },
        })
      }
    }

    const db = await getDb()

    // Build optimized query
    // For admin panel, show all products including inactive ones
    const query: any = admin ? {} : { isActive: true }

    if (categoryId) {
      query.categoryId = new ObjectId(categoryId)
    }

    if (featured === 'true') {
      query.isFeatured = true
    }

    if (search) {
      query.$and = query.$and || []
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ]
      })
    }

    // Filter by time slot - also include products without timeSlots field (backward compatibility)
    if (timeSlot) {
      query.$and = query.$and || []
      query.$and.push({
        $or: [
          { timeSlots: { $in: [timeSlot, 'ALL_DAY'] } },
          { timeSlots: { $exists: false } },
          { timeSlots: { $size: 0 } }
        ]
      })
    }

    // Get categories map for fast lookups (avoids $lookup)
    const catMap = await getCategoriesMap(db)

    // Handle category slug filter
    if (category) {
      // Find category ID from slug
      for (const [id, cat] of catMap.entries()) {
        if (cat.slug === category) {
          query.categoryId = new ObjectId(id)
          break
        }
      }
    }

    // Optimized query - NO $lookup, NO $unwind
    const products = await db
      .collection('Product')
      .find(query, {
        projection: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          images: 1,
          price: 1,
          originalPrice: 1,
          discount: 1,
          unit: 1,
          stock: 1,
          isFeatured: 1,
          deliveryTime: 1,
          tags: 1,
          categoryId: 1,
        },
        maxTimeMS: 5000,
      })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit)
      .toArray()

    // Transform with category info from map (super fast)
    const productsWithCategory = products.map(product => {
      const catId = product.categoryId?.toString()
      const categoryInfo = catId ? catMap.get(catId) : null

      return {
        id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images || [],
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        unit: product.unit,
        stock: product.stock,
        isFeatured: product.isFeatured,
        deliveryTime: product.deliveryTime,
        tags: product.tags,
        categoryId: catId,
        category: categoryInfo,
      }
    })

    // Cache for non-search queries
    if (!search) {
      serverCache.set(cacheKey, productsWithCategory, CACHE_TTL.PRODUCTS)
    }

    return NextResponse.json(productsWithCategory, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        'CDN-Cache-Control': 'public, s-maxage=120',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json([], {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=30' },
    })
  }
}

// POST create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const db = await getDb()

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const discount = body.originalPrice
      ? Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100)
      : null

    const product = {
      _id: new ObjectId(),
      name: body.name,
      slug: slug,
      description: body.description || '',
      categoryId: new ObjectId(body.categoryId),
      images: body.images || [],
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
      discount: discount,
      unit: body.unit,
      stock: parseInt(body.stock),
      isActive: body.isActive ?? true,
      isFeatured: body.isFeatured ?? false,
      deliveryTime: body.deliveryTime || 24,
      tags: body.tags || [],
      timeSlots: body.timeSlots || ['ALL_DAY'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('Product').insertOne(product)

    // Invalidate all product caches
    serverCache.invalidatePattern('products:')

    const category = await db.collection('Category').findOne({ _id: product.categoryId })

    return NextResponse.json({
      ...product,
      id: product._id.toString(),
      category: category ? {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
      } : null,
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json({
      error: 'Failed to create product',
      message: error.message,
    }, { status: 500 })
  }
}
