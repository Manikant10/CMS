const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./server/models/User');
    
    // Find admin user
    let admin = await User.findOne({ email: 'Admin.bit' });
    
    if (!admin) {
      // Create admin user if not exists
      admin = await User.create({
        email: 'Admin.bit',
        password: 'password',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin user created');
    } else {
      // Update password
      admin.password = 'password';
      await admin.save();
      console.log('✅ Admin password updated');
    }
    
    // Test the password
    const testAdmin = await User.findOne({ email: 'Admin.bit' }).select('+password');
    const isMatch = await testAdmin.matchPassword('password');
    console.log('Password test result:', isMatch ? '✅ Success' : '❌ Failed');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

resetAdminPassword();
