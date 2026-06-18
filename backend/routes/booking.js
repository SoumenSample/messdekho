// ============================================
// BOOKING ROUTES
// ============================================

const express = require('express');
const router = express.Router();

// Import controller
const bookingController = require('../controllers/bookingController');

// Import middleware
const { protect } = require('../middleware/auth');
const { authorize, isOwner } = require('../middleware/roleAuth');
const { validate, createBookingSchema, addReviewSchema, cancelBookingSchema } = require('../utils/validation');

// ============================================
// USER ROUTES
// ============================================

// POST /api/bookings - Create booking (User only)
// Body: pgId, checkInDate, checkOutDate, roomsBooked, guestName, guestEmail, guestPhone, specialRequirements
router.post(
  '/',
  protect,
  authorize('user'),
  validate(createBookingSchema),
  bookingController.createBooking
);

// GET /api/bookings - Get user's bookings
// Query: status, page, limit
router.get(
  '/',
  protect,
  authorize('user'),
  bookingController.getUserBookings
);

// GET /api/bookings/:id - Get booking details
router.get(
  '/:id',
  protect,
  bookingController.getBookingDetails
);

// PUT /api/bookings/:id/cancel - Cancel booking
// Body: reason
router.put(
  '/:id/cancel',
  protect,
  authorize('user'),
  validate(cancelBookingSchema),
  bookingController.cancelBooking
);

// POST /api/bookings/:id/review - Add review after booking (User)
// Body: rating, review
router.post(
  '/:id/review',
  protect,
  authorize('user'),
  validate(addReviewSchema),
  bookingController.addReview
);

// ============================================
// OWNER ROUTES
// ============================================

// GET /api/bookings/owner/my - Get owner's bookings for their PGs
// Query: status, page, limit
router.get(
  '/owner/my',
  protect,
  authorize('owner'),
  bookingController.getOwnerBookings
);

// PUT /api/bookings/:id/confirm - Confirm booking (Owner)
router.put(
  '/:id/confirm',
  protect,
  authorize('owner', 'admin'),
  bookingController.confirmBooking
);

// PUT /api/bookings/:id/approve - Approve booking (Owner)
router.put(
  '/:id/approve',
  protect,
  authorize('owner', 'admin'),
  bookingController.approveBooking
);

// PUT /api/bookings/:id/reject - Reject booking (Owner)
// Body: reason (optional)
router.put(
  '/:id/reject',
  protect,
  authorize('owner', 'admin'),
  bookingController.rejectBooking
);

module.exports = router;
