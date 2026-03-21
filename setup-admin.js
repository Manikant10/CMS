const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./server/models/User');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'bitadmin_110' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }
    
    // Create admin user
    const admin = await User.create({
      email: 'bitadmin_110',
      password: 'Mani',
      role: 'admin',
      isActive: true
    });
    
    console.log('✅ Admin user created successfully');
    console.log('Email: bitadmin_110');
    console.log('Password: Mani');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

setupAdmin();
