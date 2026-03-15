# 🗄️ MongoDB Setup - Step by Step Guide

## 🎯 **Complete MongoDB Setup for BIT CMS**

Follow these exact steps to get MongoDB working with your BIT CMS.

---

## 📋 **STEP 1: MongoDB Atlas Account Setup**

### **1.1 Create Account**
1. Open browser → **https://www.mongodb.com/atlas**
2. Click **"Try Free"** button
3. Fill in:
   - **Email**: your-email@example.com
   - **Password**: strong password
   - **Confirm Password**: re-enter password
4. Click **"Sign up"**
5. Check email for verification → Click verification link

### **1.2 Create Organization**
1. After login, click **"New Organization"**
2. Enter:
   - **Organization Name**: `BIT CMS`
   - **Plan**: Select **"Free"**
3. Click **"Create Organization"**

---

## 🗄️ **STEP 2: Create MongoDB Cluster**

### **2.1 Build Database**
1. In your new organization, click **"Build a Database"**
2. Select **"M0 Sandbox"** (FREE tier)
3. **Cloud Provider**: Choose your preferred provider
4. **Region**: Select region closest to you
5. **Cluster Name**: Enter `bit-cms-cluster`
6. **Cluster Type**: Leave as **"Shared Cluster"**
7. Click **"Create Cluster"**

### **2.2 Wait for Cluster**
- Wait 2-5 minutes for cluster creation
- You'll see progress bar
- You'll get email when ready
- Cluster will show "ACTIVE" status

---

## 🔐 **STEP 3: Create Database User**

### **3.1 Add User**
1. Click **"Database Access"** (left sidebar menu)
2. Click **"Add New Database User"** button
3. Fill in:
   - **Authentication Method**: **Password**
   - **Username**: `bit-cms-admin`
   - **Password**: Create strong password (save it!)
   - **Confirm Password**: Re-enter password
4. Click **"Add User"**

### **Password Requirements**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- Example: `BitCms@2024!`

---

## 🌐 **STEP 4: Configure Network Access**

### **4.1 Add IP Access**
1. Click **"Network Access"** (left sidebar menu)
2. Click **"Add IP Address"** button
3. **Access Type**: Select **"Allow Access from Anywhere"**
4. **IP Address**: Enter `0.0.0.0/0`
5. **Comment**: Enter `BIT CMS Production Access`
6. Click **"Confirm"**

### **Why Allow Anywhere?**
- Your app will be deployed on cloud platforms
- IP addresses change with each deployment
- This allows access from any server

---

## 🔗 **STEP 5: Get Connection String**

### **5.1 Get Connection Details**
1. Click **"Database"** (left sidebar)
2. Click **"Connect"** button for your cluster
3. **Connection Method**: Select **"Connect your application"**
4. **Driver**: Select **"Node.js"**
5. **Version**: Select **"4.1 or later"**
6. Click **"Copy"** button

### **5.2 Connection String Format**
```
mongodb+srv://bit-cms-admin:<PASSWORD>@bit-cms-cluster.xxxxx.mongodb.net/bit_cms?retryWrites=true&w=majority
```

### **5.3 Important**
- Replace `<PASSWORD>` with your actual password
- Keep this connection string secure
- Don't share it publicly

---

## ⚙️ **STEP 6: Configure BIT CMS**

### **6.1 Create Environment File**
1. Open terminal/command prompt
2. Navigate to your BIT CMS folder:
   ```bash
   cd c:\Users\manic\bit-cms
   ```
3. Copy environment template:
   ```bash
   copy .env.example .env
   ```

### **6.2 Edit Environment File**
1. Open `.env` file in text editor
2. Replace with your MongoDB details:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://bit-cms-admin:YOUR_ACTUAL_PASSWORD@bit-cms-cluster.xxxxx.mongodb.net/bit_cms?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-secure
   
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

### **6.3 Save the File**
- Save the `.env` file
- Make sure it's in the root folder
- **NEVER commit this file to Git**

---

## 🧪 **STEP 7: Test MongoDB Connection**

### **7.1 Run Test Script**
1. Open terminal in BIT CMS folder
2. Run the test script:
   ```bash
   node test-mongodb.js
   ```

### **7.2 Expected Success Output**
```
🔍 Testing MongoDB connection...
📋 Connection String: Set
✅ MongoDB Connected Successfully!
📍 Host: bit-cms-cluster.xxxxx.mongodb.net
🗄️  Database: bit_cms
📁 Collections found: 0
🔌 Connection closed
```

### **7.3 Troubleshooting Errors**
```
❌ MongoDB Connection Failed:
   Error: Authentication failed
   → Check username/password are correct
   
   Error: Server selection timed out
   → Check network connection
   
   Error: User not authorized
   → Check user permissions
```

---

## 🚀 **STEP 8: Start BIT CMS**

### **8.1 Install Dependencies**
```bash
# Install MongoDB driver
npm install mongoose

# Install all dependencies
npm install
```

### **8.2 Start Development Server**
```bash
npm run dev
```

### **8.3 Expected Success Output**
```
✅ MongoDB Connected: bit-cms-cluster.xxxxx.mongodb.net
🌱 Seeding initial data...
✅ Initial data seeded successfully
🚀 Server running on port 5000
```

### **8.4 Start Production Server**
```bash
npm start
```

---

## 🌐 **STEP 9: Access Your Application**

