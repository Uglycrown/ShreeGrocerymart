import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { serverCache, CACHE_KEYS } from '@/lib/server-cache'

// GET all banners (admin - includes inactive)
export async function GET() {
    try {
        const db = await getDb()
        const banners = await db.collection('Banner')
            .find({})
            .sort({ order: 1 })
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
            isActive: banner.isActive
        }))

        return NextResponse.json(bannersWithId)
    } catch (error) {
        console.error('Error fetching banners:', error)
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
    }
}

// POST create new banner
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

        return NextResponse.json({
            id: banner.insertedId.toString(),
            ...body
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating banner:', error)
        return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
    }
}
