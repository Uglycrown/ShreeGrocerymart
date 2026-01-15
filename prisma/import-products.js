/**
 * Product Import Script for Shree Grocery Mart
 * 
 * Usage: node prisma/import-products.js
 */

const { MongoClient, ObjectId } = require('mongodb')
const XLSX = require('xlsx')
const path = require('path')

const MONGODB_URI = process.env.DATABASE_URL || 'mongodb+srv://shreegrocerymart:FyuSYPAAg12MX4PC@cluster0.afbsja4.mongodb.net/blinkit?retryWrites=true&w=majority&appName=Cluster0'

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parsePrice(value) {
  if (!value && value !== 0) return null
  const cleaned = String(value).replace(/[₹$,\s]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

async function importProducts() {
  console.log('🚀 Starting product import from Excel...\n')

  // Read Excel file
  const excelPath = path.join(process.cwd(), 'Product Name.xlsx')
  console.log('📂 Reading Excel file:', excelPath)
  
  const workbook = XLSX.readFile(excelPath)
  const sheetName = workbook.SheetNames[0]
  console.log('📄 Using sheet:', sheetName)
  
  const worksheet = workbook.Sheets[sheetName]
  const products = XLSX.utils.sheet_to_json(worksheet)
  
  console.log(`📦 Found ${products.length} products to import\n`)

  if (products.length === 0) {
    console.log('No products found in Excel. Please check the file format.')
    process.exit(1)
  }

  // Show sample of first product
  console.log('Sample product data:', JSON.stringify(products[0], null, 2), '\n')

  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  console.log('✅ Connected to MongoDB\n')
  const db = client.db()

  // Get all categories
  const existingCategories = await db.collection('Category').find({}).toArray()
  const categoryMap = new Map()
  existingCategories.forEach(cat => {
    categoryMap.set(cat.name.toLowerCase().trim(), cat._id.toString())
    if (cat.slug) {
      categoryMap.set(cat.slug.toLowerCase().trim(), cat._id.toString())
    }
  })

  console.log(`📂 Found ${existingCategories.length} existing categories in database\n`)

  let imported = 0
  let skipped = 0
  let created_categories = 0
  const errors = []

  for (const product of products) {
    try {
      // Skip if no name
      if (!product.Name) {
        continue
      }

      // Get category name - handle multiple categories (take first one)
      let categoryName = product.Categories || 'Uncategorized'
      if (categoryName.includes('>')) {
        const parts = categoryName.split('>')
        categoryName = parts[parts.length - 1].trim()
      }
      if (categoryName.includes(',')) {
        categoryName = categoryName.split(',')[0].trim()
      }

      // Find or create category
      const categoryKey = categoryName.toLowerCase().trim()
      let categoryId = categoryMap.get(categoryKey)

      if (!categoryId) {
        console.log(`  📁 Creating new category: ${categoryName}`)
        const newCategory = {
          _id: new ObjectId(),
          name: categoryName,
          slug: generateSlug(categoryName),
          isActive: true,
          order: existingCategories.length + created_categories + 1,
          priority: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await db.collection('Category').insertOne(newCategory)
        categoryId = newCategory._id.toString()
        categoryMap.set(categoryKey, categoryId)
        created_categories++
      }

      // Check if product already exists
      const slug = generateSlug(product.Name)
      const existingProduct = await db.collection('Product').findOne({ slug })

      if (existingProduct) {
        console.log(`  ⏭️  Skipping (exists): ${product.Name}`)
        skipped++
        continue
      }

      // Parse prices
      const salePrice = parsePrice(product['Sale price'])
      const regularPrice = parsePrice(product['Regular price'])
      
      // Use sale price as main price, fallback to regular price
      const price = salePrice || regularPrice || 0
      const originalPrice = regularPrice && regularPrice > price ? regularPrice : null

      // Parse stock
      const stock = product.Stock ? parseInt(String(product.Stock)) : 100
      
      // Check if in stock
      const inStockValue = String(product['In stock?'] || '').toLowerCase()
      const inStock = inStockValue !== 'no' && inStockValue !== '0' && inStockValue !== 'false'
      const isActive = inStock

      // Calculate discount
      const discount = originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : null

      // Create product
      const newProduct = {
        _id: new ObjectId(),
        name: product.Name,
        slug,
        description: '',
        categoryId: new ObjectId(categoryId),
        images: [],
        price,
        originalPrice,
        discount,
        unit: '1 pc',
        stock: stock || 100,
        isActive,
        isFeatured: false,
        deliveryTime: 24,
        tags: [categoryName],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection('Product').insertOne(newProduct)
      console.log(`  ✅ Imported: ${product.Name} - ₹${price}`)
      imported++
    } catch (error) {
      console.error(`  ❌ Error importing ${product.Name}: ${error.message}`)
      errors.push(`${product.Name}: ${error.message}`)
    }
  }

  await client.close()

  console.log('\n' + '='.repeat(50))
  console.log('📊 Import Summary:')
  console.log(`  ✅ Imported: ${imported} products`)
  console.log(`  📁 Created: ${created_categories} new categories`)
  console.log(`  ⏭️  Skipped: ${skipped} (already exist)`)
  console.log(`  ❌ Errors: ${errors.length}`)
  
  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.slice(0, 10).forEach(e => console.log(`  - ${e}`))
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`)
    }
  }

  console.log('\n✨ Import complete!')
}

importProducts().catch(console.error)
