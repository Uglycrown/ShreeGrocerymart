import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...\n')

  // Delete all existing data
  console.log('🗑️ Deleting existing data...');
  await prisma.category.deleteMany({});
  console.log('✅ Existing data deleted\n');

  // Create Categories
  console.log('📁 Creating categories...')
  
  const categories = [
    { name: 'Dairy Products', order: 1, image: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400' },
    { name: 'Cold Drink', order: 2, image: 'https://images.unsplash.com/photo-1551024709-8f2331b88e6e?w=400' },
    { name: 'Confectionary', order: 3, image: 'https://images.unsplash.com/photo-1582287232353-0b5a61b873d0?w=400' },
    { name: 'Snacks', order: 4, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400' },
    { name: 'Dry Fruits', order: 5, image: 'https://images.unsplash.com/photo-1594736937994-b35345714352?w=400' },
    { name: 'Grocery', order: 6, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
    { name: 'Home Care', order: 7, image: 'https://images.unsplash.com/photo-1585435465943-b9b0b343356i?w=400' },
    { name: 'Personal Care', order: 8, image: 'https://images.unsplash.com/photo-1556760544-442de1e241b3?w=400' },
    { name: 'Kids', order: 9, image: 'https://images.unsplash.com/photo-1519680384239-165f1359a351?w=400' },
    { name: 'Beauty Care', order: 10, image: 'https://images.unsplash.com/photo-1590439471364-192aa70c2b53?w=400' },
    { name: 'Pooja Needs', order: 11, image: 'https://images.unsplash.com/photo-1604537529428-b5b6a7a58d69?w=400' },
    { name: 'Stationary', order: 12, image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400' },
    { name: 'Bakery', order: 13, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400' },
    { name: 'Ice Cream', order: 14, image: 'https://images.unsplash.com/photo-1570197788417-0e82375b9a41?w=400' },
    { name: 'Gift', order: 15, image: 'https://images.unsplash.com/photo-1513201099705-4f715888a9a6?w=400' }
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: {
        name: category.name,
        slug: category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        order: category.order,
        image: category.image
      },
    });
  }

  console.log('✅ Categories created\n')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
