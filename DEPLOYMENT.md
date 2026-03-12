# BIT CMS - Deployment Guide

## 🚀 Production Deployment with Real-Time Features

This guide covers deploying the BIT CMS system with full real-time capabilities, monitoring, and SSL support.

## 📋 Prerequisites

- **Docker** & **Docker Compose** (v20.10+)
- **Node.js** 18+ (for local development)
- **Domain name** (for production SSL)
- **Server** with at least 2GB RAM, 20GB storage

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (SSL)   │────│  BIT CMS App    │────│   MongoDB DB    │
│   Port 80/443   │    │   Port 5000     │    │   Port 27017    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────┐              │
         │              │   Redis     │              │
         │              │  Port 6379  │              │
         │              └─────────────┘              │
         │                       │                       │
    ┌─────────┐        ┌─────────────┐        ┌─────────────┐
    │  Web UI │        │Socket.IO RT  │        │  Monitoring  │
    │ Port 300│        │ Real-time    │        │ Prometheus   │
    └─────────┘        │ Features     │        │   Grafana    │
                      └─────────────┘        └─────────────┘
```

## ⚡ Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd bit-cms
```

### 2. Environment Configuration

```bash
# Copy production environment file
cp .env.production .env

# Edit the environment variables
nano .env
```

**Required Environment Variables:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password@mongodb:27017/bit_cms?authSource=admin
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-domain.com
```

### 3. Deploy with SSL & Monitoring

```bash
# Make deploy script executable
chmod +x deploy.sh

