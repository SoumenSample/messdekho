// ============================================
// AUTH ROUTES
// ============================================

const express = require('express');
const router = express.Router();

// Import controller
const authController = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const {
  loginSchema,
  updateProfileSchema
} = require('../utils/validation');

// ============================================
// PUBLIC ROUTES
// ============================================

// POST /api/auth/register - User registration
// Body: name, email, password, role
// Registration validation is handled inside the controller for clearer errors.
router.post('/register', authController.register);

// POST /api/auth/login - User login
// Body: email, password
router.post('/login', validate(loginSchema), authController.login);

// ============================================
// PROTECTED ROUTES
// ============================================

// GET /api/auth/me - Get current logged-in user
router.get('/me', protect, authController.getCurrentUser);

// PUT /api/auth/profile - Update profile
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);

// POST /api/auth/logout - Logout
router.post('/logout', protect, authController.logout);

module.exports = router;
