# 🚀 BIT CMS Heroku Deployment Guide

## 🎯 **Deploy to Heroku in 5 Minutes**

---

## 📋 **Prerequisites**

### **Required Accounts**
- ✅ **Heroku Account** - Sign up at https://signup.heroku.com
- ✅ **GitHub Account** - For code hosting
- ✅ **MongoDB Atlas** - For database (free tier)

### **Required Tools**
- ✅ **Git** - For version control
- ✅ **Heroku CLI** - For deployment
- ✅ **Node.js 18+** - For local development

---

## 🚀 **Quick Deployment Steps**

### **Step 1: Install Heroku CLI**
```bash
# Windows
npm install -g heroku

# Mac
brew tap heroku/brew && brew install heroku

# Linux
sudo snap install heroku --classic
```

### **Step 2: Login to Heroku**
```bash
heroku login
# This will open browser for authentication
```

### **Step 3: Create Heroku App**
```bash
heroku create bit-cms
# This creates: https://bit-cms.herokuapp.com
```

### **Step 4: Add MongoDB Atlas**
```bash
# Option 1: Use MongoDB Atlas (Recommended)
# Go to https://www.mongodb.com/atlas
# Create free cluster and get connection string

# Option 2: Use Heroku MongoDB Add-on
heroku addons:create mongolab:sandbox
```

### **Step 5: Configure Environment Variables**
```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bit_cms
heroku config:set CORS_ORIGIN=https://bit-cms.herokuapp.com
```

### **Step 6: Deploy to Heroku**
```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/bit-cms.git

# Deploy
git push heroku main
```

### **Step 7: Open Your App**
```bash
heroku open
# This opens https://bit-cms.herokuapp.com
```

---

## 🔧 **Detailed Setup**

### **MongoDB Atlas Setup**

#### **1. Create MongoDB Account**
1. Go to https://www.mongodb.com/atlas
2. Sign up for free account
3. Create new organization and project

#### **2. Create Free Cluster**
1. Click "Build a Database"
2. Select **M0 Sandbox** (Free)
3. Choose cloud provider and region
4. Click "Create Cluster"

#### **3. Configure Database**
1. Go to **Database Access** → **Add New Database User**
2. Create user with strong password
3. Go to **Network Access** → **Add IP Address**
4. Select **Allow Access from Anywhere** (0.0.0.0/0)

#### **4. Get Connection String**
1. Go to **Database** → **Connect**
2. Select **Connect your application**
3. Choose **Node.js** and version **4.1 or later**
4. Copy the connection string

### **Heroku Configuration**

#### **Environment Variables**
```bash
# Set all required variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bit_cms
heroku config:set CORS_ORIGIN=https://bit-cms.herokuapp.com
```

#### **Check Configuration**
```bash
# View all config variables
heroku config

# View specific variable
heroku config:get MONGODB_URI
```

---

## 📦 **Files Already Prepared**

### **Procfile** (Already exists)
```
web: cd server && npm start
```

### **Environment Templates**
- `.env.heroku` - Heroku environment template
- `.env.production` - Production environment template

### **Package.json Scripts**
```json
{
  "scripts": {
    "start": "node server/production.js",
    "heroku-postbuild": "cd client/web && npm install && npm run build"
  }
}
```

---

## 🧪 **Testing Your Deployment**

### **Check Application Status**
```bash
# Check logs
heroku logs --tail

# Check dyno status
heroku ps

# Restart app
heroku restart
```

### **Test Functionality**
1. **Frontend**: https://bit-cms.herokuapp.com
2. **Backend**: https://bit-cms.herokuapp.com/api/health
3. **Login**: Admin.bit / Bitadmin@1122

### **Common Tests**
- ✅ User authentication
- ✅ Dashboard navigation
- ✅ API endpoints
- ✅ Real-time features
- ✅ File uploads

---

## 🔄 **Updates and Maintenance**

### **Deploy New Changes**
```bash
# Commit changes
git add .
git commit -m "Update features"
git push origin main

# Deploy to Heroku
git push heroku main
```

