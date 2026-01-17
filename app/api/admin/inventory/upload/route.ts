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
        'productname': 'name',
        'name': 'name',
        'stockquantity': 'stock',
        'stock': 'stock',
        'quantity': 'stock',
        'qty': 'stock',
        'regularprice': 'originalPrice',
        'mrp': 'originalPrice',
        'originalprice': 'originalPrice',
        'saleprice': 'price',
        'sellingprice': 'price',
        'price': 'price',
        'categories': 'category',
        'category': 'category',
        'categoryname': 'category',
        'unit': 'unit',
        'description': 'description',
    }

    return mappings[normalized] || header
}

// POST - Upload and process CSV in chunks
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const chunkData = formData.get('chunkData') as string | null
        const isChunked = formData.get('isChunked') === 'true'
        const chunkIndex = parseInt(formData.get('chunkIndex') as string) || 0
        const totalChunks = parseInt(formData.get('totalChunks') as string) || 1
        const isLastChunk = formData.get('isLastChunk') === 'true'
        const fileName = formData.get('fileName') as string || 'upload.csv'

        let headers: string[] = []
        let rows: string[][] = []

        if (isChunked && chunkData) {
            // Parse the pre-parsed chunk data from client
            const parsed = JSON.parse(chunkData)
            headers = parsed.headers
            rows = parsed.rows
        } else if (file) {
            // Traditional file upload - parse CSV
            const csvContent = await file.text()
            const parsed = parseCSV(csvContent)
            headers = parsed.headers
            rows = parsed.rows
        } else {
            return NextResponse.json({ error: 'No file or chunk data provided' }, { status: 400 })
        }

        if (headers.length === 0 || rows.length === 0) {
            return NextResponse.json({ error: 'Invalid CSV - no data found' }, { status: 400 })
        }

        // Normalize headers
        const normalizedHeaders = headers.map(normalizeHeader)
        const nameIndex = normalizedHeaders.indexOf('name')
        const stockIndex = normalizedHeaders.indexOf('stock')
        const priceIndex = normalizedHeaders.indexOf('price')
        const originalPriceIndex = normalizedHeaders.indexOf('originalPrice')
        const categoryIndex = normalizedHeaders.indexOf('category')
        const unitIndex = normalizedHeaders.indexOf('unit')

        if (nameIndex === -1) {
            return NextResponse.json({ error: 'Missing required column: Product Name' }, { status: 400 })
        }

        // Fetch products and categories (lightweight query)
        const [allProducts, categories] = await Promise.all([
            prisma.product.findMany({
                select: { id: true, name: true }
            }),
            prisma.category.findMany({
                select: { id: true, name: true, slug: true }
            })
        ])

        // Build lookup maps
        const productMap = new Map(allProducts.map(p => [p.name.toLowerCase(), p.id]))
        const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c]))

        // Process rows
        const updates: Array<{ id: string; stock?: number; price?: number; originalPrice?: number; discount?: number }> = []
        const creates: Array<any> = []
        const errors: string[] = []
        const usedSlugs = new Set<string>()

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            const rowNumber = i + 2 + (chunkIndex * 20) // Adjust for chunk offset

            try {
                const productName = row[nameIndex]?.trim()
                if (!productName) {
                    errors.push(`Row ${rowNumber}: Empty product name`)
                    continue
                }

                const stock = stockIndex !== -1 ? parseInt(row[stockIndex]) || 0 : undefined
                const originalPrice = originalPriceIndex !== -1 ? parseFloat(row[originalPriceIndex]) || undefined : undefined
                let price = priceIndex !== -1 && row[priceIndex]?.trim() ? parseFloat(row[priceIndex]) || undefined : undefined
                if (!price && originalPrice) price = originalPrice

                const categoryName = categoryIndex !== -1 ? row[categoryIndex]?.trim() : undefined
                const unit = unitIndex !== -1 ? row[unitIndex]?.trim() : undefined

                const existingProductId = productMap.get(productName.toLowerCase())

                if (existingProductId) {
                    const updateData: any = {}
                    if (stock !== undefined) updateData.stock = stock
                    if (price !== undefined) updateData.price = price
                    if (originalPrice !== undefined) updateData.originalPrice = originalPrice
                    if (price && originalPrice && originalPrice > price) {
                        updateData.discount = Math.round(((originalPrice - price) / originalPrice) * 100)
                    }
                    if (Object.keys(updateData).length > 0) {
                        updates.push({ id: existingProductId, ...updateData })
                    }
                } else {
                    if (!categoryName) {
                        errors.push(`Row ${rowNumber}: Cannot create "${productName}" without category`)
                        continue
                    }

                    let parsedCategoryName = categoryName
                    if (categoryName.includes('>')) {
                        parsedCategoryName = categoryName.split('>').pop()?.trim() || categoryName
                    }

                    const category = categoryMap.get(parsedCategoryName.toLowerCase()) || categoryMap.get(categoryName.toLowerCase())
                    if (!category) {
                        errors.push(`Row ${rowNumber}: Category "${parsedCategoryName}" not found`)
                        continue
                    }

                    const baseSlug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    let slug = baseSlug
                    let counter = 1
                    while (usedSlugs.has(slug)) {
                        slug = `${baseSlug}-${counter++}`
                    }
                    usedSlugs.add(slug)

                    creates.push({
                        name: productName,
                        slug,
                        categoryId: category.id,
                        price: price || 0,
                        originalPrice,
                        stock: stock || 0,
                        unit: unit || '1 piece',
                        discount: originalPrice && price && originalPrice > price
                            ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
                        isActive: true,
                        images: [],
                        tags: [],
                        timeSlots: ['ALL_DAY'],
                    })
                }
            } catch (err: unknown) {
                errors.push(`Row ${rowNumber}: ${err instanceof Error ? err.message : 'Error'}`)
            }
        }

        // Execute updates in small batches
        let updated = 0
        let created = 0

        if (updates.length > 0) {
            const BATCH_SIZE = 5
            for (let i = 0; i < updates.length; i += BATCH_SIZE) {
                const batch = updates.slice(i, i + BATCH_SIZE)
                await prisma.$transaction(
                    batch.map(u => prisma.product.update({
                        where: { id: u.id },
                        data: {
                            stock: u.stock,
                            price: u.price,
                            originalPrice: u.originalPrice,
                            discount: u.discount,
                            updatedAt: new Date()
                        }
                    }))
                )
            }
            updated = updates.length
        }

        // Execute creates in small batches
        if (creates.length > 0) {
            // Check for existing slugs
            const existingSlugs = await prisma.product.findMany({
                where: { slug: { in: creates.map(c => c.slug) } },
                select: { slug: true }
            })
            const existingSlugSet = new Set(existingSlugs.map(s => s.slug))

            for (const item of creates) {
                if (existingSlugSet.has(item.slug)) {
                    let counter = 1
                    while (existingSlugSet.has(`${item.slug}-${counter}`)) counter++
                    item.slug = `${item.slug}-${counter}`
                }
            }

            const BATCH_SIZE = 5
            for (let i = 0; i < creates.length; i += BATCH_SIZE) {
                const batch = creates.slice(i, i + BATCH_SIZE)
                await prisma.$transaction(
                    batch.map(c => prisma.product.create({ data: c }))
                )
            }
            created = creates.length
        }

        // Only create snapshot and log on last chunk or non-chunked upload
        if (!isChunked || isLastChunk) {
            try {
                // Lightweight snapshot - just save current product count
                const productCount = await prisma.product.count()
                const snapshot = await (prisma as any).inventorySnapshot.create({
                    data: {
                        name: `Upload: ${fileName} - ${new Date().toLocaleString('en-IN')}`,
                        products: [], // Empty to save space
                        productCount,
                    }
                })

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
                console.error('Snapshot/log error:', logError)
            }

            // Invalidate cache only on last chunk
            serverCache.invalidatePattern('products:')
        }

        return NextResponse.json({
            success: true,
            message: isChunked
                ? `Chunk ${chunkIndex + 1}/${totalChunks} processed`
                : `Processed ${rows.length} rows`,
            stats: { total: rows.length, updated, created, errors: errors.length },
            chunkIndex,
            isLastChunk,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
        })
    } catch (error) {
        console.error('Error processing CSV:', error)
        return NextResponse.json({
            error: 'Failed to process CSV',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
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
