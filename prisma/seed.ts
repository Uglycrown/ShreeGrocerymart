// Seed script to populate database with sample data
// Run with: npx tsx prisma/seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...\n')

  // Create Categories
  console.log('📁 Creating categories...')
  
  const dairyCategory = await prisma.category.create({
    data: {
      name: 'Dairy & Eggs',
      slug: 'dairy-eggs',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
      description: 'Fresh milk, eggs, butter, and dairy products',
      order: 1,
    },
  })

  const fruitsCategory = await prisma.category.create({
    data: {
      name: 'Fruits & Vegetables',
      slug: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400',
      description: 'Farm-fresh fruits and vegetables',
      order: 2,
    },
  })

  const snacksCategory = await prisma.category.create({
    data: {
      name: 'Snacks & Munchies',
      slug: 'snacks-munchies',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
      description: 'Chips, namkeen, and more',
      order: 3,
    },
  })

  const beveragesCategory = await prisma.category.create({
    data: {
      name: 'Cold Drinks & Juices',
      slug: 'cold-drinks-juices',
      image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe3ea1?w=400',
      description: 'Refreshing beverages',
      order: 4,
    },
  })

  console.log('✅ Categories created\n')

  // Create Products
  console.log('📦 Creating products...')

  await prisma.product.createMany({
    data: [
      // Dairy Products
      {
        name: 'Amul Gold Full Cream Milk',
        slug: 'amul-gold-milk',
        description: 'Fresh and pure full cream milk',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'],
        price: 35,
        originalPrice: 40,
        discount: 12,
        unit: '500 ml',
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ['milk', 'dairy', 'amul'],
      },
      {
        name: 'Amul Salted Butter',
        slug: 'amul-butter',
        description: 'Premium quality salted butter',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'],
        price: 58,
        unit: '100 g',
        stock: 75,
        isActive: true,
        tags: ['butter', 'dairy', 'amul'],
      },
      {
        name: 'Farm Fresh Brown Eggs',
        slug: 'brown-eggs',
        description: 'Protein-rich brown eggs',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'],
        price: 90,
        originalPrice: 100,
        discount: 10,
        unit: '6 pieces',
        stock: 50,
        isActive: true,
        isFeatured: true,
        tags: ['eggs', 'protein'],
      },

      // Fruits & Vegetables
      {
        name: 'Fresh Red Apples',
        slug: 'red-apples',
        description: 'Crispy and sweet red apples',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400'],
        price: 120,
        originalPrice: 150,
        discount: 20,
        unit: '1 kg',
        stock: 60,
        isActive: true,
        isFeatured: true,
        tags: ['fruits', 'apples', 'fresh'],
      },
      {
        name: 'Fresh Tomatoes',
        slug: 'tomatoes',
        description: 'Locally sourced ripe tomatoes',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'],
        price: 40,
        unit: '1 kg',
        stock: 80,
        isActive: true,
        tags: ['vegetables', 'tomatoes'],
      },
      {
        name: 'Fresh Bananas',
        slug: 'bananas',
        description: 'Naturally ripened yellow bananas',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400'],
        price: 50,
        unit: '1 dozen',
        stock: 100,
        isActive: true,
        tags: ['fruits', 'bananas'],
      },

      // Snacks
      {
        name: 'Lay\'s Classic Salted Chips',
        slug: 'lays-chips',
        description: 'Crispy potato chips',
        categoryId: snacksCategory.id,
        images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'],
        price: 20,
        unit: '52 g',
        stock: 120,
        isActive: true,
        isFeatured: true,
        tags: ['snacks', 'chips', 'lays'],
      },
      {
        name: 'Haldiram\'s Aloo Bhujia',
        slug: 'aloo-bhujia',
        description: 'Spicy and crunchy namkeen',
        categoryId: snacksCategory.id,
        images: ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'],
        price: 65,
        originalPrice: 75,
        discount: 13,
        unit: '200 g',
        stock: 80,
        isActive: true,
        tags: ['snacks', 'namkeen', 'haldirams'],
      },

      // Beverages
      {
        name: 'Coca-Cola Soft Drink',
        slug: 'coca-cola',
        description: 'Classic cola beverage',
        categoryId: beveragesCategory.id,
        images: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'],
        price: 40,
        unit: '750 ml',
        stock: 90,
        isActive: true,
        tags: ['beverages', 'cola', 'soft-drink'],
      },
      {
        name: 'Tropicana Orange Juice',
        slug: 'tropicana-orange',
        description: '100% fruit juice',
        categoryId: beveragesCategory.id,
        images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'],
        price: 120,
        originalPrice: 140,
        discount: 14,
        unit: '1 L',
        stock: 60,
        isActive: true,
        isFeatured: true,
        tags: ['juice', 'orange', 'tropicana'],
      },
    ],
  })

  console.log('✅ Products created\n')

  // Create Banners
  console.log('🎨 Creating banners...')

  await prisma.banner.createMany({
    data: [
      {
        title: 'Stock up on daily essentials',
        subtitle: 'Get farm-fresh goodness delivered in 24 minutes',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
        link: '/',
        ctaText: 'Shop Now',
        type: 'HERO',
        order: 1,
      },
      {
        title: 'Fresh Fruits & Vegetables',
        subtitle: 'Farm-fresh produce at your doorstep',
        image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600',
        link: '/category/fruits-vegetables',
        ctaText: 'Order Now',
        type: 'CATEGORY',
        order: 1,
      },
      {
        title: 'Dairy Delivered Daily',
        subtitle: 'Fresh milk, butter, and more',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600',
        link: '/category/dairy-eggs',
        ctaText: 'Browse',
        type: 'CATEGORY',
        order: 2,
      },
    ],
  })

  console.log('✅ Banners created\n')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log('  - 4 Categories')
  console.log('  - 10 Products')
  console.log('  - 3 Banners')
  console.log('\n✅ Your store is ready!')
  console.log('Visit http://localhost:3000 to see your products\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
