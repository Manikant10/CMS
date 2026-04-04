const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — require a valid Bearer JWT.
 * The mock-token path has been removed; all auth now goes through
 * real JWT verification even in development.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized — user not found' });
    }

    if (!user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: 'Account has been deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Session expired — please log in again'
        : 'Not authorized — invalid token';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Restrict access to specific roles.
 * Usage: router.get('/admin-only', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — role '${req.user?.role}' is not permitted`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
