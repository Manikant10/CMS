# 🚀 BIT CMS Deployment Guide

## 📋 **Table of Contents**
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Security Considerations](#security-considerations)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 **Prerequisites**

### **Required Software**
- **Node.js**: v16.0 or higher
- **npm**: v8.0 or higher (comes with Node.js)
- **MongoDB**: v5.0 or higher (for production)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### **System Requirements**
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)

---

## 💻 **Local Development Setup**

### **Step 1: Clone Repository**
```bash
git clone <repository-url>
cd bit-cms
```

### **Step 2: Install Dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client/web
npm install
```

### **Step 3: Environment Setup**
```bash
# In server directory
cp .env.example .env
# Edit .env file with your configuration

# In client directory
cp .env.example .env
# Edit .env file with your configuration
```

### **Step 4: Start Development Servers**
```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend server
cd client/web
npm start
```

### **Step 5: Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🌐 **Production Deployment**

### **Option 1: Traditional Server Deployment**

#### **Step 1: Server Preparation**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### **Step 2: Application Setup**
```bash
# Clone repository
git clone <repository-url>
cd bit-cms

# Install dependencies
cd server && npm install
cd ../client/web && npm install
cd ../..

# Build frontend for production
cd client/web
npm run build
cd ../..
```

#### **Step 3: Environment Configuration**
```bash
# Create production environment file
cd server
cp .env.example .env.production

# Edit production environment
nano .env.production
```

**Production .env.example:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bit_cms
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# CORS Settings
CORS_ORIGIN=https://yourdomain.com

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5000000
```

#### **Step 4: Database Setup**
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
> use bit_cms
> db.createUser({
    user: "bitcms_user",
    pwd: "secure_password",
    roles: ["readWrite"]
  })
> exit
```

#### **Step 5: Start Application with PM2**
```bash
# Create PM2 ecosystem file
cd server
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'bit-cms',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Create logs directory
mkdir logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### **Step 6: Web Server Configuration (Nginx)**
```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/bit-cms
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend static files
    location / {
        root /path/to/bit-cms/client/web/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bit-cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Option 2: Docker Deployment**

#### **Step 1: Create Dockerfile**
```dockerfile
# Dockerfile for server
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### **Step 2: Create docker-compose.yml**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: bit-cms-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password
      MONGO_INITDB_DATABASE: bit_cms
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  server:
    build: ./server
    container_name: bit-cms-server
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:secure_password@mongodb:27017/bit_cms?authSource=admin
      JWT_SECRET: your-super-secret-jwt-key
      PORT: 5000
    depends_on:
      - mongodb
    ports:
      - "5000:5000"
    volumes:
      - ./server/uploads:/app/uploads

  client:
    build: ./client/web
    container_name: bit-cms-client
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  mongodb_data:
```

#### **Step 3: Deploy with Docker**
```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### **Option 3: Cloud Platform Deployment**

#### **Vercel (Frontend) + Heroku/Railway (Backend)**

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd client/web
vercel --prod
```

**Backend on Heroku:**
```bash
# Install Heroku CLI
# Add heroku.yml to server directory
echo "web: npm start" > Procfile
echo "node_modules" > .gitignore

# Deploy
heroku create bit-cms-server
git push heroku main
```

---

## 🔧 **Environment Configuration**

### **Development Environment (.env.development)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bit_cms_dev
JWT_SECRET=dev-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### **Production Environment (.env.production)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://username:password@localhost:27017/bit_cms_prod
JWT_SECRET=super-secure-production-key
JWT_EXPIRE=30d
CORS_ORIGIN=https://yourdomain.com
```

### **Test Environment (.env.test)**
```env
NODE_ENV=test
PORT=5001
MONGODB_URI=mongodb://localhost:27017/bit_cms_test
JWT_SECRET=test-secret-key
JWT_EXPIRE=1d
CORS_ORIGIN=http://localhost:3000
```

---

## 🗄️ **Database Setup**

### **MongoDB Configuration**

#### **Local MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Connect to MongoDB
mongo bit_cms
```

#### **MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Add to environment variables:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bit_cms?retryWrites=true&w=majority
```

#### **Database Initialization**
```javascript
// Run once to create initial data
node server/seed.js
```

---

## 🔒 **Security Considerations**

### **Essential Security Measures**

#### **1. Environment Variables**
- Never commit `.env` files to version control
- Use strong, unique secrets
- Rotate keys regularly

#### **2. Database Security**
- Use database authentication
- Enable MongoDB authentication
- Use SSL/TLS connections
- Regular backups

#### **3. Application Security**
- Enable HTTPS in production
- Use helmet.js for security headers
- Implement rate limiting
- Validate all inputs
- Use parameterized queries

#### **4. Server Security**
- Regular system updates
- Firewall configuration
- Fail2Ban for intrusion prevention
- Regular security audits

### **SSL/TLS Setup**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Find process using port
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

#### **2. MongoDB Connection Issues**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### **3. Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/bit-cms
chmod -R 755 /path/to/bit-cms
```

#### **4. Memory Issues**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 index.js

# Or in package.json
"start": "node --max-old-space-size=4096 index.js"
```

### **Monitoring and Logs**

#### **PM2 Monitoring**
```bash
# View process status
pm2 status

# View logs
pm2 logs

# Monitor CPU/Memory
pm2 monit

# Restart application
pm2 restart bit-cms
```

#### **System Monitoring**
```bash
# System resources
htop
df -h
free -h

# Application logs
tail -f server/logs/combined.log
```

---

## 📱 **Mobile Deployment (Optional)**

### **Progressive Web App (PWA)**
```bash
# Install PWA dependencies
cd client/web
npm install @craco/craco workbox-webpack-plugin

# Configure PWA
# Update public/manifest.json
# Add service worker
```

### **React Native (Mobile App)**
```bash
# Create React Native app
npx react-native init BitCMSMobile

# Use existing API
# Configure networking to your deployed backend
```

---

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Update all dependencies
- [ ] Test all functionality
- [ ] Set up environment variables
- [ ] Configure database
- [ ] Set up SSL certificates
- [ ] Configure monitoring
- [ ] Create backups

### **Post-Deployment**
- [ ] Verify all endpoints work
- [ ] Test user authentication
- [ ] Check real-time features
- [ ] Monitor performance
- [ ] Set up alerts
- [ ] Document deployment

---

## 📞 **Support and Maintenance**

### **Regular Maintenance Tasks**
- Weekly: Check logs and performance
- Monthly: Update dependencies
- Quarterly: Security audits
- Annually: Review and update architecture

### **Emergency Procedures**
1. **Application Down**: Check PM2 status, restart if needed
2. **Database Issues**: Check MongoDB status, review logs
3. **High CPU/Memory**: Scale up or optimize code
4. **Security Breach**: Change all keys, review logs

---

**🎉 Your BIT CMS is now ready for deployment!**

Choose the deployment method that best fits your needs:
- **Traditional Server**: Full control, requires server management
- **Docker**: Containerized, easy to scale and maintain
- **Cloud Platform**: Managed hosting, less maintenance overhead

For most users, **Docker deployment** is recommended for its simplicity and consistency across environments.
