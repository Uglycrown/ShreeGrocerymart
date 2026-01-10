# Deployment Guide for ShreeGrocerymart

This guide will help you deploy your Blinkit-style grocery delivery website to production.

## 🚀 Recommended Hosting Options

### Option 1: Vercel (Recommended - Easiest)

**Best for:** Quick deployment, automatic builds, free tier available

#### Steps:

1. **Sign up at [Vercel](https://vercel.com)**
   - Use your GitHub account to sign in

2. **Import your repository**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose `Uglycrown/ShreeGrocerymart`

3. **Configure Environment Variables**
   Click "Environment Variables" and add:
   ```
   DATABASE_URL=your_mongodb_connection_string
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_random_secret_key
   NEXTAUTH_URL=https://your-domain.vercel.app
   MSG91_AUTH_KEY=your_msg91_key
   MSG91_TEMPLATE_ID=your_template_id
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://your-project.vercel.app`

#### Vercel Advantages:
- ✅ Free tier with good limits
- ✅ Automatic deployments on git push
- ✅ Built-in CDN and SSL
- ✅ Serverless functions work out of the box
- ✅ Zero configuration needed

---

### Option 2: MongoDB Atlas + Vercel

**For Production Database**

1. **Set up MongoDB Atlas (Free Tier)**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster (512MB storage)
   - Click "Connect" → "Connect your application"
   - Copy connection string

2. **Add to Vercel Environment Variables**
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/grocerymart
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grocerymart
   ```

---

### Option 3: Netlify

**Alternative to Vercel**

1. **Sign up at [Netlify](https://www.netlify.com)**

2. **Connect GitHub Repository**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repo

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Add environment variables (same as Vercel)

4. **Deploy**

---

### Option 4: Railway

**Good for apps needing databases**

1. **Sign up at [Railway](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add MongoDB**
   - Click "New" → "Database" → "MongoDB"
   - Railway will provide connection string automatically

4. **Configure Environment Variables**
   - Add all required env vars
   - Railway auto-detects Next.js and configures build

5. **Deploy**

---

### Option 5: Self-Hosting (VPS)

**For full control - DigitalOcean, AWS EC2, Linode, etc.**

#### Requirements:
- Ubuntu 20.04+ VPS
- Node.js 18+
- MongoDB
- PM2 for process management

#### Steps:

1. **Set up VPS and install dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone and setup project**
   ```bash
   cd /var/www
   git clone https://github.com/Uglycrown/ShreeGrocerymart.git
   cd ShreeGrocerymart
   npm install
   ```

3. **Create .env file**
   ```bash
   nano .env
   ```
   Add:
   ```
   DATABASE_URL=mongodb://localhost:27017/grocerymart
   MONGODB_URI=mongodb://localhost:27017/grocerymart
   NEXTAUTH_SECRET=your_secret_here
   NEXTAUTH_URL=https://yourdomain.com
   MSG91_AUTH_KEY=your_key
   MSG91_TEMPLATE_ID=your_template
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Start with PM2**
   ```bash
   pm2 start npm --name "grocerymart" -- start
   pm2 save
   pm2 startup
   ```

6. **Set up Nginx as reverse proxy**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/grocerymart
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable:
   ```bash
   sudo ln -s /etc/nginx/sites-available/grocerymart /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] MongoDB database is set up (Atlas or self-hosted)
- [ ] All environment variables are configured
- [ ] MSG91 account is set up for OTP
- [ ] Test the application locally with production build
- [ ] Update NEXTAUTH_URL to your production domain
- [ ] Configure MongoDB replica set if using change streams
- [ ] Set up proper error tracking (optional: Sentry)

---

## 🔐 Environment Variables Required

```bash
# Database
DATABASE_URL=your_mongodb_connection_string
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=generate_random_32_char_string
NEXTAUTH_URL=https://yourdomain.com

# SMS/OTP (MSG91)
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_msg91_template_id

# Optional
NODE_ENV=production
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## 🌐 Custom Domain Setup

### For Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### For VPS:
1. Point A record to your VPS IP
2. Configure Nginx (see above)
3. Set up SSL with Certbot

---

## 📊 Recommended Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Vercel** | Hosting | Yes (100GB bandwidth) |
| **MongoDB Atlas** | Database | Yes (512MB) |
| **Cloudinary** | Image hosting | Yes (25GB/month) |
| **MSG91** | SMS/OTP | Pay-as-you-go |
| **Sentry** | Error tracking | Yes (5K errors) |

---

## 🚦 Testing Production Build Locally

Before deploying, test locally:

```bash
npm run build
npm start
```

Visit `http://localhost:3000` and test all features.

---

## 📈 Post-Deployment

1. **Monitor Performance**
   - Set up Vercel Analytics (built-in)
   - Or use Google Analytics

2. **Set up Backups**
   - MongoDB Atlas has automatic backups
   - Export data regularly

3. **Update Dependencies**
   ```bash
   npm update
   git add package*.json
   git commit -m "Update dependencies"
   git push
   ```

4. **Monitor Logs**
   - Vercel: Check deployment logs
   - VPS: `pm2 logs grocerymart`

---

## 🆘 Troubleshooting

### Build Fails
- Check Node.js version (need 18+)
- Verify all dependencies installed
- Check for TypeScript errors

### Database Connection Issues
- Verify MongoDB connection string
- Check IP whitelist (MongoDB Atlas)
- Ensure database user has proper permissions

### API Routes Not Working
- Check serverless function limits
- Verify environment variables are set
- Check API route logs

---

## 💰 Cost Estimation

### Free Tier (Recommended for Starting)
- Vercel: Free
- MongoDB Atlas: Free (512MB)
- Total: **$0/month**

### Paid (Growing Business)
- Vercel Pro: $20/month
- MongoDB Atlas M10: $57/month
- Cloudinary: $89/month (optional)
- Total: **~$77-166/month**

### VPS Option
- DigitalOcean Droplet: $6-12/month
- Domain: $10/year
- Total: **~$6-12/month** (but requires management)

---

## 🎯 Recommended: Start with Vercel + MongoDB Atlas (Free)

This gives you:
- Automatic deployments
- No server management
- Scalability built-in
- Free SSL certificate
- Global CDN
- Can upgrade later when needed

**Ready to deploy? Start with Vercel!** 🚀
