# Blinkit Clone - Quick Commerce E-commerce Platform

A full-featured e-commerce platform similar to Blinkit with a powerful CMS for managing products, categories, and banners.

## 🚀 Features

### Customer-Facing Features
- ✅ **Fast Product Discovery** - Browse by categories with instant search
- ✅ **Smart Shopping Cart** - Real-time cart updates with persistent storage
- ✅ **Product Cards** - Beautiful product displays with images, prices, and discounts
- ✅ **Category Navigation** - Organized product categories
- ✅ **Delivery Time Display** - Show estimated delivery times
- ✅ **Price Comparison** - Original vs. sale prices with discount percentages
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Banner System** - Hero and promotional banners

### Admin CMS Features
- ✅ **Product Management** - Full CRUD operations for products
  - Add products with multiple images
  - Set prices, stock, and delivery times
  - Organize with categories and tags
  - Toggle active/featured status
  - Real-time inventory management

- ✅ **Category Management** - Create and organize product categories
  - Hierarchical categories (parent/subcategories)
  - Custom icons and images
  - Display order control

- ✅ **Banner Management** - Promotional content management
  - Hero banners for homepage
  - Category-specific banners
  - CTA buttons and links

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Prisma ORM
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (ready to configure)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Database**
   ```bash
   # Copy environment template
   copy .env.example .env

   # Edit .env and add your MongoDB connection string
   DATABASE_URL="mongodb://localhost:27017/blinkit"
   ```

3. **Initialize Database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin

## 📝 Usage Guide

### Adding Your First Products

1. **Navigate to Admin Dashboard**
   - Go to `http://localhost:3000/admin`

2. **Create Categories First**
   - Click on "Categories" tab
   - Add categories like "Dairy & Eggs", "Fruits & Vegetables", etc.
   - Optionally add category images/icons

3. **Add Products**
   - Go to "Products" tab
   - Click "Add Product"
   - Fill in product details:
     - Name, description
     - Select category
     - Set price and original price (for discounts)
     - Add product images (URLs)
     - Set stock quantity
     - Add tags for searchability
     - Toggle featured/active status

4. **Create Banners** (Optional)
   - Go to "Banners" tab
   - Create hero banners for homepage
   - Create category-specific promotional banners

### Managing Products

**Update Stock**: Edit product and change stock quantity
**Add Discount**: Set original price higher than current price
**Feature Products**: Toggle "Featured" to show on homepage
**Organize**: Use tags and categories for better organization

## 🗂️ Project Structure

```
blinkit/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   │   ├── products/       # Product endpoints
│   │   ├── categories/     # Category endpoints
│   │   └── banners/        # Banner endpoints
│   ├── category/           # Category pages
│   ├── search/             # Search functionality
│   ├── layout.tsx          # Root layout with header
│   └── page.tsx            # Homepage
├── components/
│   ├── admin/              # Admin components
│   │   └── ProductForm.tsx # Product creation/editing form
│   ├── cart/               # Shopping cart
│   │   └── CartSidebar.tsx # Sliding cart panel
│   ├── products/           # Product components
│   │   └── ProductCard.tsx # Product display card
│   └── Header.tsx          # Main navigation header
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── store.ts            # Zustand cart store
│   └── utils.ts            # Utility functions
├── prisma/
│   └── schema.prisma       # Database schema
└── package.json
```

## 🗄️ Database Schema

### Models
- **User** - Customer accounts with phone auth
- **Address** - Multiple delivery addresses per user
- **Category** - Hierarchical product categories
- **Product** - Product catalog with images and pricing
- **Cart** - Shopping cart with items
- **Order** - Order management with status tracking
- **Banner** - Promotional banners

## 🎨 Customization

### Branding
- Update colors in `tailwind.config.js`
- Change logo in `components/Header.tsx`
- Modify banner styles in homepage

### Features to Add
- [ ] User authentication (phone/email)
- [ ] Order placement and tracking
- [ ] Payment gateway integration
- [ ] Search functionality
- [ ] Product filters and sorting
- [ ] Reviews and ratings
- [ ] Wishlist
- [ ] Location-based delivery
- [ ] Admin analytics dashboard

## 🔐 Security Notes

**For Production:**
1. Add authentication to admin routes
2. Validate all API inputs
3. Use environment variables for secrets
4. Enable CORS properly
5. Add rate limiting
6. Secure image uploads
7. Use HTTPS

## 📱 API Endpoints

### Products
- `GET /api/products` - List all products (with filters)
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category

### Banners
- `GET /api/banners` - List all banners
- `POST /api/banners` - Create banner

## 🤝 Contributing

This is a starter template. Feel free to:
- Add more features
- Improve the UI/UX
- Fix bugs
- Optimize performance

## 📄 License

MIT License - Feel free to use this for your projects!

## 🙏 Acknowledgments

Inspired by Blinkit (formerly Grofers) - India's quick commerce platform.

---

**Happy Building! 🚀**

For questions or issues, please check the code comments or create an issue.
