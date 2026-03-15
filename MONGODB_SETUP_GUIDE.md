# 🗄️ MongoDB Setup Guide for BIT CMS

## 🎯 **Quick MongoDB Setup**

Your BIT CMS is now configured to use MongoDB instead of mock data!

---

## 📋 **Step 1: Get MongoDB Atlas Account**

### **Create Account**
1. **Go to**: https://www.mongodb.com/atlas
2. **Sign up**: Free account with email
3. **Verify**: Email verification
4. **Login**: Access your dashboard

### **Create Organization**
1. Click **"New Organization"**
2. Enter organization name: `BIT CMS`
3. Select **"Free"** plan
4. Click **"Create Organization"**

---

## 🗄️ **Step 2: Create MongoDB Cluster**

### **Build Database**
1. Click **"Build a Database"**
2. Select **"M0 Sandbox"** (Free tier)
3. **Cloud Provider**: Choose closest to your location
4. **Region**: Select nearest region
5. **Cluster Name**: `bit-cms-cluster`
6. Click **"Create Cluster"**

### **Wait for Creation**
- Takes 2-5 minutes
- You'll get email when ready
- Progress bar shows completion

---

## 🔐 **Step 3: Create Database User**

### **Add Database User**
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `bit-cms-admin`
5. **Password**: Generate strong password (save it!)
6. **Confirm Password**: Re-enter password
7. Click **"Add User"**

### **Password Requirements**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- No common passwords

---

## 🌐 **Step 4: Configure Network Access**

### **Add IP Address**
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. **Access Type**: **"Allow Access from Anywhere"**
4. **IP Address**: `0.0.0.0/0`
5. **Comment**: `BIT CMS Production Access`
6. Click **"Confirm"**

### **Why Allow Anywhere?**
- Your app will be deployed on cloud platforms
- IP addresses change with each deployment
- This allows access from any server

---

## 🔗 **Step 5: Get Connection String**

### **Get Connection Details**
1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** button for your cluster
3. **Connection Method**: **"Connect your application"**
4. **Driver**: Select **"Node.js"**
5. **Version**: Select **"4.1 or later"**
6. Click **"Copy"** button

### **Connection String Format**
```
mongodb+srv://bit-cms-admin:<PASSWORD>@bit-cms-cluster.xxxxx.mongodb.net/bit_cms?retryWrites=true&w=majority
```

### **Replace Password**
- Replace `<PASSWORD>` with your actual password
- Keep the connection string secure
- Don't share it publicly

---

## ⚙️ **Step 6: Configure BIT CMS**

### **Create Environment File**
1. **Copy** `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. **Edit** `.env` file with your MongoDB details:
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://bit-cms-admin:YOUR_PASSWORD@bit-cms-cluster.xxxxx.mongodb.net/bit_cms?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-secure

# Server Configuration
NODE_ENV=development
PORT=5000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### **Important Security Notes**
- ✅ **Never commit** `.env` file to Git
- ✅ **Use strong** JWT secret key
- ✅ **Keep connection string** private
- ✅ **Change default** passwords

---

## 🚀 **Step 7: Start BIT CMS**

### **Install Dependencies**
```bash
# Install MongoDB driver
npm install mongoose

# Install all dependencies
npm install
```

### **Start the Server**
```bash
# Development
npm run dev

# Production
npm start
```

### **Expected Output**
```
✅ MongoDB Connected: bit-cms-cluster.xxxxx.mongodb.net
🌱 Seeding initial data...
✅ Initial data seeded successfully
🚀 Server running on port 5000
```

---

## 🧪 **Step 8: Test MongoDB Connection**

### **Test Database Connection**
1. **Visit**: http://localhost:5000/api/health
2. **Should return**: 
```json
{
  "success": true,
  "message": "Server is running",
  "database": "connected"
}
```

### **Test Login**
1. **Visit**: http://localhost:3000
2. **Login**: Admin.bit / Bitadmin@1122
3. **Should work** with MongoDB data

### **Check MongoDB Atlas**
1. Go to MongoDB Atlas dashboard
2. Click **"Collections"** under your cluster
3. **Should see**: users, students, faculty, courses, etc.

---

## 📊 **Step 9: Verify Data**

### **Check Collections**
In MongoDB Atlas, you should see:
- ✅ **users** - Admin, faculty, student accounts
- ✅ **students** - Student information
- ✅ **faculty** - Faculty information
- ✅ **courses** - Course catalog
- ✅ **timetables** - Class schedules
- ✅ **fees** - Fee records
- ✅ **notices** - Announcements

### **Test Features**
- ✅ **User Authentication** - Login/logout
- ✅ **Dashboard Access** - All user roles
- ✅ **Data Management** - CRUD operations
- ✅ **Real-time Updates** - Socket.IO functionality
- ✅ **File Uploads** - Document management

---

## 🔧 **Advanced Configuration**

### **MongoDB Atlas Settings**
1. **Metrics**: Monitor performance
2. **Alerts**: Set up notifications
3. **Backups**: Configure automatic backups
4. **Security**: Enable encryption at rest
5. **Performance**: Monitor slow queries

### **Connection Options**
```env
# Connection with more options
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bit_cms?retryWrites=true&w=majority&appName=bit-cms

