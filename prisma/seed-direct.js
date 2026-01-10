// Direct MongoDB seed without Prisma
const { MongoClient, ObjectId } = require('mongodb')

const url = 'mongodb://localhost:27017'
const dbName = 'blinkit'

async function seed() {
  const client = new MongoClient(url)
  
  try {
    await client.connect()
    console.log('🌱 Starting database seed...\n')
    
    const db = client.db(dbName)
    
    // Clear existing data
    console.log('🧹 Cleaning existing data...')
    await db.collection('Product').deleteMany({})
    await db.collection('Category').deleteMany({})
    await db.collection('Banner').deleteMany({})
    
    // Create Categories
    console.log('📁 Creating categories...')
    
    const categories = [
      {
        _id: new ObjectId(),
        name: 'Dairy & Eggs',
        slug: 'dairy-eggs',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        description: 'Fresh milk, eggs, butter, and dairy products',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Fruits & Vegetables',
        slug: 'fruits-vegetables',
        image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400',
        description: 'Farm-fresh fruits and vegetables',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Snacks & Munchies',
        slug: 'snacks-munchies',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
        description: 'Chips, namkeen, and more',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Cold Drinks & Juices',
        slug: 'cold-drinks-juices',
        image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe3ea1?w=400',
        description: 'Refreshing beverages',
        order: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    await db.collection('Category').insertMany(categories)
    console.log(`✅ Created ${categories.length} categories\n`)
    
    // Create Products
    console.log('📦 Creating products...')
    
    const products = [
      // Dairy Products
      {
        _id: new ObjectId(),
        name: 'Amul Taaza Milk',
        slug: 'amul-taaza-milk',
        description: 'Fresh toned milk',
        categoryId: categories[0]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Brown Eggs',
        slug: 'brown-eggs',
        description: 'Farm fresh brown eggs',
        categoryId: categories[0]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Amul Butter',
        slug: 'amul-butter',
        description: 'Rich and creamy butter',
        categoryId: categories[0]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Fruits & Vegetables
      {
        _id: new ObjectId(),
        name: 'Fresh Bananas',
        slug: 'fresh-bananas',
        description: 'Ripe yellow bananas',
        categoryId: categories[1]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Red Apples',
        slug: 'red-apples',
        description: 'Crispy red apples',
        categoryId: categories[1]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Fresh Tomatoes',
        slug: 'fresh-tomatoes',
        description: 'Farm fresh tomatoes',
        categoryId: categories[1]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Green Capsicum',
        slug: 'green-capsicum',
        description: 'Fresh bell peppers',
        categoryId: categories[1]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Snacks
      {
        _id: new ObjectId(),
        name: 'Lays Classic Chips',
        slug: 'lays-classic-chips',
        description: 'Crispy potato chips',
        categoryId: categories[2]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Kurkure Masala Munch',
        slug: 'kurkure-masala-munch',
        description: 'Spicy crunchy snack',
        categoryId: categories[2]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Haldirams Bhujia',
        slug: 'haldirams-bhujia',
        description: 'Traditional namkeen',
        categoryId: categories[2]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Beverages
      {
        _id: new ObjectId(),
        name: 'Coca Cola',
        slug: 'coca-cola',
        description: 'Refreshing cold drink',
        categoryId: categories[3]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Real Mango Juice',
        slug: 'real-mango-juice',
        description: 'Pure mango juice',
        categoryId: categories[3]._id,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Bisleri Water',
        slug: 'bisleri-water',
        description: 'Mineral water',
        categoryId: categories[3]._id,
        images: ['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'],
        price: 20,
        originalPrice: null,
        discount: null,
        unit: '1 L',
        stock: 200,
        isActive: true,
        isFeatured: false,
        deliveryTime: 10,
        tags: ['beverages', 'water'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    await db.collection('Product').insertMany(products)
    console.log(`✅ Created ${products.length} products\n`)
    
    // Create Banners
    console.log('🎨 Creating banners...')
    
    const banners = [
      {
        _id: new ObjectId(),
        title: 'Welcome to Shree Grocery Mart!',
        subtitle: 'Get groceries delivered in minutes',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
        link: '/category/fruits-vegetables',
        ctaText: 'Shop Now',
        type: 'HERO',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        title: 'Fresh Fruits & Vegetables',
        subtitle: 'Farm to home in 10 minutes',
        image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800',
        link: '/category/fruits-vegetables',
        ctaText: 'Shop Fresh',
        type: 'CATEGORY',
        order: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        title: 'Dairy Essentials',
        subtitle: 'Milk, eggs, butter & more',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
        link: '/category/dairy-eggs',
        ctaText: 'Order Now',
        type: 'CATEGORY',
        order: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    await db.collection('Banner').insertMany(banners)
    console.log(`✅ Created ${banners.length} banners\n`)
    
    console.log('🎉 Database seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seed()
