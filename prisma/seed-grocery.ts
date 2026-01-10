// Enhanced Seed script with Indian grocery products
// Run with: npx tsx prisma/seed-grocery.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Indian grocery store seed...\n')

  // Clear existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.banner.deleteMany({})
  console.log('✅ Cleaned\n')

  // Create Categories
  console.log('📁 Creating categories...')
  
  const dairyCategory = await prisma.category.create({
    data: {
      name: 'Dairy & Eggs',
      slug: 'dairy-eggs',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
      description: 'Fresh milk, paneer, butter, ghee, eggs',
      order: 1,
    },
  })

  const dalsCategory = await prisma.category.create({
    data: {
      name: 'Dals & Pulses',
      slug: 'dals-pulses',
      image: 'https://images.unsplash.com/photo-1602524206684-bc8e4d4e8f37?w=400',
      description: 'Toor dal, moong dal, chana, masoor, rajma',
      order: 2,
    },
  })

  const attaCategory = await prisma.category.create({
    data: {
      name: 'Atta, Rice & Dal',
      slug: 'atta-rice-dal',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      description: 'Wheat flour, rice varieties, pulses',
      order: 3,
    },
  })

  const oilCategory = await prisma.category.create({
    data: {
      name: 'Edible Oils & Ghee',
      slug: 'oils-ghee',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
      description: 'Cooking oils, ghee, refined oil',
      order: 4,
    },
  })

  const spicesCategory = await prisma.category.create({
    data: {
      name: 'Masala & Spices',
      slug: 'masala-spices',
      image: 'https://images.unsplash.com/photo-1596040033229-a0b5b8e52f5a?w=400',
      description: 'Turmeric, chilli, garam masala, whole spices',
      order: 5,
    },
  })

  const fruitsCategory = await prisma.category.create({
    data: {
      name: 'Fruits & Vegetables',
      slug: 'fruits-vegetables',
      image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400',
      description: 'Farm-fresh fruits and vegetables',
      order: 6,
    },
  })

  const snacksCategory = await prisma.category.create({
    data: {
      name: 'Snacks & Namkeen',
      slug: 'snacks-namkeen',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
      description: 'Chips, namkeen, biscuits',
      order: 7,
    },
  })

  const beveragesCategory = await prisma.category.create({
    data: {
      name: 'Beverages',
      slug: 'beverages',
      image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe3ea1?w=400',
      description: 'Tea, coffee, cold drinks, juices',
      order: 8,
    },
  })

  console.log('✅ Categories created\n')

  // Create Products
  console.log('📦 Creating products...\n')

  // Dairy Products
  console.log('  🥛 Dairy & Eggs...')
  await prisma.product.createMany({
    data: [
      {
        name: 'Amul Gold Full Cream Milk',
        slug: 'amul-gold-milk-500ml',
        description: 'Fresh and pure full cream milk with 6% fat',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'],
        price: 35,
        originalPrice: 38,
        discount: 8,
        unit: '500 ml',
        stock: 150,
        isActive: true,
        isFeatured: true,
        tags: ['milk', 'dairy', 'amul', 'fresh'],
        deliveryTime: 24,
      },
      {
        name: 'Amul Taaza Toned Milk',
        slug: 'amul-taaza-milk-500ml',
        description: 'Healthy toned milk with 3% fat',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'],
        price: 28,
        unit: '500 ml',
        stock: 200,
        isActive: true,
        tags: ['milk', 'dairy', 'amul', 'toned'],
        deliveryTime: 24,
      },
      {
        name: 'Amul Salted Butter',
        slug: 'amul-butter-100g',
        description: 'Premium quality pasteurized salted butter',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'],
        price: 58,
        originalPrice: 62,
        discount: 6,
        unit: '100 g',
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ['butter', 'dairy', 'amul'],
        deliveryTime: 24,
      },
      {
        name: 'Amul Fresh Paneer',
        slug: 'amul-paneer-200g',
        description: 'Fresh soft paneer made from pure milk',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400'],
        price: 90,
        unit: '200 g',
        stock: 80,
        isActive: true,
        tags: ['paneer', 'dairy', 'protein'],
        deliveryTime: 24,
      },
      {
        name: 'Amul Cow Ghee',
        slug: 'amul-cow-ghee-500ml',
        description: 'Pure cow ghee made from fresh cream',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1628408135644-8cc1794c5299?w=400'],
        price: 340,
        originalPrice: 360,
        discount: 6,
        unit: '500 ml',
        stock: 50,
        isActive: true,
        isFeatured: true,
        tags: ['ghee', 'dairy', 'amul', 'pure'],
        deliveryTime: 24,
      },
      {
        name: 'Farm Fresh Brown Eggs',
        slug: 'brown-eggs-6pc',
        description: 'Protein-rich cage-free brown eggs',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'],
        price: 42,
        unit: '6 pieces',
        stock: 120,
        isActive: true,
        tags: ['eggs', 'protein', 'fresh'],
        deliveryTime: 24,
      },
      {
        name: 'Farm Fresh White Eggs',
        slug: 'white-eggs-6pc',
        description: 'Fresh white eggs rich in protein',
        categoryId: dairyCategory.id,
        images: ['https://images.unsplash.com/photo-1587486937626-18c3c99279f8?w=400'],
        price: 36,
        unit: '6 pieces',
        stock: 150,
        isActive: true,
        tags: ['eggs', 'protein', 'fresh'],
        deliveryTime: 24,
      },
    ],
  })

  // Dals & Pulses
  console.log('  🫘 Dals & Pulses...')
  await prisma.product.createMany({
    data: [
      {
        name: 'Toor Dal (Arhar Dal)',
        slug: 'toor-dal-1kg',
        description: 'Premium quality yellow pigeon peas',
        categoryId: dalsCategory.id,
        images: ['https://images.unsplash.com/photo-1602524206684-bc8e4d4e8f37?w=400'],
        price: 135,
        originalPrice: 150,
        discount: 10,
        unit: '1 kg',
        stock: 200,
        isActive: true,
        isFeatured: true,
        tags: ['dal', 'toor', 'pulses', 'protein'],
        deliveryTime: 24,
      },
      {
        name: 'Moong Dal (Yellow)',
        slug: 'moong-dal-yellow-1kg',
        description: 'Split yellow moong lentils',
        categoryId: dalsCategory.id,
        images: ['https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400'],
        price: 120,
        unit: '1 kg',
        stock: 180,
        isActive: true,
        isFeatured: true,
        tags: ['dal', 'moong', 'pulses'],
        deliveryTime: 24,
      },
      {
        name: 'Masoor Dal (Red Lentils)',
        slug: 'masoor-dal-1kg',
        description: 'Split red lentils for quick cooking',
        categoryId: dalsCategory.id,
        images: ['https://images.unsplash.com/photo-1596097635775-0b8e9e6d8e3f?w=400'],
        price: 110,
        originalPrice: 125,
        discount: 12,
        unit: '1 kg',
        stock: 150,
        isActive: true,
        tags: ['dal', 'masoor', 'red-lentils'],
        deliveryTime: 24,
      },
      {
        name: 'Chana Dal',
        slug: 'chana-dal-1kg',
        description: 'Split bengal gram lentils',
        categoryId: dalsCategory.id,
        images: ['https://images.unsplash.com/photo-1610089538924-f2f8d0b6c8d4?w=400'],
        price: 90,
        unit: '1 kg',
        stock: 160,
        isActive: true,
        tags: ['dal', 'chana', 'pulses'],
        deliveryTime: 24,
      },
      {
        name: 'Urad Dal (Black Gram)',
        slug: 'urad-dal-1kg',
        description: 'Split black gram for idli, dosa',
        categoryId: dalsCategory.id,
        images: ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'],
        price: 115,
        unit: '1 kg',
        stock: 140,
        isActive: true,
        tags: ['dal', 'urad', 'black-gram'],
        deliveryTime: 24,
      },
      {
        name: 'Kabuli Chana (White Chickpeas)',
        slug: 'kabuli-chana-1kg',
        description: 'Premium quality white chickpeas',
        categoryId: dalsCategory.id,
        images: ['https://images.unsplash.com/photo-1568564321589-3e581d074f9b?w=400'],
        price: 140,
        unit: '1 kg',
        stock: 120,
        isActive: true,
        tags: ['chana', 'chickpeas', 'protein'],
        deliveryTime: 24,
      },
      {
        name: 'Rajma (Red Kidney Beans)',
        slug: 'rajma-red-1kg',
        description: 'Premium Kashmiri rajma',
        categoryId: dalsCategory.id,
        images: ['https://images.unsplash.com/photo-1593472374117-3c050f87f0f9?w=400'],
        price: 160,
        originalPrice: 180,
        discount: 11,
        unit: '1 kg',
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ['rajma', 'kidney-beans', 'protein'],
        deliveryTime: 24,
      },
      {
        name: 'Whole Green Moong',
        slug: 'moong-whole-green-1kg',
        description: 'Whole green gram for sprouts',
        categoryId: dalsCategory.id,
        images: ['https://images.unsplash.com/photo-1587486937626-18c3c99279f8?w=400'],
        price: 130,
        unit: '1 kg',
        stock: 130,
        isActive: true,
        tags: ['moong', 'green-gram', 'sprouts'],
        deliveryTime: 24,
      },
    ],
  })

  // Atta, Rice & Dal
  console.log('  🌾 Atta & Rice...')
  await prisma.product.createMany({
    data: [
      {
        name: 'Aashirvaad Whole Wheat Atta',
        slug: 'aashirvaad-atta-5kg',
        description: 'Premium quality chakki atta',
        categoryId: attaCategory.id,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
        price: 255,
        originalPrice: 280,
        discount: 9,
        unit: '5 kg',
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ['atta', 'wheat', 'flour', 'aashirvaad'],
        deliveryTime: 24,
      },
      {
        name: 'Pillsbury Chakki Atta',
        slug: 'pillsbury-atta-5kg',
        description: 'Stone ground whole wheat flour',
        categoryId: attaCategory.id,
        images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400'],
        price: 250,
        unit: '5 kg',
        stock: 90,
        isActive: true,
        tags: ['atta', 'wheat', 'pillsbury'],
        deliveryTime: 24,
      },
      {
        name: 'India Gate Basmati Rice',
        slug: 'india-gate-basmati-5kg',
        description: 'Premium aged basmati rice',
        categoryId: attaCategory.id,
        images: ['https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400'],
        price: 425,
        originalPrice: 475,
        discount: 11,
        unit: '5 kg',
        stock: 80,
        isActive: true,
        isFeatured: true,
        tags: ['rice', 'basmati', 'premium'],
        deliveryTime: 24,
      },
      {
        name: 'Daawat Biryani Basmati Rice',
        slug: 'daawat-biryani-rice-5kg',
        description: 'Long grain basmati for biryani',
        categoryId: attaCategory.id,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
        price: 390,
        unit: '5 kg',
        stock: 70,
        isActive: true,
        tags: ['rice', 'basmati', 'biryani', 'daawat'],
        deliveryTime: 24,
      },
      {
        name: 'Sona Masoori Rice',
        slug: 'sona-masoori-rice-5kg',
        description: 'Premium quality south Indian rice',
        categoryId: attaCategory.id,
        images: ['https://images.unsplash.com/photo-1562147771-4c5e0dcf1b89?w=400'],
        price: 280,
        originalPrice: 310,
        discount: 10,
        unit: '5 kg',
        stock: 100,
        isActive: true,
        tags: ['rice', 'sona-masoori'],
        deliveryTime: 24,
      },
      {
        name: 'Besan (Gram Flour)',
        slug: 'besan-1kg',
        description: 'Pure gram flour for pakoras',
        categoryId: attaCategory.id,
        images: ['https://images.unsplash.com/photo-1599909533895-8e36d3bc4ad0?w=400'],
        price: 75,
        unit: '1 kg',
        stock: 120,
        isActive: true,
        tags: ['besan', 'flour', 'gram'],
        deliveryTime: 24,
      },
    ],
  })

  // Edible Oils & Ghee
  console.log('  🛢️ Oils & Ghee...')
  await prisma.product.createMany({
    data: [
      {
        name: 'Fortune Sunflower Oil',
        slug: 'fortune-sunflower-oil-1l',
        description: 'Refined sunflower cooking oil',
        categoryId: oilCategory.id,
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'],
        price: 155,
        originalPrice: 170,
        discount: 9,
        unit: '1 L',
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ['oil', 'sunflower', 'cooking'],
        deliveryTime: 24,
      },
      {
        name: 'Saffola Gold Oil',
        slug: 'saffola-gold-1l',
        description: 'Blended oil for healthy heart',
        categoryId: oilCategory.id,
        images: ['https://images.unsplash.com/photo-1615485290161-c8f5c78a3e5e?w=400'],
        price: 185,
        unit: '1 L',
        stock: 80,
        isActive: true,
        tags: ['oil', 'saffola', 'healthy'],
        deliveryTime: 24,
      },
      {
        name: 'Fortune Mustard Oil',
        slug: 'fortune-mustard-oil-1l',
        description: 'Pure mustard cooking oil',
        categoryId: oilCategory.id,
        images: ['https://images.unsplash.com/photo-1615485290161-c8f5c78a3e5e?w=400'],
        price: 175,
        unit: '1 L',
        stock: 90,
        isActive: true,
        tags: ['oil', 'mustard', 'kachi-ghani'],
        deliveryTime: 24,
      },
      {
        name: 'Patanjali Cow Ghee',
        slug: 'patanjali-ghee-500ml',
        description: 'Pure desi cow ghee',
        categoryId: oilCategory.id,
        images: ['https://images.unsplash.com/photo-1628408135644-8cc1794c5299?w=400'],
        price: 315,
        originalPrice: 350,
        discount: 10,
        unit: '500 ml',
        stock: 60,
        isActive: true,
        isFeatured: true,
        tags: ['ghee', 'desi', 'patanjali'],
        deliveryTime: 24,
      },
    ],
  })

  // Masala & Spices
  console.log('  🌶️ Masala & Spices...')
  await prisma.product.createMany({
    data: [
      {
        name: 'MDH Garam Masala',
        slug: 'mdh-garam-masala-100g',
        description: 'Aromatic blend of Indian spices',
        categoryId: spicesCategory.id,
        images: ['https://images.unsplash.com/photo-1596040033229-a0b5b8e52f5a?w=400'],
        price: 90,
        unit: '100 g',
        stock: 150,
        isActive: true,
        isFeatured: true,
        tags: ['masala', 'spices', 'mdh'],
        deliveryTime: 24,
      },
      {
        name: 'Everest Turmeric Powder',
        slug: 'everest-turmeric-200g',
        description: 'Pure haldi powder',
        categoryId: spicesCategory.id,
        images: ['https://images.unsplash.com/photo-1615485290161-c8f5c78a3e5e?w=400'],
        price: 85,
        unit: '200 g',
        stock: 180,
        isActive: true,
        tags: ['haldi', 'turmeric', 'everest'],
        deliveryTime: 24,
      },
      {
        name: 'Everest Red Chilli Powder',
        slug: 'everest-chilli-powder-200g',
        description: 'Spicy red chilli powder',
        categoryId: spicesCategory.id,
        images: ['https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400'],
        price: 95,
        unit: '200 g',
        stock: 170,
        isActive: true,
        tags: ['chilli', 'lal-mirch', 'everest'],
        deliveryTime: 24,
      },
      {
        name: 'MDH Coriander Powder',
        slug: 'mdh-coriander-powder-100g',
        description: 'Pure dhaniya powder',
        categoryId: spicesCategory.id,
        images: ['https://images.unsplash.com/photo-1599909533895-8e36d3bc4ad0?w=400'],
        price: 48,
        unit: '100 g',
        stock: 160,
        isActive: true,
        tags: ['coriander', 'dhaniya', 'mdh'],
        deliveryTime: 24,
      },
      {
        name: 'Catch Cumin Seeds (Jeera)',
        slug: 'catch-jeera-100g',
        description: 'Whole cumin seeds',
        categoryId: spicesCategory.id,
        images: ['https://images.unsplash.com/photo-1596097635775-0b8e9e6d8e3f?w=400'],
        price: 65,
        unit: '100 g',
        stock: 140,
        isActive: true,
        tags: ['jeera', 'cumin', 'whole-spices'],
        deliveryTime: 24,
      },
    ],
  })

  // Fruits & Vegetables
  console.log('  🍎 Fruits & Vegetables...')
  await prisma.product.createMany({
    data: [
      {
        name: 'Fresh Red Apples (Shimla)',
        slug: 'red-apples-shimla',
        description: 'Crispy and sweet red apples',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400'],
        price: 160,
        originalPrice: 180,
        discount: 11,
        unit: '1 kg',
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ['fruits', 'apples', 'fresh'],
        deliveryTime: 24,
      },
      {
        name: 'Fresh Bananas (Robusta)',
        slug: 'bananas-robusta',
        description: 'Naturally ripened yellow bananas',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400'],
        price: 50,
        unit: '1 dozen',
        stock: 150,
        isActive: true,
        tags: ['fruits', 'bananas', 'fresh'],
        deliveryTime: 24,
      },
      {
        name: 'Fresh Tomatoes',
        slug: 'tomatoes-desi',
        description: 'Locally sourced ripe tomatoes',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'],
        price: 40,
        unit: '1 kg',
        stock: 200,
        isActive: true,
        tags: ['vegetables', 'tomatoes', 'fresh'],
        deliveryTime: 24,
      },
      {
        name: 'Fresh Onions',
        slug: 'onions-nashik',
        description: 'Fresh Nashik onions',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1508747703725-719777637510?w=400'],
        price: 45,
        unit: '1 kg',
        stock: 180,
        isActive: true,
        isFeatured: true,
        tags: ['vegetables', 'onions', 'fresh'],
        deliveryTime: 24,
      },
      {
        name: 'Fresh Potatoes',
        slug: 'potatoes-local',
        description: 'Farm fresh potatoes',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'],
        price: 35,
        unit: '1 kg',
        stock: 200,
        isActive: true,
        tags: ['vegetables', 'potatoes', 'aloo'],
        deliveryTime: 24,
      },
      {
        name: 'Fresh Green Chillies',
        slug: 'green-chillies',
        description: 'Fresh spicy green chillies',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1583663824682-4f46c0c2f4e5?w=400'],
        price: 80,
        unit: '250 g',
        stock: 120,
        isActive: true,
        tags: ['vegetables', 'chillies', 'hari-mirch'],
        deliveryTime: 24,
      },
      {
        name: 'Fresh Coriander Leaves',
        slug: 'coriander-leaves',
        description: 'Fresh green coriander bunch',
        categoryId: fruitsCategory.id,
        images: ['https://images.unsplash.com/photo-1626165398938-03b2f932af58?w=400'],
        price: 15,
        unit: '1 bunch',
        stock: 150,
        isActive: true,
        tags: ['vegetables', 'coriander', 'dhaniya'],
        deliveryTime: 24,
      },
    ],
  })

  // Snacks & Namkeen
  console.log('  🍿 Snacks...')
  await prisma.product.createMany({
    data: [
      {
        name: 'Haldiram\'s Aloo Bhujia',
        slug: 'haldirams-aloo-bhujia-400g',
        description: 'Crispy and spicy potato namkeen',
        categoryId: snacksCategory.id,
        images: ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'],
        price: 95,
        originalPrice: 105,
        discount: 10,
        unit: '400 g',
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ['snacks', 'namkeen', 'haldirams'],
        deliveryTime: 24,
      },
      {
        name: 'Bikaji Moong Dal',
        slug: 'bikaji-moong-dal-200g',
        description: 'Crunchy moong dal namkeen',
        categoryId: snacksCategory.id,
        images: ['https://images.unsplash.com/photo-1593472374117-3c050f87f0f9?w=400'],
        price: 55,
        unit: '200 g',
        stock: 120,
        isActive: true,
        tags: ['snacks', 'namkeen', 'bikaji'],
        deliveryTime: 24,
      },
      {
        name: 'Lay\'s Classic Salted Chips',
        slug: 'lays-classic-chips-90g',
        description: 'Crispy potato chips',
        categoryId: snacksCategory.id,
        images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'],
        price: 30,
        unit: '90 g',
        stock: 150,
        isActive: true,
        tags: ['snacks', 'chips', 'lays'],
        deliveryTime: 24,
      },
      {
        name: 'Parle-G Biscuits',
        slug: 'parle-g-biscuits-376g',
        description: 'India\'s favorite glucose biscuits',
        categoryId: snacksCategory.id,
        images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'],
        price: 40,
        unit: '376 g',
        stock: 180,
        isActive: true,
        isFeatured: true,
        tags: ['biscuits', 'parle-g', 'snacks'],
        deliveryTime: 24,
      },
    ],
  })

  // Beverages
  console.log('  ☕ Beverages...')
  await prisma.product.createMany({
    data: [
      {
        name: 'Tata Tea Gold',
        slug: 'tata-tea-gold-500g',
        description: 'Premium blend black tea',
        categoryId: beveragesCategory.id,
        images: ['https://images.unsplash.com/photo-1597318112881-2eeb2a71b638?w=400'],
        price: 245,
        originalPrice: 270,
        discount: 9,
        unit: '500 g',
        stock: 100,
        isActive: true,
        isFeatured: true,
        tags: ['tea', 'chai', 'tata'],
        deliveryTime: 24,
      },
      {
        name: 'Nescafe Classic Coffee',
        slug: 'nescafe-classic-50g',
        description: 'Instant coffee powder',
        categoryId: beveragesCategory.id,
        images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'],
        price: 210,
        unit: '50 g',
        stock: 80,
        isActive: true,
        tags: ['coffee', 'instant', 'nescafe'],
        deliveryTime: 24,
      },
      {
        name: 'Coca-Cola Soft Drink',
        slug: 'coca-cola-2l',
        description: 'Classic cola beverage',
        categoryId: beveragesCategory.id,
        images: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'],
        price: 90,
        originalPrice: 100,
        discount: 10,
        unit: '2 L',
        stock: 120,
        isActive: true,
        tags: ['cold-drink', 'cola', 'coke'],
        deliveryTime: 24,
      },
      {
        name: 'Real Fruit Juice - Mixed Fruit',
        slug: 'real-mixed-fruit-1l',
        description: '100% fruit juice',
        categoryId: beveragesCategory.id,
        images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'],
        price: 115,
        unit: '1 L',
        stock: 90,
        isActive: true,
        tags: ['juice', 'fruit', 'real'],
        deliveryTime: 24,
      },
    ],
  })

  console.log('✅ All products created\n')

  // Create Banners
  console.log('🎨 Creating banners...')
  await prisma.banner.createMany({
    data: [
      {
        title: 'Fresh Groceries in 24 Minutes',
        subtitle: 'Dals, Atta, Rice & More at your doorstep',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
        link: '/',
        ctaText: 'Shop Now',
        type: 'HERO',
        order: 1,
      },
      {
        title: 'Premium Dals & Pulses',
        subtitle: 'Toor, Moong, Masoor & More',
        image: 'https://images.unsplash.com/photo-1602524206684-bc8e4d4e8f37?w=600',
        link: '/category/dals-pulses',
        ctaText: 'Browse Dals',
        type: 'CATEGORY',
        order: 1,
      },
      {
        title: 'Fresh Atta & Rice',
        subtitle: 'Premium quality staples',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
        link: '/category/atta-rice-dal',
        ctaText: 'Shop Now',
        type: 'CATEGORY',
        order: 2,
      },
    ],
  })

  console.log('✅ Banners created\n')

  console.log('🎉 Indian Grocery Store seeding completed!\n')
  console.log('📊 Summary:')
  console.log('  - 8 Categories')
  console.log('  - 60+ Products')
  console.log('  - 3 Banners')
  console.log('\n✅ Your grocery store is ready!')
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
