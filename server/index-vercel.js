const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB Database (with error handling)
const connectDB = async () => {
  try {
    const connectDB = require('./config/db-clean');
    await connectDB();
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.log('⚠️ MongoDB connection failed, using fallback mode');
    global.fallbackMode = true;
  }
};

// Start connection (don't wait for it)
connectDB();

const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: ['https://bit-1234.vercel.app', 'http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/results', require('./routes/results'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BIT CMS Server Running on Vercel' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Export for Vercel (production)
module.exports = app;
