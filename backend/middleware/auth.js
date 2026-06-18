// ============================================
// JWT AUTHENTICATION MIDDLEWARE
// ============================================

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const User = require('../models/User');

// Verify JWT token and attach user to request
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      console.log('❌ [PROTECT] No token found in Authorization header');
      return next(new AppError('Not authorized to access this route', 401));
    }

    console.log('🔓 [PROTECT] Token found, verifying...');

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔓 [PROTECT] Token decoded:', decoded);

      // Get user from token
      const user = await User.findById(decoded.id);
      console.log('🔓 [PROTECT] User fetched:', {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        isActive: user?.isActive
      });

      if (!user) {
        console.log('❌ [PROTECT] User not found in database');
        return next(new AppError('User no longer exists', 404));
      }

      // Check if user is active
      if (!user.isActive) {
        console.log('❌ [PROTECT] User account is deactivated');
        return next(new AppError('Your account has been deactivated', 403));
      }

      // Attach user to request object
      req.user = user;
      console.log('✅ [PROTECT] User authenticated and attached to req.user');
      next();

    } catch (error) {
      console.log('❌ [PROTECT] Token verification failed:', error.message);
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired', 401));
      }
      return next(new AppError('Not authorized to access this route', 401));
    }

  } catch (error) {
    console.log('❌ [PROTECT] Unexpected error:', error);
    next(error);
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Optional authentication - doesn't fail if no token
const optionalProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Silently fail for optional auth
      }
    }
    next();

  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  generateToken,
  optionalProtect
};