### **9.1 Open Application**
1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000
3. **Health Check**: http://localhost:5000/api/health

### **9.2 Login Credentials**
- **Admin**: `Admin.bit` / `Bitadmin@1122`
- **Faculty**: `faculty@bit.edu` / `faculty123`
- **Student**: `student@bit.edu` / `student123`

### **9.3 Test Features**
- ✅ Login as admin
- ✅ Navigate to dashboard
- ✅ Check student management
- ✅ Test fee tracking
- ✅ Verify real data in MongoDB Atlas

---

## 📊 **STEP 10: Verify MongoDB Data**

### **10.1 Check MongoDB Atlas**
1. Go to MongoDB Atlas dashboard
2. Click **"Collections"** under your cluster
3. **Should see**:
   - `users` - User accounts
   - `students` - Student information
   - `faculty` - Faculty information
   - `courses` - Course catalog
   - `timetables` - Class schedules
   - `fees` - Fee records
   - `notices` - Announcements

### **10.2 Verify Data Structure**
- Click on any collection to see the data
- Verify all fields are populated correctly
- Check that relationships work properly

---

## 🎯 **QUICK CHECKLIST**

### **✅ MongoDB Setup Complete**
- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Sandbox)
- [ ] Database user created (`bit-cms-admin`)
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] .env file created and configured
- [ ] Connection tested successfully
- [ ] BIT CMS started with MongoDB
- [ ] All features working with real data

### **✅ Application Testing**
- [ ] Admin login works
- [ ] Student management works
- [ ] Faculty management works
- [ ] Course management works
- [ ] Fee tracking works
- [ ] Real-time updates work
- [ ] Data persists in MongoDB

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **MongoDB Connection Issues**
```
Problem: Cannot connect to MongoDB
Solution: 
1. Check MONGODB_URI in .env file
2. Verify username/password are correct
3. Ensure IP access is 0.0.0.0/0
4. Check cluster is running in Atlas
```

#### **Environment Variable Issues**
```
Problem: MONGODB_URI not found
Solution:
1. Ensure .env file exists in root folder
2. Check file name is exactly ".env" (not ".env.txt")
3. Verify no typos in variable names
```

#### **Server Startup Issues**
```
Problem: Server fails to start
Solution:
1. Check all dependencies are installed
2. Verify MongoDB connection works first
3. Check for syntax errors in .env file
4. Run node test-mongodb.js to debug
```

#### **Data Issues**
```
Problem: No data in collections
Solution:
1. Check if auto-seeding ran
2. Verify mock data is accessible
3. Check MongoDB user has write permissions
4. Look for seeding errors in server logs
```

---

## 📱 **PRODUCTION DEPLOYMENT**

### **Update Environment for Production**
```env
# Production settings
NODE_ENV=production
CORS_ORIGIN=https://your-app-name.vercel.app
```

### **Deployment Platforms**
- **Vercel**: Add MONGODB_URI to environment variables
- **Heroku**: `heroku config:set MONGODB_URI="your-connection-string"`
- **DigitalOcean**: Use environment variables in deployment script
- **AWS EC2**: Use EC2 user data or secrets manager

---

## 💰 **COST INFORMATION**

### **MongoDB Atlas Free Tier**
- ✅ **512MB Storage** - Enough for 400+ students
- ✅ **100MB Network Transfer** - Sufficient for web app
- ✅ **Shared RAM** - Good for small to medium apps
- ✅ **3 Replicas** - High availability
- ✅ **Automatic Backups** - 30-day retention
- ✅ **SSL/TLS** - Secure connections included
- ✅ **$0/month** - Completely free

### **When to Upgrade**
- More than 100 students
- Need more than 512MB storage
- Higher performance requirements
- Advanced security features needed

---

## 🎉 **SUCCESS!**

### **Your BIT CMS is Now Running with MongoDB!**

#### **What You Have Achieved**
- ✅ **Professional Database** - MongoDB Atlas integration
- ✅ **Persistent Data** - Data survives server restarts
- ✅ **Scalable Architecture** - Can handle thousands of students
- ✅ **Production Ready** - Enterprise-grade setup
- ✅ **Full Feature Support** - All BIT CMS features working
- ✅ **Real-time Updates** - Socket.IO with MongoDB
- ✅ **Automatic Seeding** - Initial data automatically loaded

#### **Next Steps**
1. **Test all features** thoroughly
2. **Add your real data** (students, faculty, courses)
3. **Deploy to production** when ready
4. **Monitor performance** in MongoDB Atlas dashboard
5. **Set up backups** and monitoring

#### **Access Information**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: MongoDB Atlas Dashboard
- **Documentation**: MONGODB_SETUP_GUIDE.md

---

## 🆘 **NEED HELP?**

### **Quick Resources**
- **MongoDB Atlas Dashboard**: https://cloud.mongodb.com
- **MongoDB Documentation**: https://docs.mongodb.com
- **BIT CMS Test Script**: `node test-mongodb.js`
- **Environment Template**: `.env.example`

### **Support Commands**
```bash
# Test MongoDB connection
node test-mongodb.js

# Check environment variables
echo $MONGODB_URI

# Start development server
npm run dev

# Start production server
npm start
```

---

**🗄️ Follow these 10 steps exactly and your BIT CMS will be running with MongoDB in minutes! Each step includes detailed instructions and troubleshooting tips.**
