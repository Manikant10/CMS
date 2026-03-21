const mongoose = require('mongoose');
require('dotenv').config();

// Admin credentials — change these before running
const ADMIN_EMAIL = 'bitadmin_110';
const ADMIN_PASSWORD = 'BitAdmin@2024';

const createRealAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set in .env');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const User = require('./server/models/User');

    // Delete existing admin if present
    await User.deleteOne({ email: ADMIN_EMAIL });

    // Create admin — password is auto-hashed by the User model pre-save hook
    await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
    });

    // Verify password hash works
    const saved = await User.findOne({ email: ADMIN_EMAIL }).select('+password');
    const isMatch = await saved.matchPassword(ADMIN_PASSWORD);

    if (isMatch) {
      console.log('✅ Admin created successfully');
      console.log('   Username:', ADMIN_EMAIL);
      console.log('   Password:', ADMIN_PASSWORD);
    } else {
      console.error('❌ Password verification failed');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createRealAdmin();
