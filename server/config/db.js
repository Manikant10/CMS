const mongoose = require('mongoose');

let cached = global.__mongooseCache;
if (!cached) {
  cached = global.__mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
        cached.promise = null;
        throw error;
      });
    }

    const conn = await cached.promise;
    cached.conn = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    throw error;
  }

  // Register listeners once to avoid duplicates in serverless invocations.
  if (!mongoose.connection.listeners('disconnected').length) {
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      cached.conn = null;
      cached.promise = null;
    });
  }

  if (!mongoose.connection.listeners('error').length) {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
    });
  }

  return cached.conn;
};

module.exports = connectDB;
