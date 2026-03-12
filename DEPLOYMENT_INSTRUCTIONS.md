# 🚀 BIT CMS Production Deployment Guide

## 📋 **Quick Deployment Steps**

### **Option 1: Docker Deployment (Recommended)**
```bash
# 1. Install Docker on your server
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone repository and deploy
git clone <your-repo-url>
cd bit-cms
docker-compose up -d

# 4. Access your application
# Frontend: http://your-server-ip
# Backend: http://your-server-ip:5000
```

### **Option 2: Manual Deployment**
```bash
# 1. Install Node.js on server
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 3. Install PM2
sudo npm install -g pm2

# 4. Deploy application
git clone <your-repo-url>
cd bit-cms
npm install
cd client/web && npm install && npm run build
cd ../..
pm2 start ecosystem.config.js
```

---

## 🐳 **Docker Deployment Files**

### **Dockerfile (Backend)**
```dockerfile
# server/Dockerfile
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

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### **Dockerfile (Frontend)**
```dockerfile
# client/web/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### **docker-compose.yml**
```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./client/web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped

  # Backend
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/bit_cms
      - JWT_SECRET=your-super-secret-jwt-key-change-this
      - CORS_ORIGIN=http://yourdomain.com
    volumes:
      - ./server/uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  # MongoDB
  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password_change_this
      MONGO_INITDB_DATABASE: bit_cms
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Nginx (Load Balancer)
  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
```

---

## 🔧 **Configuration Files**

