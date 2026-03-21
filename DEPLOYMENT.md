# BIT CMS - Separate Deployment Guide

## 🚀 Backend Deployment (Vercel)

### Step 1: Create Backend Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Root Directory**: Leave empty (use repository root)
5. **Framework Preset**: Other
6. **Build Command**: Leave empty
7. **Output Directory**: Leave empty

### Step 2: Configure Backend
1. Go to Project Settings → Environment Variables
2. Add these variables:
   ```
   MONGODB_URI=mongodb+srv://bitadmin_110:Mani110@cms.trgugqf.mongodb.net/test?retryWrites=true&w=majority
   JWT_SECRET=RVNc51HjGQYMIwBnEmHEU9yP2jpLsjtHq2qATgcl14J81LT2i5cH2AjTmx6
   NODE_ENV=production
   ```

### Step 3: Deploy Backend
1. Copy `vercel-backend.json` to `vercel.json`
2. Commit and push to GitHub
3. Vercel will auto-deploy
4. Note your backend URL: `https://your-backend-name.vercel.app`

---

## 🚀 Frontend Deployment (Vercel)

### Step 1: Create Frontend Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Root Directory**: `client/web`
5. **Framework Preset**: Create React App
6. **Build Command**: `npm run build`
7. **Output Directory**: `build`

### Step 2: Configure Frontend
1. Go to Project Settings → Environment Variables
2. Add backend URL:
   ```
   REACT_APP_API_URL=https://your-backend-name.vercel.app
   ```

### Step 3: Deploy Frontend
1. Copy `vercel-frontend.json` to `client/web/vercel.json`
2. Commit and push to GitHub
3. Vercel will auto-deploy
4. Note your frontend URL: `https://your-frontend-name.vercel.app`

---

## 📱 Testing

### Backend Test
```bash
curl https://your-backend-name.vercel.app/api/health
```

### Frontend Test
1. Open `https://your-frontend-name.vercel.app`
2. Login with: `bitadmin_110` / `Mani110`

---

## 🔧 Alternative: Backend on Other Platforms

### Option 1: Railway
1. Create Railway account
2. Deploy from GitHub
3. Set environment variables
4. Get Railway URL

### Option 2: Render
1. Create Render account
2. Deploy Web Service from GitHub
3. Set environment variables
4. Get Render URL

### Option 3: Heroku
1. Create Heroku account
2. Deploy from GitHub
3. Set Config Vars
4. Get Heroku URL

---

## 🎯 Benefits of Separate Deployment

✅ **Independent Scaling**: Scale frontend and backend separately
✅ **Better Performance**: Optimize each service independently
✅ **Easier Debugging**: Isolate issues to specific service
✅ **Flexible Hosting**: Use different platforms for each
✅ **Clean Architecture**: Clear separation of concerns

---

## 📝 Quick Commands

### Deploy Backend
```bash
# Switch to backend config
cp vercel-backend.json vercel.json
git add .
git commit -m "🚀 Deploy backend separately"
git push origin main
```

### Deploy Frontend
```bash
# Switch to frontend config
cp vercel-frontend.json client/web/vercel.json
git add .
git commit -m "🚀 Deploy frontend separately"
git push origin main
```
