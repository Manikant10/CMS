const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB with your credentials
    await mongoose.connect('mongodb+srv://bitadmin_110:Mani110@cms.trgugqf.mongodb.net/test?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');
    
    const User = require('./server/models/User');
    
    // Delete existing admin user
    await User.deleteOne({ email: 'bitadmin_110' });
    
    // Create new admin user with your credentials
    const hashedPassword = await bcrypt.hash('Mani110', 10);
    
    const admin = await User.create({
      email: 'bitadmin_110',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });
    
    console.log('✅ Real admin user created in database');
    console.log('Email: bitadmin_110');
    console.log('Password: Mani110 (hashed)');
    
    // Test the login
    const testUser = await User.findOne({ email: 'bitadmin_110' }).select('+password');
    const isMatch = await bcrypt.compare('Mani110', testUser.password);
    console.log('Password test result:', isMatch ? '✅ Success' : '❌ Failed');
    
    if (isMatch) {
      const token = testUser.getSignedJwtToken();
      console.log('✅ Login test successful');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

createAdminUser();
