# How to Get MongoDB Connection String and Deploy to Vercel

## Step 1: Get MongoDB Connection String (MongoDB Atlas - FREE)

### Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google/GitHub or email

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Choose "M0 FREE" tier (512MB storage, perfect for starting)
   - Choose your preferred region (closest to your users)
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create Database User**
   - Click "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `admin` (or your choice)
   - Password: Click "Autogenerate Secure Password" and **SAVE IT**
   - Database User Privileges: "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Click "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Vercel)
   - This adds `0.0.0.0/0` (necessary for serverless)
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" (left sidebar)
   - Click "Connect" button on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string, looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Replace Placeholders**
   - Replace `<username>` with your database username
   - Replace `<password>` with your actual password (from step 3)
   - Add database name after `.net/`: 
   ```
   mongodb+srv://admin:YourPassword123@cluster0.xxxxx.mongodb.net/grocerymart?retryWrites=true&w=majority
   ```

   **Final format:**
   ```
   mongodb+srv://admin:MySecurePassword@cluster0.abc123.mongodb.net/grocerymart?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Website (Easiest)

1. **Sign up/Login to Vercel**
   - Go to: https://vercel.com
   - Click "Sign Up" 
   - Choose "Continue with GitHub"
   - Authorize Vercel to access your repositories

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Find `Uglycrown/ShreeGrocerymart` in the list
   - Click "Import"

3. **Configure Project**
   - **Project Name**: `shreegrocerymart` (or your choice)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

4. **Add Environment Variables** (IMPORTANT!)
   Click "Environment Variables" and add these one by one:

   | Name | Value | Example |
   |------|-------|---------|
   | `DATABASE_URL` | Your MongoDB connection string | `mongodb+srv://admin:pass@cluster0.abc.mongodb.net/grocerymart` |
   | `MONGODB_URI` | Same as DATABASE_URL | `mongodb+srv://admin:pass@cluster0.abc.mongodb.net/grocerymart` |
   | `NEXTAUTH_SECRET` | Random 32-character string | Generate below ⬇️ |
   | `NEXTAUTH_URL` | Leave empty for now | Will add after deployment |
   | `MSG91_AUTH_KEY` | Your MSG91 key (if you have) | `your_msg91_auth_key` |
   | `MSG91_TEMPLATE_ID` | Your MSG91 template ID | `your_template_id` |

   **To generate NEXTAUTH_SECRET:**
   - Use this online tool: https://generate-secret.vercel.app/32
   - Or on your computer run: 
     ```bash
     openssl rand -base64 32
     ```
   - Example: `dj3h5k2l4m6n7p8q9r0s1t2u3v4w5x6y`

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll see "Congratulations! 🎉"
   - Copy your deployment URL: `https://shreegrocerymart.vercel.app`

6. **Add NEXTAUTH_URL**
   - Go to Project Settings → Environment Variables
   - Add new variable:
     - Name: `NEXTAUTH_URL`
     - Value: `https://shreegrocerymart.vercel.app` (your actual URL)
   - Click "Save"
   - Go to Deployments → Click "..." → "Redeploy"

---

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```
   - Enter your email
   - Confirm in your email inbox

3. **Navigate to Project**
   ```bash
   cd C:\Users\Goura\OneDrive\Desktop\blinkit
   ```

4. **Create `.env.production` file**
   ```bash
   notepad .env.production
   ```
   
   Add:
   ```env
   DATABASE_URL=mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/grocerymart
   MONGODB_URI=mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/grocerymart
   NEXTAUTH_SECRET=your_generated_32_char_string
   NEXTAUTH_URL=https://your-domain.vercel.app
   MSG91_AUTH_KEY=your_msg91_key
   MSG91_TEMPLATE_ID=your_template_id
   ```

5. **Deploy**
   ```bash
   vercel
   ```
   - Follow prompts
   - Vercel will upload and deploy your app

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Step 3: Seed Your Database (Optional but Recommended)

After deployment, you need to add products and categories to your database.

### Option 1: Use the seed script from local

1. **Update your local .env with MongoDB Atlas connection**
   ```env
   DATABASE_URL=mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/grocerymart
   ```

2. **Run seed script**
   ```bash
   npm run seed
   ```

### Option 2: Use MongoDB Compass (GUI Tool)

1. **Download MongoDB Compass**: https://www.mongodb.com/products/compass
2. **Connect** with your connection string
3. **Create Collections**: `Product`, `Category`, `Order`
4. **Import sample data** (JSON files)

### Option 3: Use Admin Panel

1. Go to your deployed site: `https://shreegrocerymart.vercel.app/admin`
2. Add categories and products manually through the UI

