import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { serverCache, CACHE_KEYS } from '@/lib/server-cache'

// GET single banner
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const db = await getDb()
        const banner = await db.collection('Banner').findOne({
            _id: new ObjectId(id)
        })

        if (!banner) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
        }

        return NextResponse.json({
            id: banner._id.toString(),
            title: banner.title,
            subtitle: banner.subtitle,
            image: banner.image,
            link: banner.link,
            ctaText: banner.ctaText,
            type: banner.type,
            order: banner.order,
            isActive: banner.isActive
        })
    } catch (error) {
        console.error('Error fetching banner:', error)
        return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 })
    }
}

// PUT update banner
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const db = await getDb()

        const result = await db.collection('Banner').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: body.title,
                    subtitle: body.subtitle,
                    image: body.image,
                    link: body.link,
                    ctaText: body.ctaText,
                    type: body.type,
                    order: body.order,
                    isActive: body.isActive,
                    updatedAt: new Date()
                }
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
        }

        // Invalidate cache
        serverCache.invalidate(CACHE_KEYS.BANNERS)

        return NextResponse.json({ message: 'Banner updated successfully' })
    } catch (error) {
        console.error('Error updating banner:', error)
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
    }
}

// PATCH partial update (for toggling active status or updating order)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const db = await getDb()

        const updateFields: any = { updatedAt: new Date() }

        if (body.hasOwnProperty('isActive')) {
            updateFields.isActive = body.isActive
        }
        if (body.hasOwnProperty('order')) {
            updateFields.order = body.order
        }

        const result = await db.collection('Banner').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
        }

        // Invalidate cache
        serverCache.invalidate(CACHE_KEYS.BANNERS)

        return NextResponse.json({ message: 'Banner updated successfully' })
    } catch (error) {
        console.error('Error updating banner:', error)
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
    }
}

// DELETE banner
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const db = await getDb()
        const result = await db.collection('Banner').deleteOne({
            _id: new ObjectId(id)
        })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
        }

        // Invalidate cache
        serverCache.invalidate(CACHE_KEYS.BANNERS)

        return NextResponse.json({ message: 'Banner deleted successfully' })
    } catch (error) {
        console.error('Error deleting banner:', error)
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
    }
}
