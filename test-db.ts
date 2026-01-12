import { prisma } from './lib/prisma'

async function main() {
  try {
    console.log('Connecting to database...')
    await prisma.$connect()
    console.log('Connected successfully.')

    const userCount = await prisma.user.count()
    console.log(`Current user count: ${userCount}`)

    console.log('Database connection verification complete.')
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
