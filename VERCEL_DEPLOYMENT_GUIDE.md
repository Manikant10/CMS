# 🚀 BIT CMS Vercel Deployment Guide

## 📋 **Quick Deployment to Vercel**

Deploy your BIT CMS to Vercel in just a few steps!

---

## 🎯 **Prerequisites**

### **Required Accounts**
- ✅ **Vercel Account** - Sign up at https://vercel.com
- ✅ **GitHub Account** - For code hosting
- ✅ **MongoDB Atlas** - For database (free tier available)

### **Required Tools**
- ✅ **Git** - For version control
- ✅ **Node.js 18+** - For local development
- ✅ **Vercel CLI** - For deployment (optional)

---

## 🗄️ **Step 1: Setup MongoDB Atlas**

### **Create MongoDB Account**
1. Go to https://www.mongodb.com/atlas
2. Sign up for free account
3. Create new organization and project

### **Create Free Cluster**
1. Click "Build a Database"
2. Select **M0 Sandbox** (Free)
3. Choose cloud provider and region (closest to your users)
4. Click "Create Cluster"

### **Configure Database**
1. Wait for cluster creation (2-5 minutes)
2. Go to **Database Access** → **Add New Database User**
3. Create user with strong password
4. Go to **Network Access** → **Add IP Address**
5. Select **Allow Access from Anywhere** (0.0.0.0/0)
6. Click **Confirm**

### **Get Connection String**
1. Go to **Database** → **Connect**
2. Select **Connect your application**
3. Choose **Node.js** and version **4.1 or later**
4. Copy the connection string
5. Replace `<password>` with your database user password

---

## 📦 **Step 2: Prepare Your Code**

### **Update Environment Variables**
Create `.env.local` in root directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bit_cms
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
CORS_ORIGIN=https://your-app-name.vercel.app
```

### **Update API Base URL**
In `client/web/src/context/AuthContext.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app/api' 
  : 'http://localhost:5000/api';
```

### **Push to GitHub**
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - BIT CMS ready for deployment"

# Create GitHub repository
git branch -M main
git remote add origin https://github.com/yourusername/bit-cms.git
git push -u origin main
```

---

## 🚀 **Step 3: Deploy to Vercel**

### **Method 1: Vercel Dashboard (Easiest)**

#### **1. Import Project**
1. Go to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Connect your **GitHub** account
4. Select your **bit-cms** repository
5. Click **Import**

#### **2. Configure Project**
```
Framework Preset: Other
Root Directory: ./
Build Command: cd client/web && npm run build
Output Directory: client/web/build
Install Command: npm install
```

#### **3. Add Environment Variables**
In Vercel project settings:
```
MONGODB_URI: mongodb+srv://username:password@cluster.mongodb.net/bit_cms
JWT_SECRET: your-super-secret-jwt-key-change-this
NODE_ENV: production
CORS_ORIGIN: https://your-app-name.vercel.app
```

#### **4. Deploy**
1. Click **Deploy**
2. Wait for deployment (2-3 minutes)
3. Your app is live at `https://your-app-name.vercel.app`

### **Method 2: Vercel CLI (Advanced)**

#### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

#### **2. Login to Vercel**
```bash
vercel login
```

#### **3. Deploy**
```bash
# From root directory
vercel --prod

# Follow prompts to link to your Vercel account
# Select your team and project settings
# Add environment variables when prompted
```

---

## 🔧 **Step 4: Configure Vercel Settings**

### **Environment Variables**
Go to your Vercel project → **Settings** → **Environment Variables**:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bit_cms
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
CORS_ORIGIN=https://your-app-name.vercel.app
```

### **Domain Settings (Optional)**
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records
4. Wait for SSL certificate

---

## 🧪 **Step 5: Test Your Deployment**

### **Check Frontend**
1. Visit `https://your-app-name.vercel.app`
2. Should see BIT CMS login page
3. Test admin login: `Admin.bit / Bitadmin@1122`

### **Check Backend API**
1. Visit `https://your-app-name.vercel.app/api/health`
2. Should return: `{"success": true, "message": "Server is running"}`

### **Test Database Connection**
1. Try logging in as admin
2. Should work if MongoDB is properly configured

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Database Connection Error**
```
Error: Could not connect to MongoDB
```
**Solution:**
1. Check MongoDB URI is correct
2. Verify database user permissions
3. Ensure IP access is set to 0.0.0.0/0
4. Check password in connection string