### **nginx.conf (Frontend)**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        # Handle React Router
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api {
            proxy_pass http://backend:5000;
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
            proxy_pass http://backend:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### **nginx-lb.conf (Load Balancer)**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    server {
        listen 80;
        server_name yourdomain.com;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### **ecosystem.config.js (PM2)**
```javascript
module.exports = {
  apps: [{
    name: 'bit-cms',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGODB_URI: 'mongodb://localhost:27017/bit_cms',
      JWT_SECRET: 'your-super-secret-jwt-key-change-this',
      CORS_ORIGIN: 'http://yourdomain.com'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### **.env.production**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:secure_password_change_this@localhost:27017/bit_cms?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d
CORS_ORIGIN=https://yourdomain.com

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5000000

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Session Configuration
SESSION_SECRET=your-session-secret-change-this
```

---

## 🗄️ **Database Setup**

### **mongo-init.js**
```javascript
// Initialize MongoDB with collections and indexes
db = db.getSiblingDB('bit_cms');

// Create collections
db.createCollection('users');
db.createCollection('students');
db.createCollection('faculty');
db.createCollection('courses');
db.createCollection('timetables');
db.createCollection('admins');
db.createCollection('pendingregistrations');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.students.createIndex({ rollNo: 1 }, { unique: true });
db.students.createIndex({ email: 1 }, { unique: true });
db.students.createIndex({ semester: 1, section: 1 });
db.faculty.createIndex({ empId: 1 }, { unique: true });
db.faculty.createIndex({ email: 1 }, { unique: true });
db.courses.createIndex({ code: 1 }, { unique: true });
db.timetables.createIndex({ semester: 1, section: 1, day: 1 });

// Insert initial data
db.users.insertMany([
  {
    _id: 'admin_user',
    email: 'Admin.bit',
    password: 'Bitadmin@1122',
    role: 'admin',
    profileId: 'admin_profile',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'faculty_user',
    email: 'faculty@bit.edu',
    password: 'faculty123',
    role: 'faculty',
    profileId: 'faculty_profile',
    isActive: true,
    createdAt: new Date()
  },
  {
    _id: 'student_user',
    email: 'student@bit.edu',
    password: 'student123',
    role: 'student',
    profileId: 'student_profile',
    isActive: true,
    createdAt: new Date()
  }
]);

print('Database initialized successfully');
```

---

## 🚀 **Deployment Commands**

### **Docker Deployment**
```bash
# 1. Create production environment file
cp .env.example .env.production
# Edit .env.production with your values

# 2. Build and start containers
docker-compose -f docker-compose.yml up -d

# 3. Check container status
docker-compose ps

# 4. View logs
docker-compose logs -f

# 5. Stop containers
docker-compose down

# 6. Update containers
docker-compose pull
docker-compose up -d --force-recreate
```

### **Manual Deployment**
```bash
# 1. Install dependencies
npm install

# 2. Build frontend
cd client/web
npm install
npm run build
cd ../..

# 3. Setup environment
cp .env.example .env.production
# Edit .env.production

# 4. Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 5. Initialize database
mongo < mongo-init.js

# 6. Start application with PM2
pm2 start ecosystem.config.js --env production

# 7. Save PM2 configuration
pm2 save
pm2 startup
```

---

## 🔒 **SSL/HTTPS Setup**

### **Let's Encrypt Certificate**
```bash
# 1. Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 2. Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **nginx.conf with SSL**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        # ... proxy settings
    }
}
```

---

## 📊 **Monitoring and Maintenance**

### **Health Check Script**
```bash
#!/bin/bash
# health-check.sh

# Check backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ $BACKEND_HEALTH -eq 200 ]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is down (Status: $BACKEND_HEALTH)"
    # Restart backend
    pm2 restart bit-cms
fi

# Check MongoDB
MONGO_STATUS=$(sudo systemctl is-active mongod)
if [ "$MONGO_STATUS" = "active" ]; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is down"
    sudo systemctl start mongod
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Disk usage is ${DISK_USAGE}%"
else
    echo "✅ Disk usage is ${DISK_USAGE}%"
fi
```

### **Backup Script**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --host localhost:27017 --db bit_cms --out $BACKUP_DIR/mongodb_$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /path/to/bit-cms

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -delete

echo "Backup completed: $DATE"
```

---

## 🎯 **Post-Deployment Checklist**

### **Verify Deployment**
- [ ] Frontend loads correctly at http://yourdomain.com
- [ ] Backend API responds at http://yourdomain.com/api/health
- [ ] Admin login works: Admin.bit / Bitadmin@1122
- [ ] Student login works: student@bit.edu / student123
- [ ] Faculty login works: faculty@bit.edu / faculty123
- [ ] Real-time features work (Socket.IO)
- [ ] File uploads work
- [ ] Database connections stable
- [ ] SSL certificate valid
- [ ] Performance acceptable

### **Security Check**
- [ ] Environment variables set correctly
- [ ] Default passwords changed
- [ ] MongoDB authentication enabled
- [ ] Firewall configured
- [ ] Rate limiting working
- [ ] SSL certificate valid
- [ ] No exposed sensitive data

### **Monitoring Setup**
- [ ] PM2 monitoring configured
- [ ] Logs collection working
- [ ] Health checks running
- [ ] Backup system active
- [ ] Performance monitoring
- [ ] Error tracking setup

---

## 🚨 **Troubleshooting**

### **Common Issues**
```bash
# 1. Container won't start
docker-compose logs backend

# 2. Database connection failed
# Check MongoDB URI in .env.production
# Verify MongoDB is running

# 3. Frontend not loading
# Check nginx configuration
# Verify build completed successfully

# 4. Real-time features not working
# Check Socket.IO configuration
# Verify CORS settings

# 5. High memory usage
# Check PM2 cluster configuration
# Optimize database queries
```

### **Performance Issues**
```bash
# 1. Slow response times
# Check database indexes
# Enable caching
# Optimize queries

# 2. Memory leaks
# Monitor PM2 memory usage
# Check for unclosed connections
# Restart applications regularly

# 3. High CPU usage
# Check for infinite loops
# Optimize heavy operations
# Scale horizontally
```

---

## 🎉 **Deployment Complete!**

Your BIT CMS is now deployed and ready for production use with 400+ students and 30+ faculty!

### **Access Your Application**
- **Frontend**: https://yourdomain.com
- **Backend API**: https://yourdomain.com/api
- **Admin Login**: Admin.bit / Bitadmin@1122

### **Next Steps**
1. **Change default passwords**
2. **Add real student/faculty data**
3. **Configure email notifications**
4. **Set up monitoring alerts**
5. **Test with real users**

---

**🚀 Your BIT CMS is now live in production!**
