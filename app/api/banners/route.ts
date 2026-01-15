import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/server-cache'

// GET all banners - Optimized with caching
export async function GET() {
  try {
    // Check cache first
    const cached = serverCache.get<any[]>(CACHE_KEYS.BANNERS)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          'X-Cache': 'HIT',
        },
      })
    }

    const db = await getDb()
    const banners = await db.collection('Banner')
      .find(
        { isActive: true },
        {
          projection: {
            _id: 1,
            title: 1,
            subtitle: 1,
            image: 1,
            link: 1,
            ctaText: 1,
            type: 1,
            order: 1,
          },
          maxTimeMS: 3000,
        }
      )
      .sort({ order: 1 })
      .limit(20)
      .toArray()

    const bannersWithId = banners.map(banner => ({
      id: banner._id.toString(),
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      link: banner.link,
      ctaText: banner.ctaText,
      type: banner.type,
      order: banner.order,
    }))

    // Cache banners
    serverCache.set(CACHE_KEYS.BANNERS, bannersWithId, CACHE_TTL.BANNERS)

    return NextResponse.json(bannersWithId, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'CDN-Cache-Control': 'public, s-maxage=600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json([], {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=30' },
    })
  }
}

// POST create new banner (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const db = await getDb()

    const banner = await db.collection('Banner').insertOne({
      title: body.title,
      subtitle: body.subtitle,
      image: body.image,
      link: body.link,
      ctaText: body.ctaText,
      type: body.type || 'PROMOTIONAL',
      order: body.order || 0,
      isActive: body.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Invalidate cache
    serverCache.invalidate(CACHE_KEYS.BANNERS)

    const newBanner = await db.collection('Banner').findOne({ _id: banner.insertedId })

    if (!newBanner) {
      return NextResponse.json({ error: 'Failed to retrieve created banner' }, { status: 500 })
    }

    return NextResponse.json({
      ...newBanner,
      id: newBanner._id.toString(),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}
