
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const rawProductData = [
    'Name\tTax status\tTax class\tIn stock?\tStock\tLow stock amount\tSale price\tRegular price\tCategories',
    'Amul Gold Full Cream Milk\ttaxable\t\t1\t2\t\t\t35\tDairy Products',
    'Paras full cream milk\ttaxable\t\t0\t\t\t\t35\tDairy Products',
    'Paras Dahi 380gm\ttaxable\tgst-5\t0\t\t\t\t32\tDairy Products',
    'Ananda Delicious Dahi 160gm\ttaxable\tgst-5\t0\t\t\t\t20\tDairy Products',
    'Ananda Delicious Dahi 330gm\ttaxable\tgst-5\t1\t1\t\t\t32\tDairy Products',
    'Paras Dahi 175gm\ttaxable\tgst-5\t0\t\t\t\t19\tDairy Products',
    'Paras Dahi 1kg\ttaxable\tgst-5\t1\t1\t\t\t78\tDairy Products',
    'Ananda Paneer 180g\ttaxable\tgst-5\t1\t1\t\t\t84\tDairy Products',
    'Amul butter 100g\ttaxable\tgst-5\t1\t1\t\t\t58\tDairy Products',
    'Amul Cheese 200g (8 Cube x 25g)\ttaxable\tgst-5\t1\t1\t\t\t139\tDairy Products',
    'Amul Blend Diced Cheese\ttaxable\tgst-5\t0\t\t\t\t129\tDairy Products',
    'Amul Yummy Plain Cheese Spread  200g\ttaxable\tgst-5\t1\t1\t\t\t114\tDairy Products',
    'Amul  Butter, 500 g\ttaxable\tgst-5\t0\t\t\t\t305\tDairy Products',
    'Amul Mithai Mate Condensed Milk\ttaxable\tgst-5\t1\t1\t\t\t126\tDairy Products',
    'Ananda Paneer Green 200g\ttaxable\tgst-5\t1\t1\t\t\t92\tDairy Products',
    'Thumsup Soft Drink 250ml Bottle\ttaxable\t\t0\t\t\t\t20\tCold Drink',
    'Thumsup Soft Drink 750ml Bottle\ttaxable\t\t0\t\t\t\t40\tCold Drink',
    'Thums Up Soft Drink 1L\ttaxable\t\t0\t\t\t\t50\tCold Drink',
    'Thums Up Soft Drink 2L\ttaxable\t\t0\t\t\t\t\tCold Drink',
    'Sprite Soft Drink 250ml\ttaxable\t\t0\t\t\t\t20\tCold Drink',
    'Sprite Soft Drink 750ml Bottle\ttaxable\t\t0\t\t\t\t40\tCold Drink',
    'Sprite Soft Drink 1L\ttaxable\t\t0\t\t\t\t50\tCold Drink',
    'Sprite Soft Drink 2L\ttaxable\t\t0\t\t\t\t99\tCold Drink',
    'Coca Cola Soft Drink 250ml\ttaxable\t\t0\t\t\t\t20\tCold Drink',
    'Coca Cola Soft Drink 750ml\ttaxable\t\t0\t\t\t\t40\tCold Drink',
    'Coca Cola Soft Drink 1L\ttaxable\t\t0\t\t\t\t50\tCold Drink',
    'Coca Cola  Soft Drink 2L\ttaxable\t\t0\t\t\t\t\tCold Drink',
    'Fanta Orange 250ml\ttaxable\t\t0\t\t\t\t20\tCold Drink',
    'Fanta Orange Flavoured 750ml Bottle\ttaxable\t\t0\t\t\t\t40\tCold Drink',
    'Fanta Soft Drink Orange Flavoured 1L\ttaxable\t\t0\t\t\t\t50\tCold Drink',
    'Fanta Soft Drink Orange Flavoured 2L\ttaxable\t\t0\t\t\t\t\tCold Drink',
    'Limca Soft Drink - Lime &amp; LemoniFlavoured 250ml\ttaxable\t\t0\t\t\t\t20\tCold Drink',
    'Limca Soft Drink - Lime &amp; Lemoni Flavoured 750ml\ttaxable\t\t0\t\t\t\t40\tCold Drink',
    'Limca Soft Drink - Lime &amp; Lemon Flavoured 1L\ttaxable\t\t0\t\t\t\t50\tCold Drink',
    'Limca Soft Drink  Lime &amp; Lemoni Flavoured 2L\ttaxable\t\t0\t\t\t\t\tCold Drink',
    'Maaza Mango Fruit Drink 120ml\ttaxable\t\t1\t3\t1\t\t10\tCold Drink',
    'Maaza Mango Fruit Drink 300ml\ttaxable\t\t0\t\t\t\t20\tCold Drink',
    'Maaza Mango Fruit Drink 600ml\ttaxable\t\t0\t\t\t\t40\tCold Drink',
    'Maaza Mango Fruit Drink 1L\ttaxable\t\t0\t\t\t\t60\tCold Drink',
    'Maaza Mango Fruit Drink 2L\ttaxable\t\t0\t\t\t\t100\tCold Drink',
    'Lahori Jeera Soft Drink 160ml\ttaxable\t\t1\t3\t1\t\t10\tCold Drink',
    'Cadbury Dairy Milk 13g\ttaxable\tgst-5\t1\t2\t1\t\t10\tConfectionary',
    'Five Star 16g\ttaxable\tgst-5\t1\t2\t1\t\t10\tConfectionary',
    'Five Star 10g\ttaxable\tgst-5\t1\t2\t1\t\t5\tConfectionary',
    'Five Star Oreo 22g\ttaxable\tgst-5\t1\t2\t1\t\t20\tConfectionary',
    'Cadbury Fuse 24g\ttaxable\tgst-5\t1\t1\t1\t\t20\tConfectionary',
    'Cadbury Crispello 35g\ttaxable\tgst-5\t1\t1\t1\t\t40\tConfectionary',
    'Cadbury Dairy Milk Crackle Chocolate Bar 36g\ttaxable\tgst-5\t1\t1\t1\t\t55\tConfectionary',
    'Cadbury Dairy Milk Roast Almond Chocolate Bar 36g\ttaxable\tgst-5\t1\t1\t1\t\t55\tConfectionary',
    'Cadbury Dairy Milk Roasted Almond Chocolate Bar 80g\ttaxable\tgst-5\t0\t\t\t\t110\tConfectionary',
    'Cadbury Dairy Milk Silk Oreo Chocolate Bar 58g\ttaxable\tgst-5\t1\t2\t1\t\t98\tConfectionary',
    'Cadbury Dairy Milk Silk Fruit &amp; Nut Chocolate Bar 51g\ttaxable\tgst-5\t1\t1\t1\t\t98\tConfectionary',
    'Cadbury Dairy Milk Silk Bubbly Chocolate Bar 46g\ttaxable\tgst-5\t1\t1\t1\t\t98\tConfectionary',
    'Cadbury Dairy Milk Silk Roast Almond Chocolate Bar 134g\ttaxable\tgst-5\t1\t2\t1\t\t214\tConfectionary',
    'Cadbury Dairy Milk Silk Hazelnut Chocolate Bar 134g\ttaxable\tgst-5\t1\t1\t1\t\t214\tConfectionary',
    'Cadbury Dairy Milk Silk Oreo Chocolate Bar 130g\ttaxable\tgst-5\t0\t\t\t\t220\tConfectionary',
    'Cadbury Dairy Milk Silk Fruit &amp; Nut Chocolate Bar 129g\ttaxable\tgst-5\t1\t1\t1\t\t214\tConfectionary',
    'Cadbury Dairy Milk Silk Bubbly Chocolate Bar 120g\ttaxable\tgst-5\t0\t\t\t\t220\tConfectionary',
    'Cadbury Dairy Milk Silk Ganache Chocolate Bar 137g\ttaxable\tgst-5\t1\t1\t1\t\t240\tConfectionary',
    'Cadbury Dairy Milk Silk Mousse Chocolate Bar 110g\ttaxable\tgst-5\t1\t1\t1\t\t240\tConfectionary',
    'Cadbury Bournville Fruit &amp; Nut Chocolate Bar 30g\ttaxable\tgst-5\t0\t\t\t\t55\tConfectionary',
    'Cadbury Bournvil Rum &amp; Raisin 80g\ttaxable\tgst-5\t0\t\t\t\t120\tConfectionary',
    'Cadbury Bournville Rich Cocoa  Chocolate Ba 80g\ttaxable\tgst-5\t0\t\t\t\t120\tConfectionary',
    'Cadbury Bournville Fruit &amp; Nut Chocolate Bar 80g\ttaxable\tgst-5\t1\t1\t1\t\t120\tConfectionary',
    'Cadbury Perk Chocolate 39g\ttaxable\tgst-5\t1\t2\t1\t\t20\tConfectionary',
    'Cadbury Temptation Rum &amp; Raisin 72g\ttaxable\tgst-5\t0\t\t\t\t130\tConfectionary',
    'Cadbury Temptation Almond Treat 72g\ttaxable\tgst-5\t0\t\t\t\t130\tConfectionary',
    'Parle Mango Bite 215g\ttaxable\tgst-5\t1\t3\t1\t\t60\tConfectionary',
    'Parle Mazelo Flavoured Candy 218g\ttaxable\tgst-5\t0\t\t\t\t60\tConfectionary',
    'Parle Fusion Cola Float 198g\ttaxable\tgst-5\t0\t\t\t\t50\tConfectionary',
    'Parle Fusion Mango Float 198g\ttaxable\tgst-5\t1\t3\t1\t\t50\tConfectionary',
    'Parle Londonderry 218g\ttaxable\tgst-5\t1\t3\t1\t\t60\tConfectionary',
    'Parle Orange Bite 195g\ttaxable\tgst-5\t1\t3\t1\t\t50\tConfectionary',
    'Parle 2in1 Eclairs 202g\ttaxable\tgst-5\t1\t2\t1\t\t60\tConfectionary',
    'Joy Land Kaccha Aam 280g\ttaxable\tgst-5\t0\t\t\t\t50\tConfectionary',
    'Joy Land Mango Masti 280g\ttaxable\tgst-5\t1\t2\t1\t\t50\tConfectionary',
    'Candy Mazaa 238g\ttaxable\tgst-5\t1\t3\t1\t\t55\tConfectionary',
    'Crax Tomato Chips 24g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Crax Masala Chips 26g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Crax Salted Chips 24g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Crax Creamy Onion Chips 26g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Crax Rings Masala Mania 24g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Crax Rings Chatpata 24g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Crax Curls Chatpata Masala 33g\ttaxable\tgst-5\t0\t\t\t\t10\tSnacks',
    'Crax Fritts Cream &amp; Onion 33g\ttaxable\tgst-5\t1\t1\t1\t\t10\tSnacks',
    'Crax Crunchy Pipes 34g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Crax  Natkhat Masala 34g\ttaxable\tgst-5\t1\t1\t1\t\t10\tSnacks',
    'Crax Choco Rings 16g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Crax  Natkhat Classic 37g\ttaxable\tgst-5\t1\t1\t1\t\t10\tSnacks',
    'Haldirams Namkeen Fatafat Bhel 42g\ttaxable\tgst-5\t1\t1\t1\t\t10\tSnacks',
    'Haldirams Namkeen Salted Peanuts 37g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Haldirams Namkeen Moong Dal 35g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Haldirams Namkeen Bhujia 35g\ttaxable\tgst-5\t0\t\t\t\t10\tSnacks',
    'Haldirams Namkeen Gupshup Peanuts 41g\ttaxable\tgst-5\t1\t1\t1\t\t10\tSnacks',
    'Haldirams Namkeen Heeng Jeera 38g\ttaxable\tgst-5\t0\t\t\t\t10\tSnacks',
    'Haldirams Namkeen Falahari Mixture 30g\ttaxable\tgst-5\t0\t\t\t\t10\tSnacks',
    'Haldirams Namkeen Chatpata Dal 43g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Haldirams Namkeen Khatta Meetha 40g\ttaxable\tgst-5\t1\t1\t1\t\t10\tSnacks',
    'Haldirams Namkeen Nut Cracker 43g\ttaxable\tgst-5\t1\t1\t1\t\t10\tSnacks',
    'Haldirams Namkeen Navrattan 40g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Haldirams Namkeen Nimbu Masala 40g\ttaxable\tgst-5\t1\t2\t1\t\t10\tSnacks',
    'Haldirams Namkeen Nut Cracker 85g\ttaxable\tgst-5\t0\t\t\t\t20\tSnacks',
    'Haldirams Namkeen Salted Peanuts 75g\ttaxable\tgst-5\t0\t\t\t\t20\tSnacks',
    'Haldirams Namkeen Navrattan 80g\ttaxable\tgst-5\t1\t2\t1\t\t20\tSnacks',
    'Haldirams Namkeen Bhujia 70g\ttaxable\tgst-5\t0\t\t\t\t20\tSnacks',
    'Nutphat  Cashews  500g\ttaxable\tgst-5\t0\t\t\t\t699\tDry Fruits',
    'Nutphat  Almonds  500g\ttaxable\tgst-5\t1\t1\t1\t460\t699\tDry Fruits',
    'Pawan Makhana 100g\ttaxable\tgst-5\t1\t2\t1\t115\t250\tDry Fruits',
    'Pawan Makhana 250g\ttaxable\tgst-5\t1\t2\t1\t270\t500\tDry Fruits',
    'Sai Gold Makhana 250g\ttaxable\tgst-5\t1\t2\t1\t260\t500\tDry Fruits',
    'VIP Raisins Dry Fruits 250g\ttaxable\tgst-5\t0\t\t\t\t\tDry Fruits',
    'Special  Walnut Inshell 500g\ttaxable\tgst-5\t1\t2\t1\t330\t445\tDry Fruits',
    'Special  Sunflower Seeds 250g\ttaxable\tgst-5\t1\t2\t1\t120\t270\tDry Fruits',
    'Special  Chia Seeds 250g\ttaxable\tgst-5\t1\t2\t1\t120\t210\tDry Fruits',
    'Special  Pumpkin Seeds 250g\ttaxable\tgst-5\t1\t2\t1\t160\t290\tDry Fruits',
    'Gulf Dates 500g\ttaxable\tgst-5\t1\t2\t1\t120\t162\tDry Fruits',
    'Masterji Almonds 250g\ttaxable\tgst-5\t1\t3\t2\t220\t350\tDry Fruits',
    'Special  Smart Pack Cashew Nuts Roasted &amp; Salted 100g\ttaxable\tgst-5\t1\t2\t1\t120\t355\tDry Fruits',
    'Special  Smart Pack Almond Roasted &amp; Salted 100g\ttaxable\tgst-5\t1\t2\t1\t120\t200\tDry Fruits',
    'Special  Smart Pack Pistachio Roasted &amp; Salted 100g\ttaxable\tgst-5\t1\t2\t1\t130\t354\tDry Fruits',
    'Mangla  Anjeer Dry Figs 250g\ttaxable\tgst-5\t1\t2\t1\t290\t900\tDry Fruits',
    'Special  Smart Pack Walnut 250g\ttaxable\tgst-5\t1\t2\t1\t280\t540\tDry Fruits',
    'A Cube Salted  Cashews Jar  250g\ttaxable\tgst-5\t1\t2\t1\t330\t550\tDry Fruits',
    'A Cube Global Desi Power Mix Jar  500g\ttaxable\tgst-5\t0\t\t\t350\t535\tDry Fruits',
    'Special  9\'0 Clock Breakfast  Mix Jar 250g\ttaxable\tgst-5\t1\t2\t2\t175\t325\tDry Fruits',
    'Special Seeds  Mix Jar 250g\ttaxable\tgst-5\t0\t\t\t\t180\t265\tDry Fruits',
    'Kimia Gold Dates Box 550g\ttaxable\tgst-5\t1\t1\t1\t160\t499\tDry Fruits',
];

