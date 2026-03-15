# 🚀 BIT CMS Server Startup Guide

## 🎯 **Quick Start Instructions**

---

## 📋 **Method 1: Double-Click (Easiest)**

### **Start Server**
1. **Double-click**: `start-server.bat` file
2. **Wait for**: Server startup messages
3. **Look for**: "BIT CMS Server running on port 5000"

---

## 📋 **Method 2: Command Line**

### **Open Command Prompt**
1. **Press**: `Win + R`
2. **Type**: `cmd`
3. **Press**: Enter

### **Navigate and Start**
```bash
cd c:\Users\manic\bit-cms\server
node index.js
```

---

## 📋 **Method 3: PowerShell**

### **Open PowerShell**
1. **Press**: `Win + X`
2. **Select**: "Windows PowerShell"
3. **Run commands**:
```powershell
cd c:\Users\manic\bit-cms\server
node index.js
```

---

## ✅ **Expected Success Output**

```
(node:12345) [MONGODB DRIVER] Warning: useNewUrlParser is deprecated...
(node:12345) [MONGODB DRIVER] Warning: useUnifiedTopology is deprecated...
✅ MongoDB Connected: ac-shujici-shard-00-00.trguqf.mongodb.net
🌱 Seeding initial data...
✅ Initial data seeded successfully
BIT CMS Server running on port 5000
```

---

## 🌐 **Access Your Application**

### **After Server Starts**
1. **Backend API**: http://localhost:5000
2. **Health Check**: http://localhost:5000/api/health
3. **Start Frontend**: Open new terminal and run:
   ```bash
   cd c:\Users\manic\bit-cms\client\web
   npm start
   ```
4. **Frontend**: http://localhost:3000

---

## 🔐 **Login Credentials**

### **Default Users**
- **Admin**: `Admin.bit` / `Bitadmin@1122`
- **Faculty**: `faculty@bit.edu` / `faculty123`
- **Student**: `student@bit.edu` / `student123`

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Port 5000 Already in Use**
```bash
# Kill existing Node processes
taskkill /f /im node.exe

# Then start server again
node index.js
```

#### **MongoDB Connection Error**
```
❌ MongoDB Connection Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: This means it's trying to connect to local MongoDB. Your .env file should have the MongoDB Atlas connection string.

#### **Module Not Found**
```
Error: Cannot find module 'express'
```
**Solution**: Install dependencies
```bash
npm install
```

#### **Environment Variables Not Found**
```
MONGODB_URI not found
```
**Solution**: Ensure .env file exists in server directory
```bash
copy c:\Users\manic\bit-cms\.env c:\Users\manic\bit-cms\server\.env
```

---

## 📊 **Server Status**

### **Check if Server is Running**
1. **Open browser**: http://localhost:5000/api/health
2. **Should return**: 
```json
{
  "success": true,
  "message": "Server is running"
}
```

### **Check MongoDB Connection**
```bash
node test-mongodb.js
```

---

## 🔄 **Restart Server**

### **Stop and Restart**
1. **Press**: `Ctrl + C` in server terminal
2. **Wait**: For server to stop
3. **Start again**: `node index.js`

---

## 📱 **Mobile Access**

### **From Mobile Device**
1. **Find your PC IP**: `ipconfig` (look for IPv4 Address)
2. **Access**: `http://YOUR_PC_IP:5000`
3. **Frontend**: `http://YOUR_PC_IP:3000`

---

## 🎉 **Success Indicators**

### ✅ **Server Started Successfully When:**
- ✅ MongoDB connection shows "Connected Successfully"
- ✅ Initial data seeded successfully
- ✅ Server shows "BIT CMS Server running on port 5000"
- ✅ Health check returns success
- ✅ Frontend can connect to backend

### ✅ **Ready to Use When:**
- ✅ Backend server is running
- ✅ Frontend server is running
- ✅ Login page loads
- ✅ Users can authenticate
- ✅ Dashboard loads correctly

---

## 🆘 **Need Help?**

### **Quick Commands**
```bash
# Check server status
curl http://localhost:5000/api/health

# Test MongoDB connection
node test-mongodb.js

# Install dependencies
npm install

# Kill processes
taskkill /f /im node.exe
```

### **Support Files**
- **start-server.bat** - Double-click to start
- **test-mongodb.js** - Test database connection
- **.env** - Environment configuration
- **MONGODB_SETUP_GUIDE.md** - Database setup

---

**🚀 Your BIT CMS server is ready to start! Use any of the methods above to get your application running with MongoDB.**
