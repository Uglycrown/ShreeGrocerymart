import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

interface ProductRecord {
  name: string;
  taxStatus: string;
  taxClass: string;
  inStock: boolean;
  stock: number | null;
  lowStockAmount: number | null;
  salePrice: number | null;
  regularPrice: number | null;
  categories: string;
}

async function main() {
  console.log('Starting to seed product data...');
  const productsPath = path.join(__dirname, 'products.json');
  const products: ProductRecord[] = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  const categoryMap = new Map<string, any>();

  // Ensure all categories exist and get their IDs
  for (const product of products) {
    if (!product.categories) continue;

    const categoryNames = product.categories.split('>').map(c => c.trim());
    let parentId: string | null = null;
    let fullPath = '';

    for (const categoryName of categoryNames) {
      fullPath = parentId ? `${fullPath} > ${categoryName}` : categoryName;
      if (!categoryMap.has(fullPath)) {
        const slug = slugify(categoryName);
        let category = await prisma.category.findUnique({ where: { slug } });
        if (!category) {
            console.log(`Creating category: ${categoryName}`);
            try {
                category = await prisma.category.create({
                    data: {
                      name: categoryName,
                      slug: slug,
                      parentId: parentId,
                    },
                  });
            } catch (e: any) {
                if (e.code === 'P2002') { // Unique constraint failed
                    category = await prisma.category.findUnique({ where: { slug } });
                } else {
                    throw e;
                }
            }
        }
        categoryMap.set(fullPath, category);
        parentId = category!.id;
      } else {
        parentId = categoryMap.get(fullPath)!.id;
      }
    }
  }

  // Create products
  for (const product of products) {
    if (!product.name || !product.categories) continue;
    
    const categoryNames = product.categories.split('>').map(c => c.trim());
    const fullPath = categoryNames.join(' > ');
    const category = categoryMap.get(fullPath);

    if (!category) {
        console.warn(`Category not found for product: ${product.name}`);
        continue;
    }

    const slug = slugify(product.name);
    let existingProduct;
    try {
        existingProduct = await prisma.product.findUnique({ where: { slug } });
    } catch (e: any) {
        console.error(`Error finding product with slug ${slug}:`, e);
        continue;
    }


    if (existingProduct) {
        console.log(`Product "${product.name}" already exists. Skipping.`);
        continue;
    }

    const price = product.salePrice ?? product.regularPrice;
    const originalPrice = product.salePrice ? product.regularPrice : null;

    if (price === null) {
        console.warn(`Skipping product "${product.name}" due to missing price.`);
        continue;
    }

    const unitRegex = new RegExp('(\d+(\.\d+)?\s?(g|kg|ml|L|ltr|pcs|Pc|Pack|Pieces|Tablets|Capsules))', 'i');
    const unitMatch = product.name.match(unitRegex);
    const unit = unitMatch ? unitMatch[0] : '';
    
    const tags = [...new Set([
        ...product.name.split(' '),
        ...categoryNames,
        unit ? unit.replace(/\d+/g, '').trim() : ''
    ])].filter(Boolean).map(t => t.toLowerCase());

    try {
        await prisma.product.create({
            data: {
              name: product.name,
              slug: slug,
              description: `Details about ${product.name}`,
              categoryId: category.id,
              images: [],
              price: price,
              originalPrice: originalPrice,
              stock: product.stock ?? (product.inStock ? 10 : 0),
              unit: unit,
              tags: tags,
              isActive: product.inStock,
            },
          });
          console.log(`Created product: ${product.name}`);
    } catch(e: any) {
        console.error(`Failed to create product "${product.name}" with slug "${slug}"`, e);
    }
  }

  console.log('Finished seeding product data.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
