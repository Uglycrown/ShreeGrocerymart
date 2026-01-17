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

// POST - Upload and process CSV (OPTIMIZED for Vercel timeout)
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

        // OPTIMIZATION 1: Fetch all products and categories in parallel, upfront
        const [allProducts, categories] = await Promise.all([
            prisma.product.findMany({
                select: { id: true, name: true, price: true, originalPrice: true, stock: true }
            }),
            prisma.category.findMany()
        ])

        // Build lookup maps for O(1) access
        const productMap = new Map<string, { id: string; price: number; originalPrice: number | null; stock: number }>(
            allProducts.map(p => [p.name.toLowerCase(), { id: p.id, price: p.price, originalPrice: p.originalPrice, stock: p.stock }])
        )
        const categoryMap = new Map<string, Category>(
            categories.map((c: Category) => [c.name.toLowerCase(), c])
        )

        // OPTIMIZATION 2: Process all rows in memory first
        const updates: Array<{ id: string; data: Record<string, number> }> = []
        const creates: Array<{
            name: string
            slug: string
            categoryId: string
            price: number
            originalPrice?: number
            stock: number
            unit: string
            discount: number
        }> = []
        const errors: string[] = []
        const usedSlugs = new Set<string>()

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            const rowNumber = i + 2

            try {
                const productName = row[nameIndex]?.trim()
                if (!productName) {
                    errors.push(`Row ${rowNumber}: Empty product name`)
                    continue
                }

                const stock = stockIndex !== -1 ? parseInt(row[stockIndex]) || 0 : undefined
                const originalPrice = originalPriceIndex !== -1 ? parseFloat(row[originalPriceIndex]) || undefined : undefined

                let price: number | undefined
                if (priceIndex !== -1 && row[priceIndex]?.trim()) {
                    price = parseFloat(row[priceIndex]) || undefined
                }
                if (!price && originalPrice) {
                    price = originalPrice
                }

                const categoryName = categoryIndex !== -1 ? row[categoryIndex]?.trim() : undefined
                const unit = unitIndex !== -1 ? row[unitIndex]?.trim() : undefined

                // Check if product exists (O(1) lookup)
                const existingProduct = productMap.get(productName.toLowerCase())

                if (existingProduct) {
                    // Prepare update
                    const updateData: Record<string, number> = {}
                    if (stock !== undefined) updateData.stock = stock
                    if (price !== undefined) updateData.price = price
                    if (originalPrice !== undefined) updateData.originalPrice = originalPrice

                    if (price !== undefined && originalPrice !== undefined && originalPrice > price) {
                        updateData.discount = Math.round(((originalPrice - price) / originalPrice) * 100)
                    }

                    if (Object.keys(updateData).length > 0) {
                        updates.push({ id: existingProduct.id, data: updateData })
                    }
                } else {
                    // Prepare create
                    if (!categoryName) {
                        errors.push(`Row ${rowNumber}: Cannot create new product "${productName}" without category`)
                        continue
                    }

                    let parsedCategoryName = categoryName
                    if (categoryName.includes('>')) {
                        const parts = categoryName.split('>')
                        parsedCategoryName = parts[parts.length - 1].trim()
                    }

                    let category = categoryMap.get(parsedCategoryName.toLowerCase())
                    if (!category && parsedCategoryName !== categoryName) {
                        category = categoryMap.get(categoryName.toLowerCase())
                    }

                    if (!category) {
                        errors.push(`Row ${rowNumber}: Category "${parsedCategoryName}" not found`)
                        continue
                    }

                    // Generate unique slug
                    const baseSlug = productName.toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')

                    let slug = baseSlug
                    let slugCounter = 1
                    while (usedSlugs.has(slug)) {
                        slug = `${baseSlug}-${slugCounter++}`
                    }
                    usedSlugs.add(slug)

                    creates.push({
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
                    })
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                errors.push(`Row ${rowNumber}: ${errorMessage}`)
            }
        }

        // OPTIMIZATION 3: Execute bulk operations using transactions
        let updated = 0
        let created = 0

        // Batch updates in chunks of 50 to avoid overwhelming the database
        const BATCH_SIZE = 50

        if (updates.length > 0) {
            for (let i = 0; i < updates.length; i += BATCH_SIZE) {
                const batch = updates.slice(i, i + BATCH_SIZE)
                await prisma.$transaction(
                    batch.map(u => prisma.product.update({
                        where: { id: u.id },
                        data: { ...u.data, updatedAt: new Date() }
                    }))
                )
            }
            updated = updates.length
        }

        // Check for existing slugs before creating
        if (creates.length > 0) {
            const existingSlugs = await prisma.product.findMany({
                where: { slug: { in: creates.map(c => c.slug) } },
                select: { slug: true }
            })
            const existingSlugSet = new Set(existingSlugs.map(s => s.slug))

            // Fix any conflicting slugs
            for (const createItem of creates) {
                if (existingSlugSet.has(createItem.slug)) {
                    let counter = 1
                    let newSlug = `${createItem.slug}-${counter}`
                    while (existingSlugSet.has(newSlug) || usedSlugs.has(newSlug)) {
                        counter++
                        newSlug = `${createItem.slug}-${counter}`
                    }
                    createItem.slug = newSlug
                    usedSlugs.add(newSlug)
                }
            }

            // Batch creates
            for (let i = 0; i < creates.length; i += BATCH_SIZE) {
                const batch = creates.slice(i, i + BATCH_SIZE)
                await prisma.$transaction(
                    batch.map(c => prisma.product.create({
                        data: {
                            ...c,
                            isActive: true,
                            images: [],
                            tags: [],
                            timeSlots: ['ALL_DAY'],
                        }
                    }))
                )
            }
            created = creates.length
        }

        // OPTIMIZATION 4: Create lightweight snapshot (only store IDs and key fields)
        // This runs quickly since we don't fetch full product data again
        try {
            const snapshot = await (prisma as any).inventorySnapshot.create({
                data: {
                    name: `Before Upload: ${fileName} - ${new Date().toLocaleString('en-IN')}`,
                    products: allProducts, // Use the already-fetched data
                    productCount: allProducts.length,
                }
            })

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
        } catch (logError) {
            // Don't fail the whole operation if logging fails
            console.error('Error creating snapshot/log:', logError)
        }

        // Invalidate product cache
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
