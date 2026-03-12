# 🌐 BIT CMS Online Deployment Guide

## 🚀 **Deploy Your BIT CMS to the Cloud**

Choose the best deployment option for your needs and budget.

---

## 📋 **Quick Deployment Options**

### **Option 1: Vercel + MongoDB Atlas (Easiest)**
**Cost: $0-10/month | Time: 15 minutes | Difficulty: Easy**

### **Option 2: Heroku + MongoDB Atlas (Easy)**
**Cost: $0-25/month | Time: 30 minutes | Difficulty: Easy**

### **Option 3: DigitalOcean (Full Control)**
**Cost: $5-20/month | Time: 45 minutes | Difficulty: Medium**

### **Option 4: AWS EC2 (Enterprise)**
**Cost: $15-50/month | Time: 60 minutes | Difficulty: Hard**

---

## 🎯 **Option 1: Vercel + MongoDB Atlas (Recommended)**

### **Step 1: Setup MongoDB Atlas**
```bash
# 1. Go to https://www.mongodb.com/atlas
# 2. Create free account
# 3. Create free cluster (M0 - Free)
# 4. Create database user
# 5. Get connection string
```

### **Step 2: Deploy Frontend to Vercel**
```bash
# 1. Go to https://vercel.com
# 2. Sign up with GitHub
# 3. Import your repository
# 4. Configure build settings:
#    - Framework: React
#    - Build Command: npm run build
#    - Output Directory: build
#    - Install Command: npm install
```

### **Step 3: Deploy Backend to Vercel Serverless**
```bash
# 1. Create vercel.json in root:
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret"
  }
}

# 2. Deploy backend
vercel --prod
```

### **Step 4: Configure Environment**
```bash
# In Vercel dashboard, add environment variables:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bit_cms
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

---

## 🚀 **Option 2: Heroku + MongoDB Atlas**

### **Step 1: Setup MongoDB Atlas**
```bash
# Same as Option 1
# Get connection string
```

### **Step 2: Deploy to Heroku**
```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create app
heroku create bit-cms

# 4. Add buildpack
heroku buildpacks:add heroku/nodejs

# 5. Add MongoDB Atlas addon
heroku addons:create mongolab:sandbox

# 6. Set environment variables
heroku config:set MONGODB_URI="your-mongodb-connection-string"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set NODE_ENV=production

# 7. Deploy
git push heroku main
```

### **Step 3: Configure Heroku**
```bash
# Create Procfile in root:
web: cd server && npm start

# Create .env for Heroku
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bit_cms
JWT_SECRET=your-jwt-secret
```

---

## 🌐 **Option 3: DigitalOcean (Recommended for Production)**

### **Step 1: Create DigitalOcean Droplet**
```bash
# 1. Sign up at https://www.digitalocean.com
# 2. Create Droplet:
#    - Image: Ubuntu 22.04
#    - Plan: $5/month (1GB RAM, 1 CPU) or $10/month (2GB RAM, 1 CPU)
#    - Region: Choose nearest to your users
#    - SSH Key: Add your SSH key
```

### **Step 2: Setup Server**
```bash
# 1. SSH into server
ssh root@your-server-ip

# 2. Update system
apt update && apt upgrade -y

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 4. Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# 5. Install PM2
npm install -g pm2

# 6. Install Nginx
apt install nginx -y

# 7. Install Git
apt install git -y
```

### **Step 3: Deploy Application**
```bash
# 1. Clone repository
git clone https://github.com/yourusername/bit-cms.git
cd bit-cms

# 2. Install dependencies
npm install
cd client/web && npm install && npm run build

# 3. Setup environment
cp .env.prod .env
# Edit .env with your settings

# 4. Start MongoDB
systemctl start mongod
systemctl enable mongod

# 5. Initialize database
mongo < mongo-init.js

