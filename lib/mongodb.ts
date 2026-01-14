import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/blinkit'
let cachedClient: MongoClient | null = null
let indexesCreated = false

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient
  }

  const client = new MongoClient(uri)
  await client.connect()
  cachedClient = client
  return client
}

export async function getDb() {
  const client = await getMongoClient()
  const db = client.db()
  
  // Create indexes on first connection
  if (!indexesCreated) {
    try {
      // Create indexes for Category collection
      await db.collection('Category').createIndex({ isActive: 1, order: 1, priority: 1 })
      await db.collection('Category').createIndex({ slug: 1 })
      
      // Create indexes for Product collection
      await db.collection('Product').createIndex({ categoryId: 1, isActive: 1 })
      await db.collection('Product').createIndex({ isFeatured: 1, isActive: 1 })
      
      indexesCreated = true
      console.log('Database indexes created successfully')
    } catch (error) {
      console.error('Error creating indexes:', error)
    }
  }
  
  return db
}