interface ProductData {
    name: string;
    salePrice?: number;
    regularPrice: number;
    categories: string;
    stock: number;
    unit: string;
}

function parseProductData(data: string[]): ProductData[] {
    const products: ProductData[] = [];
    const header = data[0].split('\t').map(h => h.trim());
    const nameIndex = header.indexOf('Name');
    const salePriceIndex = header.indexOf('Sale price');
    const regularPriceIndex = header.indexOf('Regular price');
    const categoriesIndex = header.indexOf('Categories');
    const inStockIndex = header.indexOf('In stock?');
    const stockIndex = header.indexOf('Stock');


    for (let i = 1; i < data.length; i++) {
        const values = data[i].split('\t');
        const name = values[nameIndex];
        const salePrice = values[salePriceIndex] ? parseFloat(values[salePriceIndex]) : undefined;
        const regularPrice = parseFloat(values[regularPriceIndex]);
        const categories = values[categoriesIndex];
        const inStock = parseInt(values[inStockIndex], 10);
        const stock = inStock === 1 ? parseInt(values[stockIndex], 10) : 0;


        if (name && regularPrice && categories) {
            products.push({
                name,
                salePrice,
                regularPrice,
                categories,
                stock,
                unit: '1 unit',
            });
        }
    }

    return products;
}
function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}


