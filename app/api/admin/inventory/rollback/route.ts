'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Rollback to a specific snapshot
export async function POST(request: NextRequest) {
    try {
        const { snapshotId } = await request.json()

        if (!snapshotId) {
            return NextResponse.json({ error: 'Snapshot ID is required' }, { status: 400 })
        }

        // Get the target snapshot
        const snapshot = await (prisma as any).inventorySnapshot.findUnique({
            where: { id: snapshotId }
        })

        if (!snapshot) {
            return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 })
        }

        // Create a backup of current state before rollback
        const currentProducts = await prisma.product.findMany({
            include: { category: { select: { name: true, slug: true } } }
        })

        await (prisma as any).inventorySnapshot.create({
            data: {
                name: `Pre-Rollback Backup - ${new Date().toLocaleString('en-IN')}`,
                products: JSON.parse(JSON.stringify(currentProducts)),
                productCount: currentProducts.length,
            }
        })

        // Get products from snapshot
        const snapshotProducts = snapshot.products as any[]

        // Track stats
        let restored = 0
        let created = 0
        const errors: string[] = []

        // Process each product from snapshot
        for (const product of snapshotProducts) {
            try {
                const existingProduct = await prisma.product.findUnique({
                    where: { id: product.id }
                })

                if (existingProduct) {
                    // Update existing product
                    await prisma.product.update({
                        where: { id: product.id },
                        data: {
                            name: product.name,
                            slug: product.slug,
                            description: product.description,
                            price: product.price,
                            originalPrice: product.originalPrice,
                            discount: product.discount,
                            unit: product.unit,
                            stock: product.stock,
                            isActive: product.isActive,
                            isFeatured: product.isFeatured,
                            images: product.images,
                            tags: product.tags,
                            timeSlots: product.timeSlots,
                            deliveryTime: product.deliveryTime,
                        }
                    })
                    restored++
                } else {
                    // Re-create deleted product
                    let categoryId = product.categoryId
                    const categoryExists = await prisma.category.findUnique({
                        where: { id: categoryId }
                    })

                    if (!categoryExists) {
                        if (product.category?.name) {
                            const category = await prisma.category.findFirst({
                                where: { name: product.category.name }
                            })
                            if (category) {
                                categoryId = category.id
                            } else {
                                errors.push(`Category not found for product: ${product.name}`)
                                continue
                            }
                        } else {
                            errors.push(`Cannot restore product without category: ${product.name}`)
                            continue
                        }
                    }

                    // Check if slug already exists
                    let slug = product.slug
                    const slugExists = await prisma.product.findUnique({
                        where: { slug }
                    })
                    if (slugExists) {
                        slug = `${slug}-restored-${Date.now()}`
                    }

                    await prisma.product.create({
                        data: {
                            name: product.name,
                            slug: slug,
                            description: product.description,
                            categoryId: categoryId,
                            price: product.price,
                            originalPrice: product.originalPrice,
                            discount: product.discount,
                            unit: product.unit,
                            stock: product.stock,
                            isActive: product.isActive,
                            isFeatured: product.isFeatured,
                            images: product.images,
                            tags: product.tags || [],
                            timeSlots: product.timeSlots || ['ALL_DAY'],
                            deliveryTime: product.deliveryTime || 24,
                        }
                    })
                    created++
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                errors.push(`Error restoring ${product.name}: ${errorMessage}`)
            }
        }

        // Log the rollback
        await (prisma as any).inventoryUploadLog.create({
            data: {
                fileName: `Rollback to: ${snapshot.name}`,
                snapshotId: snapshotId,
                productsUpdated: restored,
                productsCreated: created,
                productsDeleted: 0,
                errors: errors.length > 0 ? errors : null,
            }
        })

        return NextResponse.json({
            success: true,
            message: `Rollback completed successfully`,
            stats: {
                restored,
                created,
                errors: errors.length,
            },
            errors: errors.length > 0 ? errors : undefined,
        })
    } catch (error) {
        console.error('Error during rollback:', error)
        return NextResponse.json({ error: 'Failed to rollback' }, { status: 500 })
    }
}
