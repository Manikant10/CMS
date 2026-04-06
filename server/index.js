const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const path       = require('path');
const http       = require('http');
const rateLimit  = require('express-rate-limit');
const { Server } = require('socket.io');
require('dotenv').config();

// ─── Env validation ───────────────────────────────────────────────────────────
['JWT_SECRET', 'MONGODB_URI'].forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
});

const connectDB = require('./config/db');
connectDB();

const app    = express();
const server = http.createServer(app);
// Required behind reverse proxies (Vercel/Nginx) for correct rate-limit client IP detection.
app.set('trust proxy', 1);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
});

// ─── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20, // stricter for auth endpoints
  message: { success: false, message: 'Too many login attempts. Please wait before trying again.' },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(globalLimiter);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to every request
app.use((req, _res, next) => { req.io = io; next(); });

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, require('./routes/auth'));
app.use('/api/notices',    require('./routes/notices'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/timetable',  require('./routes/timetable'));
app.use('/api/fees',       require('./routes/fees'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/faculty',    require('./routes/faculty'));
app.use('/api/courses',    require('./routes/courses'));
app.use('/api/exams',      require('./routes/exams'));
app.use('/api/results',    require('./routes/results'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/approvals',  require('./routes/approvals'));
app.use('/api/admin',      require('./routes/admin'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:      'ok',
    message:     'BIT CMS Server Running',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Global error handler ─────────────────────────────────────────────────────
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

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;
server.listen(PORT, () => {
  console.log(`✅ BIT CMS Server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} — shutting down...`);
  server.close(() => { console.log('Server closed.'); process.exit(0); });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