async function findImageUrl(productName: string): Promise<string> {
    console.log('Searching for image for: ' + productName);
    try {
        const response = await fetch(`http://localhost:3000/api/image-search?query=${encodeURIComponent(productName)}`);
        const data = await response.json();
        if (data.imageUrl) {
            return data.imageUrl;
        }
    } catch (e) {
        console.error('Error fetching image for ' + productName + ':', e);
    }
    return 'https://source.unsplash.com/400x400/?' + encodeURIComponent(productName);
}

async function main() {
    console.log('Starting database seed...\n');

    const parsedProducts = parseProductData(rawProductData);
    const productsToCreate = parsedProducts.slice(0, 150);

    const categoryMap = new Map<string, string>();

    for (const product of productsToCreate) {
        const categoryNames = product.categories.split('>').map(c => c.trim());
        let parentId: string | undefined;

        for (const categoryName of categoryNames) {
            const categorySlug = slugify(categoryName);
            let category = await prisma.category.findUnique({
                where: { slug: categorySlug },
            });
            if (!category) {
                console.log('Creating category: ' + categoryName);
                category = await prisma.category.create({
                    data: {
                        name: categoryName,
                        slug: categorySlug,
                        parentId: parentId,
                    },
                });
            }
            categoryMap.set(categorySlug, category.id);
            parentId = category.id;
        }
    }

    console.log('Categories created\n');

    console.log('Creating products...');
    for (const product of productsToCreate) {
        const productSlug = slugify(product.name);
        const existingProduct = await prisma.product.findUnique({
            where: { slug: productSlug },
        });

        if (existingProduct) {
            console.log('Skipping existing product: ' + product.name);
            continue;
        }

        const categoryNames = product.categories.split('>').map(c => c.trim());
        const lastCategoryName = categoryNames[categoryNames.length - 1];
        const categorySlug = slugify(lastCategoryName);
        const categoryId = categoryMap.get(categorySlug);

        if (!categoryId) {
            console.warn('Could not find category for product: ' + product.name);
            continue;
        }

        const imageUrl = await findImageUrl(product.name);

        await prisma.product.create({
            data: {
                name: product.name,
                slug: productSlug,
                price: product.salePrice || product.regularPrice,
                originalPrice: product.regularPrice,
                stock: product.stock,
                unit: product.unit,
                categoryId: categoryId,
                images: [imageUrl],
            }
        });
    }

    console.log('Products created\n');
    console.log('Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