# Local MongoDB (if you have local instance)
MONGODB_URI=mongodb://localhost:27017/bit_cms
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Connection Error**
```
❌ MongoDB Connection Error: Authentication failed
```
**Solutions:**
1. Check username/password are correct
2. Verify IP access is configured
3. Ensure cluster is running
4. Check connection string format

#### **Timeout Error**
```
❌ MongoDB Connection Error: Server selection timed out
```
**Solutions:**
1. Check network connectivity
2. Verify firewall settings
3. Try different connection string
4. Check MongoDB Atlas status

#### **Permission Error**
```
❌ MongoDB Connection Error: User not authorized
```
**Solutions:**
1. Verify user has database access
2. Check user permissions
3. Ensure correct database name
4. Re-create user if needed

### **Debug Commands**
```bash
# Check MongoDB connection
node -e "require('./config/db').then(() => console.log('Connected')).catch(console.error)"

# Test connection string
mongosh "mongodb+srv://username:password@cluster.mongodb.net/bit_cms"

# Check environment variables
echo $MONGODB_URI
```

---

## 📱 **Production Deployment**

### **Update Environment for Production**
```env
# Production environment
NODE_ENV=production
CORS_ORIGIN=https://your-app-name.vercel.app
```

### **Deployment Platforms**
- ✅ **Vercel**: Add MONGODB_URI to environment variables
- ✅ **Heroku**: Set config with `heroku config:set`
- ✅ **DigitalOcean**: Use environment variables
- ✅ **AWS**: Use EC2 user data or secrets

---

## 💰 **Cost Information**

### **MongoDB Atlas Free Tier**
- ✅ **512MB Storage**
- ✅ **100MB Network Transfer**
- ✅ **Shared RAM**
- ✅ **3 Replicas**
- ✅ **Backups Included**
- ✅ **$0/month**

### **When to Upgrade**
- More than 100 students
- Need more storage
- Higher performance requirements
- Advanced security features

---

## 🎯 **Best Practices**

### **Security**
- ✅ **Use strong passwords**
- ✅ **Enable IP restrictions** (if possible)
- ✅ **Use SSL/TLS** (automatic with Atlas)
- ✅ **Regular backups**
- ✅ **Monitor access logs**

### **Performance**
- ✅ **Create indexes** (automatically done)
- ✅ **Monitor slow queries**
- ✅ **Use connection pooling**
- ✅ **Optimize data structure**
- ✅ **Regular maintenance**

### **Development**
- ✅ **Use environment variables**
- ✅ **Never commit secrets**
- ✅ **Test connections**
- ✅ **Handle connection errors**
- ✅ **Use retry logic**

---

## 🎉 **Success!**

### **Your BIT CMS is Now Using MongoDB!**

#### **What's Working**
- ✅ **Real MongoDB database** (not mock data)
- ✅ **Persistent data** (data survives restarts)
- ✅ **Scalable storage** (can handle 400+ students)
- ✅ **Professional setup** (production-ready)
- ✅ **Automatic seeding** (initial data loaded)
- ✅ **Optimized queries** (indexes created)

#### **Next Steps**
1. **Test all features** with real database
2. **Add your own data** (students, faculty, courses)
3. **Deploy to production** (Vercel, Heroku, etc.)
4. **Monitor performance** (MongoDB Atlas metrics)
5. **Set up backups** (Atlas automatic backups)

#### **Access Information**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: MongoDB Atlas Dashboard
- **Login**: Admin.bit / Bitadmin@1122

---

## 🆘 **Need Help?**

### **MongoDB Resources**
- **Documentation**: https://docs.mongodb.com
- **Atlas Dashboard**: https://cloud.mongodb.com
- **Community**: https://community.mongodb.com
- **Support**: https://support.mongodb.com

### **BIT CMS Support**
- Check connection logs
- Verify environment variables
- Test database operations
- Review error messages

---

**🗄️ Your BIT CMS is now fully configured with MongoDB! Follow this guide to set up your database and start using real persistent data storage.**
