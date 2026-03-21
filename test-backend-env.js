// Test script to verify environment variables
require('dotenv').config();

console.log('Environment Variables Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

if (process.env.MONGODB_URI) {
  console.log('MongoDB URI length:', process.env.MONGODB_URI.length);
  console.log('MongoDB URI starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');
}
