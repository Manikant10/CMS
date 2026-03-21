const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testLogin = async () => {
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
    console.log('Is active:', admin.isActive);
    console.log('Role:', admin.role);
    
    // Test password matching
    const testPasswords = ['password', 'Bitadmin@1122', 'admin', '123456'];
    
    for (const testPass of testPasswords) {
      const isMatch = await admin.matchPassword(testPass);
      console.log(`Password "${testPass}" matches: ${isMatch}`);
      
      if (isMatch) {
        console.log('✅ Correct password found:', testPass);
        
        // Generate token to test JWT
        const token = admin.getSignedJwtToken();
        console.log('Generated token:', token);
        break;
      }
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLogin();
