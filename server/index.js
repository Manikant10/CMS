const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Use mock database for demo purposes
console.log('Using Mock Database for demo...');
const connectDB = require('./config/db-mock');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for now
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Pass io to routes
app.use('/api/notices', (req, res, next) => {
  req.io = io;
  next();
}, require('./routes/notices'));

app.use('/api/attendance', (req, res, next) => {
  req.io = io;
  next();
}, require('./routes/attendance'));

app.use('/api/timetable', (req, res, next) => {
  req.io = io;
  next();
}, require('./routes/timetable'));

app.use('/api/fees', (req, res, next) => {
  req.io = io;
  next();
}, require('./routes/fees'));

app.use('/api/students', (req, res, next) => {
  req.io = io;
  next();
}, require('./routes/students'));

app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/results', require('./routes/results'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BIT CMS Server Running' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`BIT CMS Server running on port ${PORT}`);
});