### **Scale Application**
```bash
# Scale dynos (paid plans)
heroku ps:scale web=1

# Check dyno types
heroku ps
```

### **Database Management**
```bash
# Backup database (if using Heroku MongoDB)
heroku pg:backups:capture

# Restore database
heroku pg:backups:restore
```

---

## 💰 **Cost Breakdown**

### **Free Tier Usage**
- **Heroku**: $0/month (Free tier)
  - 550 hours/month
  - 1x web dyno
  - Sleeps after 30 minutes inactivity
  - Auto-resumes on request

- **MongoDB Atlas**: $0/month (M0 cluster)
  - 512MB storage
  - 100MB network transfer
  - Shared RAM
  - 3 replicas

### **Paid Options**
- **Heroku Hobby**: $7/month
  - 24/7 uptime
  - No sleep
  - Custom domains
  - SSL certificates

- **Heroku Standard**: $25/month
  - Better performance
  - More dynos
  - Advanced features

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Application Error (H10)**
```
Error: Cannot find module 'express'
```
**Solution:**
```bash
# Check package.json
cat package.json

# Rebuild dependencies
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set NODE_ENV=production
git push heroku main
```

#### **Database Connection Error**
```
Error: Could not connect to MongoDB
```
**Solution:**
1. Check MONGODB_URI is correct
2. Verify MongoDB cluster is running
3. Ensure IP access is set to 0.0.0.0/0
4. Check database user permissions

#### **CORS Error**
```
Error: CORS policy: No 'Access-Control-Allow-Origin'
```
**Solution:**
```bash
# Update CORS_ORIGIN
heroku config:set CORS_ORIGIN=https://bit-cms.herokuapp.com
heroku restart
```

#### **Build Failed**
```
Error: Build failed
```
**Solution:**
```bash
# Check build logs
heroku logs --tail --dyno web

# Fix package.json scripts
# Ensure build script exists
git push heroku main
```

### **Debug Commands**
```bash
# View logs
heroku logs --tail

# View recent logs
heroku logs -n 100

# Check configuration
heroku config

# Restart app
heroku restart

# Scale dynos
heroku ps:scale web=1

# Open app
heroku open
```

---

## 🎯 **Production Checklist**

### **Security**
- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (automatic on Heroku)
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

### **Monitoring**
- [ ] Set up logging
- [ ] Monitor performance
- [ ] Check error rates
- [ ] Set up alerts

---

## 📱 **Mobile App**

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

## 🎉 **Success!**

### **Your BIT CMS is Live on Heroku!**

#### **Access Information**
- **Frontend**: https://bit-cms.herokuapp.com
- **Backend API**: https://bit-cms.herokuapp.com/api
- **Admin Login**: Admin.bit / Bitadmin@1122

#### **Features Available**
- ✅ Complete user management
- ✅ Student/Faculty dashboards
- ✅ Course and timetable management
- ✅ Fee tracking system
- ✅ Real-time updates
- ✅ Mobile PWA support
- ✅ File uploads
- ✅ Admin approval system

#### **Next Steps**
1. **Change default passwords**
2. **Add real student/faculty data**
3. **Configure custom domain**
4. **Set up monitoring**
5. **Test all features**

---

## 🔄 **Maintenance**

### **Regular Tasks**
- **Daily**: Check app performance
- **Weekly**: Review logs and errors
- **Monthly**: Update dependencies
- **Quarterly**: Security updates

### **Scaling**
- **More users**: Upgrade to Hobby plan
- **More traffic**: Add more dynos
- **More storage**: Upgrade MongoDB
- **Better performance**: Use Standard dynos

---

## 🆘 **Support**

### **Heroku Documentation**
- https://devcenter.heroku.com

### **MongoDB Atlas Documentation**
- https://docs.mongodb.com/atlas

### **BIT CMS Support**
- Check Heroku logs
- Review error messages
- Test API endpoints
- Verify configuration

---

**🚀 Your BIT CMS is now live on Heroku! Follow this guide for a successful deployment.**
