// Simple seed script without transactions
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

  console.log('✅ Created 4 categories\n')

  // Create Products
  console.log('📦 Creating products...')

  // Dairy Products
  await prisma.product.create({
    data: {
      name: 'Amul Taaza Milk',
      slug: 'amul-taaza-milk',
      description: 'Fresh toned milk',
      categoryId: dairyCategory.id,
      images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'],
      price: 28,
      originalPrice: 30,
      discount: 7,
      unit: '500 ml',
      stock: 50,
      isActive: true,
      isFeatured: true,
      deliveryTime: 10,
      tags: ['milk', 'dairy', 'fresh'],
    },
  })

  await prisma.product.create({
    data: {
      name: 'Brown Eggs',
      slug: 'brown-eggs',
      description: 'Farm fresh brown eggs',
      categoryId: dairyCategory.id,
      images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'],
      price: 80,
      originalPrice: 90,
      discount: 11,
      unit: '6 pieces',
      stock: 30,
      isActive: true,
      isFeatured: true,
      deliveryTime: 10,
      tags: ['eggs', 'protein', 'fresh'],
    },
  })

  await prisma.product.create({
    data: {
      name: 'Amul Butter',
      slug: 'amul-butter',
      description: 'Rich and creamy butter',
      categoryId: dairyCategory.id,
      images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'],
      price: 54,
      originalPrice: 60,
      discount: 10,
      unit: '100 g',
      stock: 40,
      isActive: true,
      isFeatured: false,
      deliveryTime: 10,
      tags: ['butter', 'dairy'],
    },
  })

  // Fruits & Vegetables
  await prisma.product.create({
    data: {
      name: 'Fresh Bananas',
      slug: 'fresh-bananas',
      description: 'Ripe yellow bananas',
      categoryId: fruitsCategory.id,
      images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400'],
      price: 40,
      originalPrice: 50,
      discount: 20,
      unit: '6 pieces',
      stock: 100,
      isActive: true,
      isFeatured: true,
      deliveryTime: 10,
      tags: ['fruits', 'fresh', 'healthy'],
    },
  })

  await prisma.product.create({
    data: {
      name: 'Red Apples',
      slug: 'red-apples',
      description: 'Crispy red apples',
      categoryId: fruitsCategory.id,
      images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'],
      price: 120,
      originalPrice: 150,
      discount: 20,
      unit: '1 kg',
      stock: 80,
      isActive: true,
      isFeatured: true,
      deliveryTime: 10,
      tags: ['fruits', 'fresh', 'healthy'],
    },
  })

  await prisma.product.create({
    data: {
      name: 'Fresh Tomatoes',
      slug: 'fresh-tomatoes',
      description: 'Farm fresh tomatoes',
      categoryId: fruitsCategory.id,
      images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'],
      price: 30,
      originalPrice: 40,
      discount: 25,
      unit: '500 g',
      stock: 60,
      isActive: true,
      isFeatured: false,
      deliveryTime: 10,
      tags: ['vegetables', 'fresh'],
    },
  })

  await prisma.product.create({
    data: {
      name: 'Green Capsicum',
      slug: 'green-capsicum',
      description: 'Fresh bell peppers',
      categoryId: fruitsCategory.id,
      images: ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400'],
      price: 35,
      originalPrice: 45,
      discount: 22,
      unit: '250 g',
      stock: 50,
      isActive: true,
      isFeatured: false,
      deliveryTime: 10,
      tags: ['vegetables', 'fresh'],
    },
  })

  // Snacks
  await prisma.product.create({
    data: {
      name: 'Lays Classic Chips',
      slug: 'lays-classic-chips',
      description: 'Crispy potato chips',
      categoryId: snacksCategory.id,
      images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'],
      price: 20,
      originalPrice: 25,
      discount: 20,
      unit: '50 g',
      stock: 200,
      isActive: true,
      isFeatured: true,
      deliveryTime: 10,
      tags: ['snacks', 'chips'],
    },
  })

  await prisma.product.create({
    data: {
      name: 'Kurkure Masala Munch',
      slug: 'kurkure-masala-munch',
      description: 'Spicy crunchy snack',
      categoryId: snacksCategory.id,
      images: ['https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400'],
      price: 10,
      originalPrice: 15,
      discount: 33,
      unit: '30 g',
      stock: 150,
      isActive: true,
      isFeatured: false,
      deliveryTime: 10,
      tags: ['snacks', 'spicy'],
    },
  })

  await prisma.product.create({
    data: {
      name: 'Haldirams Bhujia',
      slug: 'haldirams-bhujia',
      description: 'Traditional namkeen',
      categoryId: snacksCategory.id,
      images: ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'],
      price: 45,
      originalPrice: 50,
      discount: 10,
      unit: '200 g',
      stock: 100,
      isActive: true,
      isFeatured: false,
      deliveryTime: 10,
      tags: ['snacks', 'namkeen'],
    },
  })

  // Beverages
  await prisma.product.create({
    data: {
      name: 'Coca Cola',
      slug: 'coca-cola',
      description: 'Refreshing cold drink',
      categoryId: beveragesCategory.id,
      images: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'],
      price: 40,
      originalPrice: 45,
      discount: 11,
      unit: '750 ml',
      stock: 120,
      isActive: true,
      isFeatured: true,
      deliveryTime: 10,
      tags: ['beverages', 'cold-drink'],
    },
  })

  await prisma.product.create({
    data: {
      name: 'Real Mango Juice',
      slug: 'real-mango-juice',
      description: 'Pure mango juice',
      categoryId: beveragesCategory.id,
      images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'],
      price: 85,
      originalPrice: 100,
      discount: 15,
      unit: '1 L',
      stock: 80,
      isActive: true,
      isFeatured: true,
      deliveryTime: 10,
      tags: ['beverages', 'juice', 'mango'],
    },
  })

  await prisma.product.create({
    data: {
      name: 'Bisleri Water',
      slug: 'bisleri-water',
      description: 'Mineral water',
      categoryId: beveragesCategory.id,
      images: ['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'],
      price: 20,
      originalPrice: 20,
      discount: null,
      unit: '1 L',
      stock: 200,
      isActive: true,
      isFeatured: false,
      deliveryTime: 10,
      tags: ['beverages', 'water'],
    },
  })

  console.log('✅ Created 15 products\n')

  // Create Banners
  console.log('🎨 Creating banners...')

  await prisma.banner.create({
    data: {
      title: 'Welcome to Blinkit!',
      subtitle: 'Get groceries delivered in minutes',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
      link: '/category/fruits-vegetables',
      ctaText: 'Shop Now',
      type: 'HERO',
      order: 1,
      isActive: true,
    },
  })

  await prisma.banner.create({
    data: {
      title: 'Fresh Fruits & Vegetables',
      subtitle: 'Farm to home in 10 minutes',
      image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800',
      link: '/category/fruits-vegetables',
      ctaText: 'Shop Fresh',
      type: 'CATEGORY',
      order: 2,
      isActive: true,
    },
  })

  await prisma.banner.create({
    data: {
      title: 'Dairy Essentials',
      subtitle: 'Milk, eggs, butter & more',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
      link: '/category/dairy-eggs',
      ctaText: 'Order Now',
      type: 'CATEGORY',
      order: 3,
      isActive: true,
    },
  })

  console.log('✅ Created 3 banners\n')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
