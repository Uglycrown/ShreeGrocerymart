import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 1) {
      return NextResponse.json([])
    }

    const db = await getDb()
    const searchTerm = query.trim().toLowerCase()

    // Find all matching products
    const products = await db.collection('Product')
      .find({
        isActive: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } },
        ]
      })
      .limit(50)
      .toArray()

    // Sort products: prioritize those starting with search term
    const sortedProducts = products.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      
      const aStarts = aName.startsWith(searchTerm)
      const bStarts = bName.startsWith(searchTerm)
      
      // Priority 1: Products starting with search term come first
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      
      // Priority 2: If both start or both don't start, sort alphabetically
      return aName.localeCompare(bName)
    })

    // Limit to top 10 suggestions
    const suggestions = sortedProducts.slice(0, 10).map(product => ({
      id: product._id.toString(),
      name: product.name,
      images: product.images,
      price: product.price,
      unit: product.unit,
    }))

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}
