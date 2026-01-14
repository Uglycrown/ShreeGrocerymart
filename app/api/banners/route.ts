import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

// GET all banners
export async function GET() {
  try {
    const db = await getDb()
    const banners = await db.collection('Banner')
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray()

    const bannersWithId = banners.map(banner => ({
      ...banner,
      id: banner._id.toString(),
    }))

    return NextResponse.json(bannersWithId)
  } catch (error) {
    console.error('Error fetching banners:', error)
    // Return an empty array on error to prevent client-side crashes
    return NextResponse.json([], {
      status: 200, // OK status, but empty data
      headers: {
        'Cache-Control': 'public, max-age=10', // Short cache on error
      },
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