# 6. Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **Step 4: Configure Nginx**
```bash
# Create /etc/nginx/sites-available/bit-cms:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/bit-cms/client/web/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/bit-cms /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 🌟 **Option 4: AWS EC2 (Enterprise)**

### **Step 1: Create AWS Account**
```bash
# 1. Go to https://aws.amazon.com
# 2. Create free tier account
# 3. Go to EC2 dashboard
# 4. Launch instance:
#    - AMI: Ubuntu Server 22.04 LTS
#    - Instance type: t2.micro (free tier) or t3.small
#    - Storage: 20GB SSD
#    - Security Group: Allow HTTP (80), HTTPS (443), SSH (22)
```

### **Step 2: Setup AWS EC2**
```bash
# Same as DigitalOcean setup
# SSH into EC2 instance
# Install Node.js, MongoDB, PM2, Nginx
# Deploy application
# Configure security groups
```

### **Step 3: Domain and SSL**
```bash
# 1. Buy domain from Route 53 or other registrar
# 2. Point domain to EC2 IP
# 3. Install SSL certificate
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 **Deployment Files Created**

### **Vercel Configuration**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "NODE_ENV": "production"
  }
}
```

### **Heroku Configuration**
```procfile
// Procfile
web: cd server && npm start
```

### **Environment Templates**
```bash
# .env.vercel
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bit_cms
JWT_SECRET=your-jwt-secret

# .env.heroku
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bit_cms
JWT_SECRET=your-jwt-secret
```

---

## 🚀 **Quick Deploy Commands**

### **Vercel Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd client/web
vercel --prod

# Deploy backend
cd ../..
vercel --prod
```

### **Heroku Deploy**
```bash
# Install Heroku CLI
# Create app
heroku create bit-cms

# Deploy
git push heroku main
```

### **DigitalOcean Deploy**
```bash
# SSH into server
ssh root@your-server-ip

# Deploy script
cd /root
git clone https://github.com/yourusername/bit-cms.git
cd bit-cms
chmod +x deploy.sh
./deploy.sh
```

---

## 🔒 **SSL and Security**

### **Free SSL Certificate**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Security Headers**
```nginx
# Add to nginx config
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

---

## 📊 **Domain Setup**

### **Point Domain to Server**
```bash
# DNS Settings:
# A Record: @ -> your-server-ip
# A Record: www -> your-server-ip
# CNAME: api -> your-server-ip (optional)
```

### **Subdomain Setup**
```bash
# For API subdomain:
api.yourdomain.com -> your-server-ip

# Nginx configuration for subdomain:
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        # ... proxy settings
    }
}
```

---

## 🎯 **Post-Deployment Checklist**

### **Functionality Testing**
- [ ] Frontend loads at https://your-domain.com
- [ ] Backend API responds at https://your-domain.com/api/health
- [ ] Admin login works
- [ ] Student/Faculty login works
- [ ] Timetable features work
- [ ] Real-time updates work
- [ ] File uploads work

### **Security Verification**
- [ ] SSL certificate valid
- [ ] HTTPS redirects work
- [ ] Default passwords changed
- [ ] Environment variables secure
- [ ] Rate limiting working
- [ ] CORS properly configured

### **Performance Check**
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Images optimized

---

## 📱 **Mobile App Deployment**

### **PWA for Mobile**
```bash
# 1. Add manifest.json to client/public
# 2. Add service worker
# 3. Update index.html
# 4. Deploy with same methods above

# Result: Installable mobile app from browser
```

### **React Native App Stores**
```bash
# 1. Create React Native app
# 2. Use existing backend API
# 3. Build for iOS/Android
# 4. Submit to App Store/Play Store
```

---

## 🎉 **Deployment Success!**

### **Your BIT CMS is Now Online!**

#### **Access Your Application**
- **Web App**: https://your-domain.com
- **API**: https://your-domain.com/api
- **Admin**: Admin.bit / Bitadmin@1122

#### **Mobile Access**
- **Mobile Web**: https://your-domain.com (responsive)
- **PWA**: Installable from browser
- **Native App**: Future development

#### **Management**
- **Server Access**: SSH/Console
- **Database**: MongoDB Atlas/Server
- **Logs**: PM2/Hosting logs
- **Monitoring**: Uptime/Performance tools

---

## 🚀 **Next Steps**

### **Immediate**
1. **Change default passwords**
2. **Add real student/faculty data**
3. **Test all features**
4. **Set up monitoring**

### **Short Term**
1. **Configure email notifications**
2. **Set up backup system**
3. **Add analytics**
4. **Optimize performance**

### **Long Term**
1. **Create mobile app**
2. **Add more features**
3. **Scale infrastructure**
4. **Add monitoring alerts**

---

**🌐 Your BIT CMS is now live online! Choose your deployment method and follow the steps above. I recommend starting with Vercel + MongoDB Atlas for the easiest setup.**
