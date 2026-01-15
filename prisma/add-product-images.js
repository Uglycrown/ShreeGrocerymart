/**
 * Product Image Fetcher Script
 * 
 * Searches Google Images for each product, downloads the image,
 * uploads to Cloudinary, and updates the database.
 * 
 * Usage: node prisma/add-product-images.js
 */

const { MongoClient, ObjectId } = require('mongodb')
const cloudinary = require('cloudinary').v2
const axios = require('axios')
const cheerio = require('cheerio')

// MongoDB connection
const MONGODB_URI = process.env.DATABASE_URL || 'mongodb+srv://shreegrocerymart:FyuSYPAAg12MX4PC@cluster0.afbsja4.mongodb.net/blinkit?retryWrites=true&w=majority&appName=Cluster0'

// Cloudinary config - from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfz2l4lbf',
  api_key: process.env.CLOUDINARY_API_KEY || '735193677695587',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'hLNI9zS72Ow0hMa5NpQjxVhwQE0'
})

// User agent for requests
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Search Google Images and get first image URL
async function searchGoogleImage(query) {
  try {
    const searchQuery = encodeURIComponent(query + ' product')
    const url = `https://www.google.com/search?q=${searchQuery}&tbm=isch&safe=active`
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000,
    })

    const $ = cheerio.load(response.data)
    
    // Find image URLs in the page - Google embeds them as base64 or URLs
    const scripts = $('script').text()
    
    // Extract image URLs from the HTML/JS
    const imgRegex = /\["(https:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)",\d+,\d+\]/gi
    const matches = [...scripts.matchAll(imgRegex)]
    
    if (matches.length > 0) {
      // Get a random image from top 5 to avoid always getting the same one
      const index = Math.min(Math.floor(Math.random() * 3), matches.length - 1)
      return matches[index][1]
    }

    // Try alternative regex patterns
    const altRegex = /https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi
    const altMatches = scripts.match(altRegex)
    
    if (altMatches && altMatches.length > 0) {
      // Filter out Google's own images
      const filtered = altMatches.filter(url => 
        !url.includes('google.com') && 
        !url.includes('gstatic.com') &&
        url.length < 500
      )
      if (filtered.length > 0) {
        return filtered[0]
      }
    }

    return null
  } catch (error) {
    console.log(`    Search failed: ${error.message}`)
    return null
  }
}

// Alternative: Search using DuckDuckGo (more reliable)
async function searchDuckDuckGoImage(query) {
  try {
    const searchQuery = encodeURIComponent(query)
    const url = `https://duckduckgo.com/?q=${searchQuery}&iax=images&ia=images`
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 10000,
    })

    // DuckDuckGo uses vqd token for image search
    const vqdMatch = response.data.match(/vqd=['"]([^'"]+)['"]/)
    if (!vqdMatch) return null

    const vqd = vqdMatch[1]
    
    const imgResponse = await axios.get(
      `https://duckduckgo.com/i.js?q=${searchQuery}&o=json&vqd=${vqd}&p=1`,
      {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 10000,
      }
    )

    if (imgResponse.data.results && imgResponse.data.results.length > 0) {
      return imgResponse.data.results[0].image
    }

    return null
  } catch (error) {
    return null
  }
}

// Upload image to Cloudinary from URL
async function uploadToCloudinary(imageUrl, productName) {
  try {
    const publicId = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50)

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'products',
      public_id: publicId,
      overwrite: true,
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'center' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    })

    return result.secure_url
  } catch (error) {
    console.log(`    Upload failed: ${error.message}`)
    return null
  }
}

// Main function
async function addProductImages() {
  console.log('🖼️  Starting product image fetcher...\n')

  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  console.log('✅ Connected to MongoDB\n')
  const db = client.db()

  // Get products without images
  const products = await db.collection('Product').find({
    $or: [
      { images: { $exists: false } },
      { images: { $size: 0 } },
      { images: null }
    ]
  }).toArray()

  console.log(`📦 Found ${products.length} products without images\n`)

  let processed = 0
  let success = 0
  let failed = 0
  const batchSize = 10 // Process in batches to track progress

  for (const product of products) {
    processed++
    console.log(`[${processed}/${products.length}] ${product.name}`)

    try {
      // Try Google first, then DuckDuckGo
      let imageUrl = await searchGoogleImage(product.name)
      
      if (!imageUrl) {
        console.log('    Trying DuckDuckGo...')
        imageUrl = await searchDuckDuckGoImage(product.name)
      }

      if (!imageUrl) {
        console.log('    ❌ No image found')
        failed++
        continue
      }

      console.log('    Found image, uploading to Cloudinary...')
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(imageUrl, product.name)
      
      if (!cloudinaryUrl) {
        console.log('    ❌ Upload failed')
        failed++
        continue
      }

      // Update database
      await db.collection('Product').updateOne(
        { _id: product._id },
        { 
          $set: { 
            images: [cloudinaryUrl],
            updatedAt: new Date()
          } 
        }
      )

      console.log('    ✅ Image added!')
      success++

    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`)
      failed++
    }

    // Add delay to avoid rate limiting (2-4 seconds random)
    const delayMs = 2000 + Math.random() * 2000
    await delay(delayMs)

    // Progress update every batch
    if (processed % batchSize === 0) {
      console.log(`\n--- Progress: ${processed}/${products.length} | Success: ${success} | Failed: ${failed} ---\n`)
    }
  }

  await client.close()

  console.log('\n' + '='.repeat(50))
  console.log('📊 Final Summary:')
  console.log(`  📦 Total Products: ${products.length}`)
  console.log(`  ✅ Images Added: ${success}`)
  console.log(`  ❌ Failed: ${failed}`)
  console.log('\n✨ Image fetching complete!')
}

addProductImages().catch(console.error)
