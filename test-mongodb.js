require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📋 Connection String:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.log('💡 Please set up your .env file with your MongoDB connection string');
      console.log('📖 Follow MONGODB_SETUP_GUIDE.md for instructions');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error(`   Error: ${error.message}`);
    console.error('   Please check:');
    console.error('   1. MongoDB URI is correct');
    console.error('   2. Network access is configured');
    console.error('   3. Database user has permissions');
    console.error('   4. MongoDB Atlas cluster is running');
  }
};

testConnection();
