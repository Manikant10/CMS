const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      connectTimeoutMS: 30000,        // Increased to 30 seconds
      maxPoolSize: 10,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    global.fallbackMode = true;
    throw error; // Re-throw to trigger fallback mode
  }
};

module.exports = connectDB;
