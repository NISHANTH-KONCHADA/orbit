const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ── Verify JWT ────────────────────────────────────────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized — invalid token');
  }
});

// ── Role-Based Guard ──────────────────────────────────────────────────────────
// Usage: requireRole('Admin', 'Project Manager')
const requireRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access denied — requires role: ${roles.join(' or ')}`);
    }

    next();
  });

module.exports = { protect, requireRole };
