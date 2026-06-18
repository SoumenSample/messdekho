// ============================================
// PG ROUTES
// ============================================

const express = require('express');
const router = express.Router();

// Import controller
const pgController = require('../controllers/pgController');

// Import middleware
const { protect, optionalProtect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { uploadMultiple, uploadMultipleImagesToCloudinary, handleUploadError } = require('../middleware/upload');
const { validate, createPGSchema, updatePGSchema } = require('../utils/validation');

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/pg - Get all approved PGs (with search, filter, pagination)
// Query: city, search, page, limit, sort
router.get('/', optionalProtect, pgController.getAllPGs);

// ============================================
// PROTECTED ROUTES (Owner + Admin)
// ============================================

// GET /api/pg/owner/my - Get owner's PGs (MUST come before /:id wildcard)
router.get('/owner/my', protect, authorize('owner'), pgController.getOwnerPGs);

// GET /api/pg/:id - Get single PG details (MUST come after /owner/my)
router.get('/:id', pgController.getPG);

// POST /api/pg - Create new PG (Owner only)
// Body: title, description, price, location, city, address, roomsAvailable, type, occupancy, facilities
// Files: images (array)
router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  uploadMultiple,
  handleUploadError,
  validate(createPGSchema),
  uploadMultipleImagesToCloudinary,
  pgController.createPG
);

// PUT /api/pg/:id - Update PG (Owner only)
router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  uploadMultiple,
  handleUploadError,
  validate(updatePGSchema),
  uploadMultipleImagesToCloudinary,
  pgController.updatePG
);

// DELETE /api/pg/:id - Delete PG (Owner only)
router.delete(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  pgController.deletePG
);

module.exports = router;
