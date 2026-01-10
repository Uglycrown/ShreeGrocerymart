# Quick Start Guide - Blinkit Clone

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install MongoDB (if not installed)

**Option A: Using Docker (Recommended)**
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: Download MongoDB**
Visit: https://www.mongodb.com/try/download/community
Install and run MongoDB service

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Setup Database
```powershell
# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB (creates collections)
npx prisma db push
```

### Step 4: Start Development Server
```powershell
npm run dev
```

### Step 5: Access Application
- **Homepage**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

---

## 📝 First Time Setup - Add Sample Data

### 1. Create Categories
Go to: http://localhost:3000/admin → Categories Tab

Add these categories:
- Dairy & Eggs (icon: 🥛)
- Fruits & Vegetables (icon: 🍎)
- Snacks & Munchies (icon: 🍿)
- Cold Drinks & Juices (icon: 🥤)
- Bakery & Biscuits (icon: 🍞)

### 2. Add Products
Go to: Products Tab → Click "Add Product"

Example Product 1:
- Name: Amul Gold Full Cream Milk
- Category: Dairy & Eggs
- Price: 35
- Original Price: 40
- Unit: 500 ml
- Stock: 100
- Image: https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400
- Tags: milk, dairy, amul
- Toggle: Active ✓, Featured ✓

Example Product 2:
- Name: Fresh Apple
- Category: Fruits & Vegetables
- Price: 120
- Unit: 1 kg
- Stock: 50
- Image: https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400
- Toggle: Active ✓

### 3. Create Banners (Optional)
Go to: Banners Tab

Hero Banner:
- Title: Stock up on daily essentials
- Subtitle: Get farm-fresh goodness delivered in 24 minutes
- Type: Hero
- CTA: Shop Now
- Image: https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200

---

## 🎨 Using Free Images

For product images, use these free resources:
- **Unsplash**: https://unsplash.com
- **Pexels**: https://pexels.com
- **Pixabay**: https://pixabay.com

Example search queries:
- "milk bottle"
- "fresh vegetables"
- "snacks food"
- "grocery products"

---

## 🛠️ Troubleshooting

### MongoDB Connection Error
**Problem**: Can't connect to MongoDB

**Solutions**:
1. Check if MongoDB is running: `docker ps` (if using Docker)
2. Verify DATABASE_URL in `.env` file
3. Try: `mongodb://127.0.0.1:27017/blinkit` instead of localhost

### Prisma Generate Error
**Problem**: Prisma client not generated

**Solution**:
```powershell
rm -Recurse -Force node_modules\.prisma
npx prisma generate
```

### Build Errors
**Problem**: TypeScript or build errors

**Solution**:
```powershell
npm install
npm run build
```

### Port Already in Use
**Problem**: Port 3000 is already in use

**Solution**:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

---

## 📱 Next Steps

1. ✅ **Add More Products**: Build your product catalog
2. ✅ **Customize Branding**: Update colors, logo, and text
3. ✅ **Test Shopping**: Add products to cart and test checkout flow
4. 🔜 **Add Authentication**: Implement user login
5. 🔜 **Payment Integration**: Add payment gateway
6. 🔜 **Deploy**: Deploy to Vercel or your hosting

---

## 🎯 Key Features to Try

### Customer Experience
1. Browse products by category
2. Add items to cart (click ADD button)
3. Adjust quantities (+ / - buttons)
4. View cart (click cart icon or floating button)
5. See real-time price calculations

### Admin Panel
1. Create/Edit products with images
2. Manage categories and organization
3. Control inventory and stock
4. Set featured products
5. Create promotional banners

---

## 📊 Sample Data Script

Want to quickly populate with sample data? Run this in your browser console at http://localhost:3000/admin:

```javascript
// Coming soon: seed script for sample data
```

---

## 🆘 Need Help?

1. Check README.md for detailed documentation
2. Review code comments in files
3. Check Prisma schema in `prisma/schema.prisma`
4. Look at API routes in `app/api/`

---

## 🎉 You're All Set!

Your Blinkit clone is ready. Start adding products and customizing!

**Happy Coding! 🚀**
