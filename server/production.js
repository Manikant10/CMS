const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const mockConnectDB = require('./config/db-mock');

// Import routes
const authRoutes = require('./routes/auth');
const noticeRoutes = require('./routes/notices');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/faculty');
const dashboardRoutes = require('./routes/dashboard');
const feeRoutes = require('./routes/fees');
const courseRoutes = require('./routes/courses');
const timetableRoutes = require('./routes/timetable');
const libraryRoutes = require('./routes/library');

const app = express();
const server = http.createServer(app);

// Enhanced Socket.IO setup for production
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com', 'https://www.your-domain.com']
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com', 'https://www.your-domain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Database connection
const initializeDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
      await connectDB();
      console.log('✅ Production MongoDB connected');
    } else {
      await mockConnectDB();
      console.log('✅ Mock database initialized for development');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Real-time connection management
const connectedUsers = new Map();
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);
  
  // Handle user authentication
  socket.on('authenticate', (userData) => {
    connectedUsers.set(socket.id, {
      ...userData,
      socketId: socket.id,
      connectedAt: new Date()
    });
    
    console.log(`✅ User authenticated: ${userData.email} (${userData.role})`);
    
    // Join role-based rooms
    socket.join(`role-${userData.role}`);
    socket.join(`user-${userData.userId}`);
    
    // Notify others about new user
    socket.to(`role-${userData.role}`).emit('user-online', {
      userId: userData.userId,
      name: userData.name,
      role: userData.role
    });
  });

  // Handle room joining for real-time features
  socket.on('join-room', (roomData) => {
    const { room, type } = roomData;
    socket.join(room);
    
    if (!activeRooms.has(room)) {
      activeRooms.set(room, new Set());
    }
    activeRooms.get(room).add(socket.id);
    
    console.log(`📱 User ${socket.id} joined room: ${room}`);
    
    // Notify room members
    socket.to(room).emit('user-joined-room', {
      room,
      user: connectedUsers.get(socket.id)
    });
  });

  // Handle leaving rooms
  socket.on('leave-room', (room) => {
    socket.leave(room);
    if (activeRooms.has(room)) {
      activeRooms.get(room).delete(socket.id);
      if (activeRooms.get(room).size === 0) {
        activeRooms.delete(room);
      }
    }
    
    socket.to(room).emit('user-left-room', {
      room,
      user: connectedUsers.get(socket.id)
    });
  });

  // Real-time notice updates
  socket.on('notice-update', (noticeData) => {
    const { action, notice, targetRole } = noticeData;
    
    // Broadcast to appropriate rooms
    if (targetRole === 'all') {
      io.emit('notice-updated', { action, notice });
    } else {
      io.to(`role-${targetRole}`).emit('notice-updated', { action, notice });
    }
    
    console.log(`📢 Notice ${action}: ${notice.title}`);
  });

  // Real-time attendance updates
  socket.on('attendance-marked', (attendanceData) => {
    const { courseId, date, attendance, facultyId } = attendanceData;
    
    // Notify students in the course
    io.to(`course-${courseId}`).emit('attendance-updated', {
      courseId,
      date,
      attendance,
      markedBy: facultyId
    });
    
    console.log(`📋 Attendance marked for course ${courseId}`);
  });

  // Real-time fee updates
  socket.on('fee-updated', (feeData) => {
    const { studentId, amount, status, type } = feeData;
    
    // Notify specific student
    io.to(`user-${studentId}`).emit('fee-updated', {
      amount,
      status,
      type,
      timestamp: new Date()
    });
    
    // Notify admin users
    io.to('role-admin').emit('fee-updated-admin', {
      studentId,
      amount,
      status,
      type
    });
    
    console.log(`💰 Fee updated for student ${studentId}: ${status}`);
  });

  // Real-time assignment updates
  socket.on('assignment-updated', (assignmentData) => {
    const { courseId, assignment, action } = assignmentData;
    
    // Notify students in the course
    io.to(`course-${courseId}`).emit('assignment-updated', {
      assignment,
      action,
      timestamp: new Date()
    });
    
    // Notify faculty teaching the course
    io.to('role-faculty').emit('assignment-updated-faculty', {
      courseId,
      assignment,
      action
    });
    
    console.log(`📝 Assignment ${action} for course ${courseId}`);
  });

  // Real-time timetable updates
  socket.on('timetable-updated', (timetableData) => {
    const { semester, section, updates } = timetableData;
    
    // Notify affected students
    io.to(`semester-${semester}-section-${section}`).emit('timetable-updated', {
      semester,
      section,
      updates,
      timestamp: new Date()
    });
    
    // Notify all faculty
    io.to('role-faculty').emit('timetable-updated-faculty', {
      updates,
      timestamp: new Date()
    });
    
    console.log(`📅 Timetable updated for ${semester}-${section}`);
  });

  // Real-time chat/messaging
  socket.on('send-message', (messageData) => {
    const { room, message, sender, type } = messageData;
    
    const enhancedMessage = {
      ...message,
      sender,
      type,
      timestamp: new Date(),
      messageId: Date.now().toString()
    };
    
    // Broadcast to room
    io.to(room).emit('new-message', enhancedMessage);
    
    console.log(`💬 Message sent to ${room} by ${sender.name}`);
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { room, user } = data;
    socket.to(room).emit('user-typing', { user, typing: true });
  });

  socket.on('typing-stop', (data) => {
    const { room, user } = data;
    socket.to(room).emit('user-typing', { user, typing: false });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`❌ User disconnected: ${user.email}`);
      
      // Notify others about user leaving
      socket.to(`role-${user.role}`).emit('user-offline', {
        userId: user.userId,
        name: user.name,
        role: user.role
      });
      
      // Clean up user data
      connectedUsers.delete(socket.id);
      
      // Remove from all active rooms
      activeRooms.forEach((users, room) => {
        users.delete(socket.id);
        if (users.size === 0) {
          activeRooms.delete(room);
        }
      });
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/library', libraryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    connectedUsers: connectedUsers.size,
    activeRooms: activeRooms.size,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Real-time stats endpoint
app.get('/api/stats/realtime', (req, res) => {
  res.json({
    connectedUsers: connectedUsers.size,
    activeRooms: Object.fromEntries(activeRooms),
    usersByRole: Array.from(connectedUsers.values()).reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {})
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/web/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'web', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: error.errors
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await initializeDatabase();
  
  server.listen(PORT, () => {
    console.log(`🚀 BIT CMS Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 Server listening on port ${PORT}`);
    console.log(`🔗 Socket.IO enabled for real-time features`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Real-time stats: http://localhost:${PORT}/api/stats/realtime`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer().catch(console.error);

module.exports = { app, io, server };
