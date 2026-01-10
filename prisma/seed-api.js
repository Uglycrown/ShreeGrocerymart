// API-based seed using fetch
const API_BASE = 'http://localhost:3000/api'

async function seed() {
  console.log('🌱 Starting database seed via API...\n')

  try {
    // Create Categories
    console.log('📁 Creating categories...')
    
    const categories = [
      {
        name: 'Dairy & Eggs',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        description: 'Fresh milk, eggs, butter, and dairy products',
        order: 1,
      },
      {
        name: 'Fruits & Vegetables',
        image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400',
        description: 'Farm-fresh fruits and vegetables',
        order: 2,
      },
      {
        name: 'Snacks & Munchies',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
        description: 'Chips, namkeen, and more',
        order: 3,
      },
      {
        name: 'Cold Drinks & Juices',
        image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe3ea1?w=400',
        description: 'Refreshing beverages',
        order: 4,
      },
    ]

    const createdCategories = []
    for (const cat of categories) {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      })
      const data = await res.json()
      createdCategories.push(data)
      console.log(`✓ Created category: ${data.name}`)
    }

    console.log(`✅ Created ${createdCategories.length} categories\n`)

    // Create Products
    console.log('📦 Creating products...')

    const products = [
      // Dairy Products
      {
        name: 'Amul Taaza Milk',
        description: 'Fresh toned milk',
        categoryId: createdCategories[0].id,
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'],
        price: 28,
        originalPrice: 30,
        unit: '500 ml',
        stock: 50,
        isFeatured: true,
        deliveryTime: 10,
        tags: ['milk', 'dairy', 'fresh'],
      },
      {
        name: 'Brown Eggs',
        description: 'Farm fresh brown eggs',
        categoryId: createdCategories[0].id,
        images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'],
        price: 80,
        originalPrice: 90,
        unit: '6 pieces',
        stock: 30,
        isFeatured: true,
        deliveryTime: 10,
        tags: ['eggs', 'protein', 'fresh'],
      },
      {
        name: 'Amul Butter',
        description: 'Rich and creamy butter',
        categoryId: createdCategories[0].id,
        images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'],
        price: 54,
        originalPrice: 60,
        unit: '100 g',
        stock: 40,
        deliveryTime: 10,
        tags: ['butter', 'dairy'],
      },
      // Fruits & Vegetables
      {
        name: 'Fresh Bananas',
        description: 'Ripe yellow bananas',
        categoryId: createdCategories[1].id,
        images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400'],
        price: 40,
        originalPrice: 50,
        unit: '6 pieces',
        stock: 100,
        isFeatured: true,
        deliveryTime: 10,
        tags: ['fruits', 'fresh', 'healthy'],
      },
      {
        name: 'Red Apples',
        description: 'Crispy red apples',
        categoryId: createdCategories[1].id,
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'],
        price: 120,
        originalPrice: 150,
        unit: '1 kg',
        stock: 80,
        isFeatured: true,
        deliveryTime: 10,
        tags: ['fruits', 'fresh', 'healthy'],
      },
      {
        name: 'Fresh Tomatoes',
        description: 'Farm fresh tomatoes',
        categoryId: createdCategories[1].id,
        images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'],
        price: 30,
        originalPrice: 40,
        unit: '500 g',
        stock: 60,
        deliveryTime: 10,
        tags: ['vegetables', 'fresh'],
      },
      {
        name: 'Green Capsicum',
        description: 'Fresh bell peppers',
        categoryId: createdCategories[1].id,
        images: ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400'],
        price: 35,
        originalPrice: 45,
        unit: '250 g',
        stock: 50,
        deliveryTime: 10,
        tags: ['vegetables', 'fresh'],
      },
      // Snacks
      {
        name: 'Lays Classic Chips',
        description: 'Crispy potato chips',
        categoryId: createdCategories[2].id,
        images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'],
        price: 20,
        originalPrice: 25,
        unit: '50 g',
        stock: 200,
        isFeatured: true,
        deliveryTime: 10,
        tags: ['snacks', 'chips'],
      },
      {
        name: 'Kurkure Masala Munch',
        description: 'Spicy crunchy snack',
        categoryId: createdCategories[2].id,
        images: ['https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400'],
        price: 10,
        originalPrice: 15,
        unit: '30 g',
        stock: 150,
        deliveryTime: 10,
        tags: ['snacks', 'spicy'],
      },
      {
        name: 'Haldirams Bhujia',
        description: 'Traditional namkeen',
        categoryId: createdCategories[2].id,
        images: ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'],
        price: 45,
        originalPrice: 50,
        unit: '200 g',
        stock: 100,
        deliveryTime: 10,
        tags: ['snacks', 'namkeen'],
      },
      // Beverages
      {
        name: 'Coca Cola',
        description: 'Refreshing cold drink',
        categoryId: createdCategories[3].id,
        images: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'],
        price: 40,
        originalPrice: 45,
        unit: '750 ml',
        stock: 120,
        isFeatured: true,
        deliveryTime: 10,
        tags: ['beverages', 'cold-drink'],
      },
      {
        name: 'Real Mango Juice',
        description: 'Pure mango juice',
        categoryId: createdCategories[3].id,
        images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'],
        price: 85,
        originalPrice: 100,
        unit: '1 L',
        stock: 80,
        isFeatured: true,
        deliveryTime: 10,
        tags: ['beverages', 'juice', 'mango'],
      },
      {
        name: 'Bisleri Water',
        description: 'Mineral water',
        categoryId: createdCategories[3].id,
        images: ['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'],
        price: 20,
        unit: '1 L',
        stock: 200,
        deliveryTime: 10,
        tags: ['beverages', 'water'],
      },
    ]

    let productCount = 0
    for (const product of products) {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      const data = await res.json()
      productCount++
      console.log(`✓ Created product: ${data.name}`)
    }

    console.log(`✅ Created ${productCount} products\n`)

    // Create Banners
    console.log('🎨 Creating banners...')

    const banners = [
      {
        title: 'Welcome to Blinkit!',
        subtitle: 'Get groceries delivered in minutes',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
        link: '/category/fruits-vegetables',
        ctaText: 'Shop Now',
        type: 'HERO',
        order: 1,
      },
      {
        title: 'Fresh Fruits & Vegetables',
        subtitle: 'Farm to home in 10 minutes',
        image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800',
        link: '/category/fruits-vegetables',
        ctaText: 'Shop Fresh',
        type: 'CATEGORY',
        order: 2,
      },
      {
        title: 'Dairy Essentials',
        subtitle: 'Milk, eggs, butter & more',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
        link: '/category/dairy-eggs',
        ctaText: 'Order Now',
        type: 'CATEGORY',
        order: 3,
      },
    ]

    for (const banner of banners) {
      const res = await fetch(`${API_BASE}/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      })
      const data = await res.json()
      console.log(`✓ Created banner: ${data.title}`)
    }

    console.log(`✅ Created ${banners.length} banners\n`)

    console.log('🎉 Database seeded successfully via API!')
  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  }
}

seed()
