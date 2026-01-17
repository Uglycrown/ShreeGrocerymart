'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Category } from '@prisma/client'
import { serverCache } from '@/lib/server-cache'

// Helper function to parse CSV content
function parseCSV(csvContent: string): { headers: string[], rows: string[][] } {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim())
    if (lines.length === 0) {
        return { headers: [], rows: [] }
    }

    // Parse headers (first row)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

    // Parse data rows
    const rows = lines.slice(1).map(line => {
        // Handle quoted values with commas inside
        const values: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        values.push(current.trim())

        return values
    })

    return { headers, rows }
}

// Helper to normalize column headers
function normalizeHeader(header: string): string {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '')

    const mappings: Record<string, string> = {
        // Product Name mappings
        'productname': 'name',
        'name': 'name',
        // Stock mappings
        'stockquantity': 'stock',
        'stock': 'stock',
        'quantity': 'stock',
        'qty': 'stock',
        // Regular Price (MRP) mappings
        'regularprice': 'originalPrice',
        'mrp': 'originalPrice',
        'originalprice': 'originalPrice',
        // Sale Price (Selling Price) mappings
        'saleprice': 'price',
        'sellingprice': 'price',
        'price': 'price',
        // Category mappings
        'categories': 'category',
        'category': 'category',
        'categoryname': 'category',
        // Other mappings
        'unit': 'unit',
        'description': 'description',
        'taxstatus': 'taxStatus',
        'taxclass': 'taxClass',
        'instock': 'inStock',
        'lowstockamount': 'lowStockAmount',
    }

    return mappings[normalized] || header
}

// POST - Upload and process CSV
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const fileName = file.name
        const csvContent = await file.text()
        const { headers, rows } = parseCSV(csvContent)

        if (headers.length === 0 || rows.length === 0) {
            return NextResponse.json({ error: 'Invalid CSV file - no data found' }, { status: 400 })
        }

        // Normalize headers
        const normalizedHeaders = headers.map(normalizeHeader)

        // Check required columns
        const nameIndex = normalizedHeaders.indexOf('name')
        const stockIndex = normalizedHeaders.indexOf('stock')
        const priceIndex = normalizedHeaders.indexOf('price')
        const originalPriceIndex = normalizedHeaders.indexOf('originalPrice')
        const categoryIndex = normalizedHeaders.indexOf('category')
        const unitIndex = normalizedHeaders.indexOf('unit')

        if (nameIndex === -1) {
            return NextResponse.json({
                error: 'Missing required column: Product Name'
            }, { status: 400 })
        }

        // Create snapshot of current inventory before making changes
        const currentProducts = await prisma.product.findMany({
            include: { category: { select: { name: true, slug: true } } }
        })

        const snapshot = await (prisma as any).inventorySnapshot.create({
            data: {
                name: `Before Upload: ${fileName} - ${new Date().toLocaleString('en-IN')}`,
                products: JSON.parse(JSON.stringify(currentProducts)),
                productCount: currentProducts.length,
            }
        })

        // Get all categories for lookup
        const categories = await prisma.category.findMany()
        const categoryMap = new Map<string, Category>(categories.map((c: Category) => [c.name.toLowerCase(), c]))

        // Process each row
        let updated = 0
        let created = 0
        const errors: string[] = []

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            const rowNumber = i + 2 // Account for header row and 0-indexing

            try {
                const productName = row[nameIndex]?.trim()
                if (!productName) {
                    errors.push(`Row ${rowNumber}: Empty product name`)
                    continue
                }

                const stock = stockIndex !== -1 ? parseInt(row[stockIndex]) || 0 : undefined
                const originalPrice = originalPriceIndex !== -1 ? parseFloat(row[originalPriceIndex]) || undefined : undefined

                // Sale price (selling price) - if empty, use Regular price (MRP)
                let price: number | undefined
                if (priceIndex !== -1 && row[priceIndex]?.trim()) {
                    price = parseFloat(row[priceIndex]) || undefined
                }
                // Fallback: if no sale price, use regular price as selling price
                if (!price && originalPrice) {
                    price = originalPrice
                }

                const categoryName = categoryIndex !== -1 ? row[categoryIndex]?.trim() : undefined
                const unit = unitIndex !== -1 ? row[unitIndex]?.trim() : undefined

                // Try to find existing product by name (case-insensitive)
                const existingProduct = await prisma.product.findFirst({
                    where: {
                        name: {
                            equals: productName,
                            mode: 'insensitive'
                        }
                    }
                })

                if (existingProduct) {
                    // Update existing product
                    const updateData: Record<string, number | undefined> = {}
                    if (stock !== undefined) updateData.stock = stock
                    if (price !== undefined) updateData.price = price
                    if (originalPrice !== undefined) updateData.originalPrice = originalPrice

                    // Calculate discount if both prices are available
                    if (price !== undefined && originalPrice !== undefined && originalPrice > price) {
                        updateData.discount = Math.round(((originalPrice - price) / originalPrice) * 100)
                    }

                    await prisma.product.update({
                        where: { id: existingProduct.id },
                        data: updateData
                    })
                    updated++
                } else {
                    // Create new product
                    if (!categoryName) {
                        errors.push(`Row ${rowNumber}: Cannot create new product "${productName}" without category`)
                        continue
                    }

                    const category = categoryMap.get(categoryName.toLowerCase())
                    if (!category) {
                        errors.push(`Row ${rowNumber}: Category "${categoryName}" not found`)
                        continue
                    }

                    // Generate slug
                    const baseSlug = productName.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')

                    let slug = baseSlug
                    let slugCounter = 1
                    while (await prisma.product.findUnique({ where: { slug } })) {
                        slug = `${baseSlug}-${slugCounter++}`
                    }

                    await prisma.product.create({
                        data: {
                            name: productName,
                            slug,
                            categoryId: category.id,
                            price: price || 0,
                            originalPrice: originalPrice,
                            stock: stock || 0,
                            unit: unit || '1 piece',
                            discount: originalPrice && price && originalPrice > price
                                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                                : 0,
                            isActive: true,
                            images: [],
                            tags: [],
                            timeSlots: ['ALL_DAY'],
                        }
                    })
                    created++
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                errors.push(`Row ${rowNumber}: ${errorMessage}`)
            }
        }

        // Log the upload
        await (prisma as any).inventoryUploadLog.create({
            data: {
                fileName,
                snapshotId: snapshot.id,
                productsUpdated: updated,
                productsCreated: created,
                errors: errors.length > 0 ? errors : null,
            }
        })

        // Clean up old snapshots (keep only last 15)
        const oldSnapshots = await (prisma as any).inventorySnapshot.findMany({
            orderBy: { createdAt: 'desc' },
            skip: 15,
            select: { id: true }
        })

        if (oldSnapshots.length > 0) {
            await (prisma as any).inventorySnapshot.deleteMany({
                where: { id: { in: oldSnapshots.map((s: { id: string }) => s.id) } }
            })
        }

        // Invalidate product cache so changes appear immediately
        serverCache.invalidatePattern('products:')

        return NextResponse.json({
            success: true,
            message: `Processed ${rows.length} rows`,
            stats: {
                total: rows.length,
                updated,
                created,
                errors: errors.length,
            },
            snapshotId: snapshot.id,
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        })
    } catch (error) {
        console.error('Error processing CSV:', error)
        return NextResponse.json({ error: 'Failed to process CSV' }, { status: 500 })
    }
}

// GET - Get upload history
export async function GET() {
    try {
        const logs = await (prisma as any).inventoryUploadLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
        })

        return NextResponse.json(logs)
    } catch (error) {
        console.error('Error fetching upload history:', error)
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