# Full deployment with SSL and monitoring
./deploy.sh --ssl --monitoring
```

## 🔧 Deployment Options

### Basic Deployment
```bash
./deploy.sh
```

### With SSL Certificate
```bash
./deploy.sh --ssl
```

### With Monitoring
```bash
./deploy.sh --ssl --monitoring
```

### Development Deployment
```bash
docker-compose --profile development up
```

## 📊 Real-Time Features

The BIT CMS includes comprehensive real-time capabilities:

### 🎯 Socket.IO Events

#### Authentication & User Management
- `authenticate` - User authentication
- `user-online` - User status notification
- `user-offline` - User disconnection

#### 📢 Notice System
- `notice-update` - Real-time notice updates
- Targeted notifications by role
- Priority-based notifications

#### 📋 Attendance Tracking
- `attendance-marked` - Live attendance updates
- Class-wide notifications
- Faculty-student synchronization

#### 💰 Fee Management
- `fee-updated` - Payment status updates
- Student notifications
- Admin dashboard updates

#### 📝 Assignment Management
- `assignment-updated` - New/updated assignments
- Deadline reminders
- Grade notifications

#### 📅 Timetable Updates
- `timetable-updated` - Schedule changes
- Room change notifications
- Class cancellation alerts

#### 💬 Real-time Chat
- `send-message` - Instant messaging
- `typing-start/stop` - Typing indicators
- Room-based conversations

### 🔌 Connection Management

```javascript
// Client-side connection example
const socket = io('https://your-domain.com', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join role-based rooms
socket.emit('authenticate', {
  email: 'user@domain.com',
  role: 'student',
  userId: 'user-123'
});

// Listen for real-time updates
socket.on('notice-updated', (data) => {
  console.log('New notice:', data);
});
```

## 🔍 Monitoring & Observability

### Prometheus Metrics

Available at `http://your-domain.com:9090`

- **Connected Users**: Real-time user count
- **Socket.IO Connections**: Active WebSocket connections
- **API Response Times**: Request performance
- **Database Connections**: MongoDB connection status
- **Error Rates**: Application error tracking

### Grafana Dashboard

Available at `http://your-domain.com:3001`

- **Default Credentials**: admin/admin123
- **Pre-configured dashboards**:
  - System Overview
  - Real-time Metrics
  - User Activity
  - Performance Analytics

### Health Checks

```bash
# Application health
curl https://your-domain.com/health

# Real-time stats
curl https://your-domain.com/api/stats/realtime

# Service status
docker-compose ps
```

## 🔒 Security Features

### SSL/TLS Configuration
- **Automatic SSL** with Let's Encrypt
- **HSTS** enforcement
- **Secure headers** (CSP, X-Frame-Options, etc.)
- **Certificate auto-renewal**

### Rate Limiting
- **API endpoints**: 100 requests/15 minutes
- **Login endpoint**: 5 requests/minute
- **DDoS protection** via Nginx

### Authentication Security
- **JWT tokens** with configurable expiration
- **BCrypt** password hashing
- **Session management** with Redis
- **Role-based access control**

## 📱 Scaling & Performance

### Horizontal Scaling
```bash
# Scale application instances
docker-compose up --scale bit-cms=3

# Load balancing via Nginx
# Automatic session affinity
```

### Database Optimization
- **MongoDB indexes** for all collections
- **Connection pooling** (max 50 connections)
- **Query optimization** with aggregation pipelines
- **Backup automation**

### Caching Strategy
- **Redis** for session storage
- **Application-level caching** for frequently accessed data
- **Static asset caching** via Nginx
- **CDN ready** configuration

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Create backup
./deploy.sh --backup

# Manual backup
docker exec bit-cms-mongodb mongodump --out /tmp/backup
docker cp bit-cms-mongodb:/tmp/backup ./backups/$(date +%Y%m%d)
```

### Recovery Process
```bash
# Restore from backup
docker cp ./backups/20240101 bit-cms-mongodb:/tmp/restore
docker exec bit-cms-mongodb mongorestore /tmp/restore
```

### Backup Schedule
- **MongoDB**: Daily automatic backups
- **Redis**: Weekly snapshots
- **Application logs**: 30-day retention
- **Uploads**: Real-time replication

## 🚨 Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check logs
docker-compose logs bit-cms

# Check resource usage
docker stats

# Restart services
docker-compose restart
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew

# Force renewal
certbot renew --force-renewal
```

#### 3. Database Connection Issues
```bash
# Check MongoDB status
docker exec bit-cms-mongodb mongosh --eval "db.adminCommand('ismaster')"

# Check network connectivity
docker network ls
docker network inspect bit-cms_bit-cms-network
```

#### 4. Real-time Features Not Working
```bash
# Check WebSocket connections
curl -w "\n" http://localhost:5000/api/stats/realtime

# Check Socket.IO logs
docker-compose logs bit-cms | grep socket
```

### Performance Optimization

#### Database Indexes
```javascript
// Create compound indexes
db.attendance.createIndex({ "studentId": 1, "date": -1 });
db.fees.createIndex({ "studentId": 1, "status": 1 });
```

#### Memory Usage
```bash
# Monitor memory usage
docker stats --no-stream

# Optimize Node.js memory
NODE_OPTIONS="--max-old-space-size=2048"
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**:
   - Check SSL certificates
   - Review error logs
   - Update dependencies

2. **Monthly**:
   - Database optimization
   - Backup verification
   - Security updates

3. **Quarterly**:
   - Performance audit
   - Capacity planning
   - Disaster recovery testing

### Monitoring Alerts

Set up alerts for:
- **High error rates** (>5%)
- **Memory usage** (>80%)
- **Database connections** (>90%)
- **SSL expiration** (<30 days)

### Contact Support

- **Documentation**: [GitHub Wiki](link)
- **Issues**: [GitHub Issues](link)
- **Email**: support@your-domain.com

## 🎯 Next Steps

After successful deployment:

1. **Configure email notifications**
2. **Set up custom domain**
3. **Configure backup schedule**
4. **Set up monitoring alerts**
5. **Train administrators**
6. **Document custom processes**

## 📚 Additional Resources

- [API Documentation](./API.md)
- [User Manual](./USER_GUIDE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Security Guidelines](./SECURITY.md)

---

**BIT CMS** - Modern College Management System with Real-Time Features

🚀 **Deployed with real-time capabilities, monitoring, and enterprise-grade security!**
