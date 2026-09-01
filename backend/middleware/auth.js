const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'websitescout_jwt_super_secret_key_2026';

// Required Authentication Middleware
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please provide a valid Bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
};

// Optional Authentication Middleware (attaches user if present, proceeds as guest if not)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid tokens for optional routes and proceed as guest
  }
  next();
};

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
