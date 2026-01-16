import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { serverCache } from '@/lib/server-cache'

// Bulk update products (for time slots, featured status, etc.)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { productIds, updates } = body

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 })
        }

        if (!updates || Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
        }

        const db = await getDb()

        // Build the update object
        const updateData: any = { updatedAt: new Date() }

        // Only allow certain fields to be bulk updated
        if (updates.timeSlots && Array.isArray(updates.timeSlots)) {
            updateData.timeSlots = updates.timeSlots
        }
        if (typeof updates.isFeatured === 'boolean') {
            updateData.isFeatured = updates.isFeatured
        }
        if (typeof updates.isActive === 'boolean') {
            updateData.isActive = updates.isActive
        }

        // Convert string IDs to ObjectIds
        const objectIds = productIds.map(id => new ObjectId(id))

        // Perform bulk update
        const result = await db.collection('Product').updateMany(
            { _id: { $in: objectIds } },
            { $set: updateData }
        )

        // Invalidate all product caches
        serverCache.invalidatePattern('products:')

        return NextResponse.json({
            message: `Updated ${result.modifiedCount} products`,
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        })
    } catch (error: any) {
        console.error('Error in bulk update:', error)
        return NextResponse.json({ error: 'Failed to bulk update', message: error.message }, { status: 500 })
    }
}
