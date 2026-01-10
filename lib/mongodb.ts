import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/blinkit'
let cachedClient: MongoClient | null = null

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
  return client.db()
}
