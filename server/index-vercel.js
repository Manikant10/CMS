const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');

['JWT_SECRET', 'MONGODB_URI'].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
});

connectDB().catch((error) => {
  console.error('Initial MongoDB connection failed:', error.message);
});

const app = express();
// Vercel runs behind a proxy and forwards client IP via X-Forwarded-For.
app.set('trust proxy', 1);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000'];
const vercelCmsPreviewPattern = /^https:\/\/cms-[a-z0-9-]+-manikant10s-projects\.vercel\.app$/i;
const vercelCmsAliasPattern = /^https:\/\/cms-[a-z0-9-]+\.vercel\.app$/i;

const isAllowedOrigin = (origin) => allowedOrigins.includes(origin)
  || vercelCmsPreviewPattern.test(origin)
  || vercelCmsAliasPattern.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please wait before trying again.' },
});

app.use(globalLimiter);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure MongoDB is ready for all API requests to avoid Mongoose buffer timeouts.
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api')) return next();
  try {
    await connectDB();
    return next();
  } catch (error) {
    console.error('MongoDB unavailable for request:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again in a moment.',
    });
  }
});

// Real-time events are not available in Vercel serverless functions.
app.use((req, _res, next) => {
  req.io = null;
  next();
});

app.use('/api/auth', authLimiter, require('./routes/auth'));
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

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'BIT CMS Server Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    runtime: 'vercel-serverless',
  });
});

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error',
  });
});

module.exports = app;
