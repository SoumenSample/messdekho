// ============================================
// ADMIN ROUTES
// ============================================

const express = require('express');
const router = express.Router();

// Import controller
const adminController = require('../controllers/adminController');

// Import middleware
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// ============================================
// ALL ADMIN ROUTES PROTECTED
// ============================================

// GET /api/admin/pgs - Get all PGs (including unapproved)
// Query: status (all/approved/unapproved), city, page, limit
router.get(
  '/pgs',
  protect,
  authorize('admin'),
  adminController.getAllPGs
);

// PUT /api/admin/pg/:id/approve - Approve PG
router.put(
  '/pg/:id/approve',
  protect,
  authorize('admin'),
  adminController.approvePG
);

// DELETE /api/admin/pg/:id/reject - Reject PG
router.delete(
  '/pg/:id/reject',
  protect,
  authorize('admin'),
  adminController.rejectPG
);

// ============================================
// USER MANAGEMENT
// ============================================

// GET /api/admin/users - Get all users
// Query: role, status (active/inactive), page, limit
router.get(
  '/users',
  protect,
  authorize('admin'),
  adminController.getAllUsers
);

// DELETE /api/admin/user/:id - Delete user
router.delete(
  '/user/:id',
  protect,
  authorize('admin'),
  adminController.deleteUser
);

// PUT /api/admin/user/:id/deactivate - Deactivate user
router.put(
  '/user/:id/deactivate',
  protect,
  authorize('admin'),
  adminController.deactivateUser
);

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

// GET /api/admin/stats - Get dashboard statistics
router.get(
  '/stats',
  protect,
  authorize('admin'),
  adminController.getDashboardStats
);

// GET /api/admin/bookings - Get all bookings
// Query: status, page, limit
router.get(
  '/bookings',
  protect,
  authorize('admin'),
  adminController.getAllBookings
);

module.exports = router;
