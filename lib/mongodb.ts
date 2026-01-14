import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/blinkit'

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
let indexesCreated = false

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 60000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  
  await client.connect()
  cachedClient = client
  return client
}

export async function getDb() {
  if (cachedDb && cachedClient) {
    return cachedDb
  }

  const client = await getMongoClient()
  const db = client.db()
  cachedDb = db
  
  // Create indexes on first connection (non-blocking)
  if (!indexesCreated) {
    indexesCreated = true
    // Run index creation in background to not slow down first request
    setImmediate(async () => {
      try {
        // Create indexes for Category collection
        await db.collection('Category').createIndex({ isActive: 1, order: 1, priority: 1 })
        await db.collection('Category').createIndex({ slug: 1 })
        
        // Create indexes for Product collection
        await db.collection('Product').createIndex({ categoryId: 1, isActive: 1 })
        await db.collection('Product').createIndex({ isFeatured: 1, isActive: 1 })
        
        console.log('Database indexes created successfully')
      } catch (error) {
        console.error('Error creating indexes:', error)
        indexesCreated = false // Retry next time
      }
    })
  }
  
  return db
}
