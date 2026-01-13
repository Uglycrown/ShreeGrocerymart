const https = require('https');
const fs = require('fs');
const path = require('path');

const categories = [
    { name: 'Dairy Products', image: 'https://media.istockphoto.com/id/177373090/photo/assortment-of-dairy-products.jpg?s=612x612&w=0&k=20&c=p-SUa23hlydYwIs2BFlz-i1g9I3a-sxF93v9Kx36izM=' },
    { name: 'Cold Drink', image: 'https://media.istockphoto.com/id/1288385045/photo/glass-of-cola-with-ice.jpg?s=612x612&w=0&k=20&c=wH2oA0i_pmVp1z-a2r2v-2Y-5i4e-YJqJ9c2Wve0k2A=' },
    { name: 'Confectionary', image: 'https://media.istockphoto.com/id/1162464949/photo/colorful-sweet-gummy-candy-lollipops.jpg?s=612x612&w=0&k=20&c_n=yq_wA_yJ-1n7_y-w-4p-7q-y-q-y-w-q-y-q-y=' },
    { name: 'Snacks', image: 'https://media.istockphoto.com/id/1183244243/photo/assortment-of-unhealthy-snacks.jpg?s=612x612&w=0&k=20&c=1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1=' },
    { name: 'Dry Fruits', image: 'https://media.istockphoto.com/id/1141305488/photo/various-nuts-and-dried-fruits.jpg?s=612x612&w=0&k=20&c=y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y=' },
    { name: 'Grocery', image: 'https://media.istockphoto.com/id/1287955848/photo/shopping-bag-with-fresh-vegetables-and-fruits.jpg?s=612x612&w=0&k=20&c_y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y=' },
    { name: 'Home Care', image: 'https://media.istockphoto.com/id/1289467646/photo/cleaning-products.jpg?s=612x612&w=0&k=20&c_w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w=' },
    { name: 'Personal Care', image: 'https://media.istockphoto.com/id/1282900009/photo/set-of-natural-cosmetics-for-face-and-body-care.jpg?s=612x612&w=0&k=20&c_y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y-y=' },
    { name: 'Kids', image: 'https://media.istockphoto.com/id/1291823123/photo/cute-little-girl-in-a-white-t-shirt-and-jeans.jpg?s=612x612&w=0&k=20&c_w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w=' },
    { name: 'Beauty Care', image: 'https://media.istockphoto.com/id/1289266183/photo/set-of-decorative-cosmetics-on-a-white-background.jpg?s=612x612&w=0&k=20&c_w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w=' },
    { name: 'Pooja Needs', image: 'https://media.istockphoto.com/id/1289467646/photo/diya-lamps-lit-during-diwali-celebration.jpg?s=612x612&w=0&k=20&c_w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w=' },
    { name: 'Stationary', image: 'https://media.istockphoto.com/id/1284241258/photo/office-supplies-on-a-white-background.jpg?s=612x612&w=0&k=20&c_w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w=' },
    { name: 'Bakery', image: 'https://media.istockphoto.com/id/1284241258/photo/assortment-of-pastries-and-bread.jpg?s=612x612&w=0&k=20&c_w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w=' },
    { name: 'Ice Cream', image: 'https://media.istockphoto.com/id/1284241258/photo/ice-cream-scoops-in-a-waffle-cone.jpg?s=612x612&w=0&k=20&c_w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w=' },
    { name: 'Gift', image: 'https://media.istockphoto.com/id/1284241258/photo/gift-box-with-a-red-ribbon.jpg?s=612x612&w=0&k=20&c_w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w=' }
];

const downloadDir = path.join(__dirname, '..', 'public', 'categories');

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .on('close', () => resolve(filepath));
            } else {
                // Handle redirects
                if (res.statusCode === 302 || res.statusCode === 301) {
                    downloadImage(res.headers.location, filepath)
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
                }
            }
        }).on('error', reject);
    });
}

async function downloadAll() {
    for (const category of categories) {
        const slug = category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
        const filepath = path.join(downloadDir, `${slug}.jpg`);
        try {
            await downloadImage(category.image, filepath);
            console.log(`Downloaded ${filepath}`);
        } catch (error) {
            console.error(`Error downloading ${category.name}:`, error);
        }
    }
}

downloadAll();