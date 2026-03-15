const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
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
      ? [process.env.CORS_ORIGIN || 'https://bit-cms.vercel.app']
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", "ws:", "https://api.cloudinary.com"],
      scriptSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/health' || req.path.startsWith('/static') || req.path.startsWith('/manifest');
  }
});

app.use(limiter);

// Compression middleware
app.use(compression());

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN || 'https://bit-cms.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Body parsing middleware with enhanced limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ success: false, message: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Enhanced database connection with retry logic
const initializeDatabase = async () => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
        await connectDB();
        console.log('✅ Production MongoDB connected');
      } else {
        await mockConnectDB();
        console.log('✅ Mock database initialized for development');
      }
      return; // Success, exit the retry loop
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('❌ All database connection attempts failed. Exiting...');
        process.exit(1);
      }
      
      console.log(`🔄 Retrying database connection in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Enhanced real-time connection management
const connectedUsers = new Map();
const activeRooms = new Map();
const userSessions = new Map(); // Track user sessions

io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);
  
  // Handle user authentication with enhanced validation
  socket.on('authenticate', (userData) => {
    try {
      // Validate user data
      if (!userData || !userData.userId || !userData.email || !userData.role) {
        socket.emit('auth-error', { message: 'Invalid user data' });
        return;
      }
      
      // Store user connection
      connectedUsers.set(socket.id, {
        ...userData,
        socketId: socket.id,
        connectedAt: new Date(),
        lastActivity: new Date(),
        isActive: true
      });
      
      // Track user sessions
      if (!userSessions.has(userData.userId)) {
        userSessions.set(userData.userId, new Set());
      }
      userSessions.get(userData.userId).add(socket.id);
      
      console.log(`✅ User authenticated: ${userData.email} (${userData.role})`);
      
      // Join role-based and user-specific rooms
      socket.join(`role-${userData.role}`);
      socket.join(`user-${userData.userId}`);
      
      // Join semester/section rooms if student
      if (userData.role === 'student' && userData.semester && userData.section) {
        socket.join(`semester-${userData.semester}-section-${userData.section}`);
      }
      
      // Join course rooms if faculty
      if (userData.role === 'faculty' && userData.courses) {
        userData.courses.forEach(courseId => {
          socket.join(`course-${courseId}`);
        });
      }
      
      // Notify others about new user
      socket.to(`role-${userData.role}`).emit('user-online', {
        userId: userData.userId,
        name: userData.name,
        role: userData.role,
        timestamp: new Date()
      });
      
      // Send user their current status
      socket.emit('auth-success', {
        message: 'Authentication successful',
        connectedDevices: userSessions.get(userData.userId)?.size || 1
      });
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      socket.emit('auth-error', { message: 'Authentication failed' });
    }
  });

  // Enhanced room management
  socket.on('join-room', (roomData) => {
    try {
      const { room, type, metadata } = roomData;
      
      if (!room || !type) {
        socket.emit('error', { message: 'Invalid room data' });
        return;
      }
      
      socket.join(room);
      
      if (!activeRooms.has(room)) {
        activeRooms.set(room, new Map());
      }
      
      activeRooms.get(room).set(socket.id, {
        user: connectedUsers.get(socket.id),
        joinedAt: new Date(),
        type,
        metadata
      });
      
      console.log(`📱 User ${socket.id} joined room: ${room} (${type})`);
      
      // Notify room members
      socket.to(room).emit('user-joined-room', {
        room,
        user: connectedUsers.get(socket.id),
        timestamp: new Date()
      });
      
      // Send room info to user
      socket.emit('room-joined', {
        room,
        memberCount: activeRooms.get(room).size,
        type
      });
      
    } catch (error) {
      console.error('❌ Room join error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle leaving rooms
  socket.on('leave-room', (room) => {
    try {
      socket.leave(room);
      if (activeRooms.has(room)) {
        activeRooms.get(room).delete(socket.id);
        if (activeRooms.get(room).size === 0) {
          activeRooms.delete(room);
        }
      }
      
      socket.to(room).emit('user-left-room', {
        room,
        user: connectedUsers.get(socket.id),
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('❌ Room leave error:', error);
    }
  });

  // Enhanced real-time notice updates
  socket.on('notice-update', (noticeData) => {
    try {
      const { action, notice, targetRole, priority } = noticeData;
      
      // Broadcast to appropriate rooms
      if (targetRole === 'all') {
        io.emit('notice-updated', { action, notice, priority, timestamp: new Date() });
      } else {
        io.to(`role-${targetRole}`).emit('notice-updated', { action, notice, priority, timestamp: new Date() });
      }
      
      // Log notice activity
      console.log(`📢 Notice ${action}: ${notice.title} (Target: ${targetRole})`);
      
    } catch (error) {
      console.error('❌ Notice update error:', error);
    }
  });

  // Enhanced real-time attendance updates
  socket.on('attendance-marked', (attendanceData) => {
    try {
      const { courseId, date, attendance, facultyId, students } = attendanceData;
      
      // Notify students in the course
      io.to(`course-${courseId}`).emit('attendance-updated', {
        courseId,
        date,
        attendance,
        markedBy: facultyId,
        timestamp: new Date()
      });
      
      // Notify specific students
      if (students && students.length > 0) {
        students.forEach(studentId => {
          io.to(`user-${studentId}`).emit('personal-attendance-updated', {
            courseId,
            date,
            attendance: attendance.find(a => a.studentId === studentId),
            timestamp: new Date()
          });
        });
      }
      
      console.log(`📋 Attendance marked for course ${courseId} on ${date}`);
      
    } catch (error) {
      console.error('❌ Attendance update error:', error);
    }
  });

  // Enhanced real-time fee updates
  socket.on('fee-updated', (feeData) => {
    try {
      const { studentId, amount, status, type, transactionId } = feeData;
      
      // Notify specific student
      io.to(`user-${studentId}`).emit('fee-updated', {
        amount,
        status,
        type,
        transactionId,
        timestamp: new Date()
      });
      
      // Notify admin users
      io.to('role-admin').emit('fee-updated-admin', {
        studentId,
        amount,
        status,
        type,
        transactionId,
        timestamp: new Date()
      });
      
      console.log(`💰 Fee updated for student ${studentId}: ${status} (${type})`);
      
    } catch (error) {
      console.error('❌ Fee update error:', error);
    }
  });

  // Enhanced real-time assignment updates
  socket.on('assignment-updated', (assignmentData) => {
    try {
      const { courseId, assignment, action, dueDate } = assignmentData;
      
      // Notify students in the course
      io.to(`course-${courseId}`).emit('assignment-updated', {
        assignment,
        action,
        dueDate,
        timestamp: new Date()
      });
      
      // Notify faculty teaching the course
      io.to('role-faculty').emit('assignment-updated-faculty', {
        courseId,
        assignment,
        action,
        timestamp: new Date()
      });
      
      console.log(`📝 Assignment ${action} for course ${courseId}`);
      
    } catch (error) {
      console.error('❌ Assignment update error:', error);
    }
  });

  // Enhanced real-time timetable updates
  socket.on('timetable-updated', (timetableData) => {
    try {
      const { semester, section, updates, affectedCourses } = timetableData;
      
      // Notify affected students
      io.to(`semester-${semester}-section-${section}`).emit('timetable-updated', {
        semester,
        section,
        updates,
        timestamp: new Date()
      });
      
      // Notify all faculty
      io.to('role-faculty').emit('timetable-updated-faculty', {
        semester,
        section,
        updates,
        affectedCourses,
        timestamp: new Date()
      });
      
      console.log(`📅 Timetable updated for ${semester}-${section}`);
      
    } catch (error) {
      console.error('❌ Timetable update error:', error);
    }
  });

  // Enhanced real-time chat/messaging
  socket.on('send-message', (messageData) => {
    try {
      const { room, message, sender, type, attachments } = messageData;
      
      const enhancedMessage = {
        ...message,
        sender,
        type,
        attachments: attachments || [],
        timestamp: new Date(),
        messageId: `${socket.id}-${Date.now()}`,
        edited: false,
        deleted: false
      };
      
      // Broadcast to room
      io.to(room).emit('new-message', enhancedMessage);
      
      console.log(`💬 Message sent to ${room} by ${sender.name}`);
      
    } catch (error) {
      console.error('❌ Message send error:', error);
    }
  });

  // Enhanced typing indicators
  socket.on('typing-start', (data) => {
    const { room, user } = data;
    socket.to(room).emit('user-typing', { user, typing: true, timestamp: new Date() });
  });

  socket.on('typing-stop', (data) => {
    const { room, user } = data;
    socket.to(room).emit('user-typing', { user, typing: false, timestamp: new Date() });
  });

  // Handle user activity updates
  socket.on('activity-update', (activity) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.lastActivity = new Date();
      user.currentActivity = activity;
    }
  });

  // Handle disconnection with enhanced cleanup
  socket.on('disconnect', (reason) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`❌ User disconnected: ${user.email} (${reason})`);
      
      // Notify others about user leaving
      socket.to(`role-${user.role}`).emit('user-offline', {
        userId: user.userId,
        name: user.name,
        role: user.role,
        timestamp: new Date()
      });
      
      // Clean up user data
      connectedUsers.delete(socket.id);
      
      // Clean up user sessions
      if (userSessions.has(user.userId)) {
        userSessions.get(user.userId).delete(socket.id);
        if (userSessions.get(user.userId).size === 0) {
          userSessions.delete(user.userId);
        }
      }
      
      // Remove from all active rooms
      activeRooms.forEach((roomMembers, room) => {
        if (roomMembers.has(socket.id)) {
          roomMembers.delete(socket.id);
          if (roomMembers.size === 0) {
            activeRooms.delete(room);
          }
        }
      });
    }
  });

  // Enhanced error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// API Routes with enhanced error handling
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/library', libraryRoutes);

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '2.0.0',
    connectedUsers: connectedUsers.size,
    activeRooms: activeRooms.size,
    userSessions: userSessions.size,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    database: process.env.MONGODB_URI ? 'MongoDB' : 'Mock'
  };
  
  res.status(200).json(health);
});

// Enhanced real-time stats endpoint
app.get('/api/stats/realtime', (req, res) => {
  const stats = {
    connectedUsers: connectedUsers.size,
    activeRooms: Object.fromEntries(
      Array.from(activeRooms.entries()).map(([room, members]) => [
        room,
        {
          memberCount: members.size,
          members: Array.from(members.values()).map(m => ({
            userId: m.user?.userId,
            name: m.user?.name,
            joinedAt: m.joinedAt
          }))
        }
      ])
    ),
    usersByRole: Array.from(connectedUsers.values()).reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {}),
    userSessions: Object.fromEntries(
      Array.from(userSessions.entries()).map(([userId, sessions]) => [
        userId,
        sessions.size
      ])
    ),
    timestamp: new Date()
  };
  
  res.json(stats);
});

// Serve static files in production with PWA support
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'web', 'build'), {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));
  
  // PWA manifest and service worker
  app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'web', 'build', 'manifest.json'));
  });
  
  app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'web', 'build', 'service-worker.js'));
  });
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'web', 'build', 'index.html'));
  });
}

// Enhanced error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: error.errors
    });
  }
  
  if (error.name === 'UnauthorizedError' || error.status === 401) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Enhanced 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server with enhanced configuration
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await initializeDatabase();
  
  server.listen(PORT, () => {
    console.log(`🚀 BIT CMS Server v2.0.0 running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📡 Server listening on port ${PORT}`);
    console.log(`🔗 Socket.IO enabled for real-time features`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Real-time stats: http://localhost:${PORT}/api/stats/realtime`);
    console.log(`📱 PWA enabled with service worker`);
    console.log(`🔒 Security features enabled`);
  });
};

// Enhanced graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`🛑 ${signal} received, shutting down gracefully`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close Socket.IO connections
    io.close(() => {
      console.log('✅ Socket.IO server closed');
      process.exit(0);
    });
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Enhanced error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

startServer().catch(console.error);

module.exports = { app, io, server };
