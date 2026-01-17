'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all inventory snapshots
export async function GET() {
    try {
        const snapshots = await (prisma as any).inventorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                name: true,
                productCount: true,
                createdAt: true,
            }
        })

        return NextResponse.json(snapshots)
    } catch (error) {
        console.error('Error fetching snapshots:', error)
        return NextResponse.json({ error: 'Failed to fetch snapshots' }, { status: 500 })
    }
}

// POST - Create a manual snapshot (backup current inventory)
export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json()

        // Get all current products
        const products = await prisma.product.findMany({
            include: { category: { select: { name: true, slug: true } } }
        })

        // Create snapshot
        const snapshot = await (prisma as any).inventorySnapshot.create({
            data: {
                name: name || `Manual Backup - ${new Date().toLocaleString('en-IN')}`,
                products: JSON.parse(JSON.stringify(products)),
                productCount: products.length,
            }
        })

        return NextResponse.json({
            success: true,
            snapshot: {
                id: snapshot.id,
                name: snapshot.name,
                productCount: snapshot.productCount,
                createdAt: snapshot.createdAt,
            }
        })
    } catch (error) {
        console.error('Error creating snapshot:', error)
        return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 })
    }
}
