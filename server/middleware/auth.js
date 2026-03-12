const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock data helper
const getMockData = () => global.mockDB || {};

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // Check if using mock data
    if (global.mockDB && token.startsWith('mock-token-')) {
      // For mock tokens, we'll extract user info from a simple approach
      // In a real app, this would be proper JWT verification
      const mockData = getMockData();
      
      // For demo purposes, we'll assume the first user for any mock token
      // In production, you'd want proper token handling
      req.user = mockData.users[0]; // Default to admin for demo
      return next();
    }

    // Original JWT verification for MongoDB
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
