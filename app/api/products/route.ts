import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

// GET all products with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const where: any = { isActive: true }

    if (categoryId) {
      const { ObjectId } = require('mongodb')
      where.categoryId = new ObjectId(categoryId)
    } else if (category) {
      where.categoryId = category
    }

    if (search) {
      where.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: search },
      ]
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const db = await getDb()
    const products = await db.collection('Product').find(where).sort({ createdAt: -1 }).toArray()

    // Populate category info
    const productsWithCategory = await Promise.all(
      products.map(async (product) => {
        const category = await db.collection('Category').findOne({ _id: product.categoryId })
        return {
          ...product,
          id: product._id.toString(),
          category: category ? {
            id: category._id.toString(),
            name: category.name,
            slug: category.slug,
          } : null,
        }
      })
    )

    return NextResponse.json(productsWithCategory)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description,
        categoryId: body.categoryId,
        images: body.images || [],
        price: body.price,
        originalPrice: body.originalPrice,
        discount: body.originalPrice
          ? Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100)
          : null,
        unit: body.unit,
        stock: body.stock,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        deliveryTime: body.deliveryTime || 24,
        tags: body.tags || [],
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
