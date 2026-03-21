const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testAuth = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find admin user
    const User = require('./server/models/User');
    const admin = await User.findOne({ email: 'Admin.bit' }).select('+password');
    
    if (!admin) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', admin.email);
    console.log('Password hash:', admin.password);
    
    // Test password matching
    const testPasswords = ['password', 'Bitadmin@1122', 'admin'];
    
    for (const testPass of testPasswords) {
      const isMatch = await admin.matchPassword(testPass);
      console.log(`Password "${testPass}" matches: ${isMatch}`);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testAuth();
