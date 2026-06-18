// ============================================
// ROLE-BASED ACCESS CONTROL MIDDLEWARE
// ============================================

const { AppError } = require('./errorHandler');

const safeId = (value) => {
  if (value == null) return '';
  if (typeof value === 'object') {
    if (value._id != null) return safeId(value._id);
    return String(value);
  }
  return String(value);
};

const sameId = (left, right) => safeId(left) === safeId(right);

// Check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 [AUTHORIZE] Checking role:', {
      requiredRoles: roles,
      userRole: req.user?.role,
      userId: req.user?._id,
      userName: req.user?.name,
      fullUser: req.user
    });

    if (!req.user) {
      console.log('❌ [AUTHORIZE] No req.user found');
      return next(new AppError('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ [AUTHORIZE] Role mismatch:', {
        requiredRoles: roles,
        userRole: req.user.role,
        match: roles.includes(req.user.role)
      });
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`,
          403
        )
      );
    }

    console.log('✅ [AUTHORIZE] Role authorized');
    next();
  };
};

// Check if user is owner of specific resource
const isOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    // For route with :id parameter
    if (req.params.id) {
      const PG = require('../models/PG');
      const pg = await PG.findById(req.params.id);

      if (!pg) {
        return next(new AppError('Resource not found', 404));
      }

      if (!sameId(pg?.owner, req.user?._id) && req.user?.role !== 'admin') {
        return next(new AppError('Not authorized to access this resource', 403));
      }
    }

    next();

  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorize,
  isOwner
};
