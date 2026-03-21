const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createRealAdmin = async () => {
  try {
    // Use the correct MongoDB connection string
    await mongoose.connect('mongodb+srv://bitadmin_110:Mani@cms.trgugqf.mongodb.net/test?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');
    
    const User = require('./server/models/User');
    
    // Delete existing admin user if exists
    await User.deleteOne({ email: 'bitadmin_110' });
    
    // Create new admin user with correct credentials
    const admin = await User.create({
      email: 'bitadmin_110',
      password: 'Mani',
      role: 'admin',
      isActive: true
    });
    
    console.log('✅ Real admin user created successfully');
    console.log('Email: bitadmin_110');
    console.log('Password: Mani');
    console.log('Role: admin');
    
    // Test the password
    const testAdmin = await User.findOne({ email: 'bitadmin_110' }).select('+password');
    const isMatch = await testAdmin.matchPassword('Mani');
    console.log('Password test result:', isMatch ? '✅ Success' : '❌ Failed');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

createRealAdmin();
