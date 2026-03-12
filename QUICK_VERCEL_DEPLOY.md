# 🚀 Quick Vercel Deployment

## **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

## **Step 2: Login to Vercel**
```bash
vercel login
```

## **Step 3: Deploy**
```bash
vercel --prod
```

## **Step 4: Add Environment Variables**
In Vercel dashboard, add:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bit_cms
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
CORS_ORIGIN=https://your-app-name.vercel.app
```

## **Step 5: Setup MongoDB**
1. Go to https://www.mongodb.com/atlas
2. Create free cluster
3. Add database user
4. Allow access from anywhere (0.0.0.0/0)
5. Get connection string

## **Step 6: Test Your App**
Visit: https://your-app-name.vercel.app
Login: Admin.bit / Bitadmin@1122

**🎉 Your BIT CMS is now live!**