---

## Step 4: Verify Everything Works

1. **Visit your site**: `https://shreegrocerymart.vercel.app`
2. **Test features**:
   - ✅ Home page loads
   - ✅ Products display
   - ✅ Add to cart works
   - ✅ Search works
   - ✅ Checkout process
   - ✅ Admin panel accessible

3. **Check Logs** (if issues):
   - Vercel Dashboard → Your Project → "View Function Logs"
   - Look for errors

---

## Common Issues & Solutions

### ❌ "Failed to connect to database"
**Solution:**
- Check MongoDB connection string is correct
- Ensure IP whitelist includes `0.0.0.0/0` in MongoDB Atlas
- Verify database user has correct permissions

### ❌ "MongoServerError: bad auth"
**Solution:**
- Password in connection string is wrong
- Recreate database user with new password
- Remember to URL-encode special characters in password

### ❌ "Build failed"
**Solution:**
- Check build logs in Vercel
- Usually missing environment variables
- Add all required env vars and redeploy

### ❌ API routes return 500 errors
**Solution:**
- Check function logs in Vercel dashboard
- Ensure all environment variables are set
- Verify MongoDB connection string

### ❌ Images not loading
**Solution:**
- Use absolute URLs for images
- Or use Vercel's built-in image optimization
- Or use Cloudinary/S3 for image hosting

---

## Environment Variables Checklist

Make sure you have these in Vercel:

- [x] `DATABASE_URL` - MongoDB connection string
- [x] `MONGODB_URI` - Same as DATABASE_URL
- [x] `NEXTAUTH_SECRET` - Random 32-char string
- [x] `NEXTAUTH_URL` - Your Vercel deployment URL
- [x] `MSG91_AUTH_KEY` - For SMS OTP (optional for testing)
- [x] `MSG91_TEMPLATE_ID` - For SMS OTP (optional for testing)

---

## Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your domain (e.g., shreegrocerymart.com)
   - Update DNS records as instructed
   - Update `NEXTAUTH_URL` to new domain

2. **Set up Analytics**
   - Vercel Analytics (built-in)
   - Google Analytics
   - Monitoring tools

3. **Regular Backups**
   - MongoDB Atlas has automatic backups (free tier)
   - Export data weekly

4. **Monitor Performance**
   - Check Vercel dashboard for metrics
   - Monitor function execution times
   - Watch for errors in logs

---

## Quick Reference: Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://admin:MyPass123@cluster0.abc12.mongodb.net/grocerymart?retryWrites=true&w=majority
```

**Parts:**
- `admin` = Database username
- `MyPass123` = Database password
- `cluster0.abc12.mongodb.net` = Your cluster address
- `grocerymart` = Database name

---

## Cost: FREE! 🎉

- **Vercel**: Free tier (100GB bandwidth/month)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Total**: $0/month for starting

You can scale up when needed!

---

## Need Help?

If you face any issues:
1. Check Vercel deployment logs
2. Check function logs in Vercel dashboard
3. Verify all environment variables are set
4. Check MongoDB Atlas network access settings

**Your site will be live at**: `https://shreegrocerymart.vercel.app` ✨