### **Issue 2: CORS Errors**
```
Error: CORS policy: No 'Access-Control-Allow-Origin'
```
**Solution:**
1. Update CORS_ORIGIN environment variable
2. Use exact Vercel URL
3. Redeploy after changing

### **Issue 3: Build Fails**
```
Error: Build failed
```
**Solution:**
1. Check package.json scripts
2. Ensure all dependencies are installed
3. Verify build command is correct

### **Issue 4: Socket.IO Connection Issues**
```
Error: Socket.IO connection failed
```
**Solution:**
1. Socket.IO works with HTTP, not HTTPS in some cases
2. Update client connection URL
3. Check server configuration

---

## 🔄 **Step 6: Update Client Configuration**

### **Update API URLs**
In `client/web/src/context/AuthContext.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app/api' 
  : 'http://localhost:5000/api';
```

### **Update Socket.IO Connection**
In `client/web/src/Students.js`, `AdminDashboard.js`, etc.:
```javascript
const socket = io(process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app' 
  : 'http://localhost:5000');
```

---

## 📊 **Step 7: Monitor Deployment**

### **Vercel Dashboard**
- Check deployment logs
- Monitor performance metrics
- View error logs
- Track visitor analytics

### **MongoDB Atlas**
- Monitor database performance
- Check connection statistics
- View query performance
- Set up alerts

---

## 🎯 **Production Checklist**

### **Security**
- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure MongoDB properly
- [ ] Remove development data

### **Performance**
- [ ] Optimize images and assets
- [ ] Enable caching headers
- [ ] Monitor database queries
- [ ] Check bundle size

### **Functionality**
- [ ] Test all user roles
- [ ] Verify file uploads work
- [ ] Check real-time features
- [ ] Test fee management
- [ ] Verify timetable system

---

## 🚀 **Deployment Commands**

### **Quick Deploy**
```bash
# Using Vercel CLI
vercel --prod

# Using Git (after pushing to GitHub)
# Automatic deployment triggered
```

### **Redeploy After Changes**
```bash
# Push changes to GitHub
git add .
git commit -m "Update for production"
git push origin main

# Or use CLI
vercel --prod
```

### **Check Deployment Status**
```bash
vercel ls
vercel inspect
```

---

## 📱 **Mobile App Deployment**

### **PWA Features**
Your BIT CMS includes PWA features:
- ✅ Installable on mobile devices
- ✅ Works offline
- ✅ Push notifications ready
- ✅ App-like experience

### **Test PWA**
1. Open app on mobile browser
2. Look for "Add to Home Screen" prompt
3. Install as PWA
4. Test offline functionality

---

## 💰 **Cost Breakdown**

### **Free Tier Usage**
- **Vercel**: $0/month (Hobby tier)
  - 100GB bandwidth/month
  - Unlimited deployments
  - SSL certificates
  - Custom domains

- **MongoDB Atlas**: $0/month (M0 cluster)
  - 512MB storage
  - 100MB network transfer
  - Shared RAM
  - 3 replicas

### **Total Cost**: $0/month for basic usage!

---

## 🎉 **Success!**

### **Your BIT CMS is Now Live!**

#### **Access Information**
- **Frontend**: https://your-app-name.vercel.app
- **Backend API**: https://your-app-name.vercel.app/api
- **Admin Login**: Admin.bit / Bitadmin@1122

#### **Features Available**
- ✅ User authentication
- ✅ Student/Faculty management
- ✅ Course management
- ✅ Timetable system
- ✅ Fee tracking
- ✅ Real-time updates
- ✅ Mobile PWA
- ✅ File uploads

#### **Next Steps**
1. **Change default passwords**
2. **Add real student/faculty data**
3. **Configure custom domain**
4. **Set up monitoring**
5. **Test all features**

---

## 🆘 **Need Help?**

### **Vercel Documentation**
- https://vercel.com/docs

### **MongoDB Atlas Documentation**
- https://docs.mongodb.com/atlas

### **BIT CMS Support**
- Check deployment logs
- Review error messages
- Test API endpoints
- Verify configuration

---

**🚀 Your BIT CMS is now deployed on Vercel and ready for production use! Follow this guide step by step for a successful deployment.**
